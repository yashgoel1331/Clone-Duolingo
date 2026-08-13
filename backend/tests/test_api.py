import json
from collections.abc import Iterator
from datetime import UTC, datetime
from sqlite3 import Connection as SQLite3Connection
from typing import Any

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event, select
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from app.api.dependencies import get_now
from app.db.base import Base
from app.db.session import get_db
from app.main import app
from app.models import User
from app.seed import seed_database

NOW = datetime(2026, 8, 13, 12, 0, tzinfo=UTC)


@pytest.fixture
def api() -> Iterator[tuple[TestClient, Session]]:
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    @event.listens_for(engine, "connect")
    def enable_foreign_keys(dbapi_connection: Any, connection_record: Any) -> None:
        if isinstance(dbapi_connection, SQLite3Connection):
            dbapi_connection.execute("PRAGMA foreign_keys=ON")

    Base.metadata.create_all(engine)
    session = Session(engine, expire_on_commit=False)
    seed_database(session, seeded_at=NOW)

    def override_database() -> Iterator[Session]:
        yield session

    app.dependency_overrides[get_db] = override_database
    app.dependency_overrides[get_now] = lambda: NOW
    with TestClient(app) as client:
        yield client, session

    app.dependency_overrides.clear()
    session.close()
    Base.metadata.drop_all(engine)
    engine.dispose()


def _food_lesson_id(path_response: dict[str, Any]) -> int:
    for unit in path_response["units"]:
        for skill in unit["skills"]:
            if skill["title"] == "Food":
                return skill["lessons"][0]["id"]
    raise AssertionError("Food lesson was not returned by the path API.")


def _directions_lesson_id(path_response: dict[str, Any]) -> int:
    for unit in path_response["units"]:
        for skill in unit["skills"]:
            if skill["title"] == "Directions":
                return skill["lessons"][0]["id"]
    raise AssertionError("Directions lesson was not returned by the path API.")


def _skill_lessons(path_response: dict[str, Any], skill_title: str) -> list[int]:
    for unit in path_response["units"]:
        for skill in unit["skills"]:
            if skill["title"] == skill_title:
                return [lesson["id"] for lesson in skill["lessons"]]
    raise AssertionError(f"{skill_title} lessons were not returned by the path API.")


def test_read_apis_return_seeded_learner_path_profile_and_leaderboard(
    api: tuple[TestClient, Session],
) -> None:
    client, _ = api

    me = client.get("/api/me")
    profile = client.get("/api/me/profile")
    path = client.get("/api/path")
    leaderboard = client.get("/api/leaderboard")

    assert me.status_code == 200
    assert me.json()["username"] == "learner"
    assert me.json()["stats"]["hearts"] == 4
    assert profile.status_code == 200
    assert profile.json()["completed_skills"] == 2
    assert profile.json()["completed_lessons"] == 4
    assert path.status_code == 200
    assert len(path.json()["units"]) == 4
    assert [skill["status"] for unit in path.json()["units"] for skill in unit["skills"]] == [
        "completed",
        "completed",
        "available",
        "locked",
        "locked",
        "locked",
        "locked",
        "locked",
    ]
    assert leaderboard.status_code == 200
    assert leaderboard.json()["entries"][0]["display_name"] == "Maria"
    assert leaderboard.json()["entries"][-1]["is_current_user"] is True


def test_lesson_flow_validates_answers_updates_skill_progress_and_awards_xp_once(
    api: tuple[TestClient, Session],
) -> None:
    client, session = api
    lesson_id = _food_lesson_id(client.get("/api/path").json())

    started = client.post(f"/api/lessons/{lesson_id}/start")
    assert started.status_code == 200
    lesson = started.json()
    assert lesson["total_exercises"] == 5

    serialized = json.dumps(lesson["exercises"])
    assert '"answer"' not in serialized
    assert "accepted_answers" not in serialized
    assert '"pairs"' not in serialized

    answers: dict[str, Any] = {
        "multiple_choice": "Bread",
        "word_bank": ["Yo", "como", "una", "manzana"],
        "match_pairs": [
            {"left": "pan", "right": "bread"},
            {"left": "agua", "right": "water"},
            {"left": "manzana", "right": "apple"},
        ],
        "fill_blank": "bebo",
        "type_answer": "I want bread",
    }
    for exercise in lesson["exercises"]:
        response = client.post(
            f"/api/attempts/{lesson['attempt_id']}/answer",
            json={
                "exercise_id": exercise["id"],
                "answer": answers[exercise["exercise_type"]],
            },
        )
        assert response.status_code == 200
        assert response.json()["correct"] is True

    completed = client.post(f"/api/attempts/{lesson['attempt_id']}/complete")
    repeated = client.post(f"/api/attempts/{lesson['attempt_id']}/complete")

    assert completed.status_code == 200
    assert completed.json()["awarded_xp"] == 20
    assert completed.json()["total_xp"] == 60
    assert completed.json()["skill_status"] == "available"
    assert completed.json()["next_skill_id"] is None
    assert repeated.status_code == 200
    assert repeated.json()["total_xp"] == 60

    learner = session.scalar(select(User).where(User.username == "learner"))
    assert learner is not None
    assert learner.total_xp == 60


def test_wrong_answer_can_fail_lesson_and_mock_refill_restores_hearts(
    api: tuple[TestClient, Session],
) -> None:
    client, session = api
    learner = session.scalar(select(User).where(User.username == "learner"))
    assert learner is not None
    learner.hearts = 1
    session.commit()

    lesson_id = _food_lesson_id(client.get("/api/path").json())
    lesson = client.post(f"/api/lessons/{lesson_id}/start").json()
    first_exercise = lesson["exercises"][0]
    answered = client.post(
        f"/api/attempts/{lesson['attempt_id']}/answer",
        json={"exercise_id": first_exercise["id"], "answer": "Definitely wrong"},
    )

    assert answered.status_code == 200
    assert answered.json()["correct"] is False
    assert answered.json()["hearts"] == 0
    assert answered.json()["lesson_failed"] is True
    assert client.post(f"/api/attempts/{lesson['attempt_id']}/complete").status_code == 409

    refilled = client.post("/api/hearts/refill")
    assert refilled.status_code == 200
    assert refilled.json() == {
        "hearts": 5,
        "max_hearts": 5,
        "refilled": True,
        "gems": 450,
        "gems_spent": 50,
    }
    session.refresh(learner)
    assert learner.gems == 450


def test_refill_hearts_fails_when_gems_are_insufficient(api: tuple[TestClient, Session]) -> None:
    client, session = api
    learner = session.scalar(select(User).where(User.username == "learner"))
    assert learner is not None
    learner.hearts = 0
    learner.gems = 40
    session.commit()

    response = client.post("/api/hearts/refill")

    assert response.status_code == 409
    assert response.json()["detail"] == "Not enough gems. 50 gems are required to refill hearts."


def test_locked_lesson_cannot_start(api: tuple[TestClient, Session]) -> None:
    client, _ = api
    lesson_id = _directions_lesson_id(client.get("/api/path").json())

    response = client.post(f"/api/lessons/{lesson_id}/start")

    assert response.status_code == 409
    assert response.json()["detail"] == "This skill is locked."


def test_finishing_a_full_skill_unlocks_the_next_skill(api: tuple[TestClient, Session]) -> None:
    client, _ = api
    path = client.get("/api/path").json()
    food_lessons = _skill_lessons(path, "Food")

    for lesson_id in food_lessons:
        started = client.post(f"/api/lessons/{lesson_id}/start")
        assert started.status_code == 200
        lesson = started.json()

        answers: dict[str, Any] = {
            "multiple_choice": "Bread",
            "word_bank": ["Yo", "como", "una", "manzana"],
            "match_pairs": [
                {"left": "pan", "right": "bread"},
                {"left": "agua", "right": "water"},
                {"left": "manzana", "right": "apple"},
            ],
            "fill_blank": "bebo",
            "type_answer": "i would like bread",
        }
        for exercise in lesson["exercises"]:
            answered = client.post(
                f"/api/attempts/{lesson['attempt_id']}/answer",
                json={
                    "exercise_id": exercise["id"],
                    "answer": answers[exercise["exercise_type"]],
                },
            )
            assert answered.status_code == 200
            assert answered.json()["correct"] is True

        completed = client.post(f"/api/attempts/{lesson['attempt_id']}/complete")
        assert completed.status_code == 200

    updated_path = client.get("/api/path")
    assert updated_path.status_code == 200
    statuses = {
        skill["title"]: skill["status"]
        for unit in updated_path.json()["units"]
        for skill in unit["skills"]
    }
    assert statuses["Food"] == "completed"
    assert statuses["Family"] == "available"


def test_lesson_completion_adds_xp_across_multiple_lessons(api: tuple[TestClient, Session]) -> None:
    client, _ = api
    path = client.get("/api/path").json()
    food_lessons = _skill_lessons(path, "Food")

    def finish_lesson(lesson_id: int) -> int:
        started = client.post(f"/api/lessons/{lesson_id}/start")
        lesson = started.json()
        answers: dict[str, Any] = {
            "multiple_choice": "Bread",
            "word_bank": ["Yo", "como", "una", "manzana"],
            "match_pairs": [
                {"left": "pan", "right": "bread"},
                {"left": "agua", "right": "water"},
                {"left": "manzana", "right": "apple"},
            ],
            "fill_blank": "bebo",
            "type_answer": "I want bread",
        }
        for exercise in lesson["exercises"]:
            answered = client.post(
                f"/api/attempts/{lesson['attempt_id']}/answer",
                json={
                    "exercise_id": exercise["id"],
                    "answer": answers[exercise["exercise_type"]],
                },
            )
            assert answered.status_code == 200

        completed = client.post(f"/api/attempts/{lesson['attempt_id']}/complete")
        assert completed.status_code == 200
        return completed.json()["total_xp"]

    first_total = finish_lesson(food_lessons[0])
    second_total = finish_lesson(food_lessons[1])

    assert first_total == 60
    assert second_total == 80
