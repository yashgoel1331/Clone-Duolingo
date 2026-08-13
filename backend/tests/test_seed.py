from collections import Counter
from collections.abc import Iterator
from datetime import UTC, datetime
from sqlite3 import Connection as SQLite3Connection
from typing import Any

import pytest
from sqlalchemy import create_engine, event, func, select
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from app.db.base import Base
from app.models import (
    Course,
    Exercise,
    LessonAttempt,
    User,
    UserLessonProgress,
    UserSkillProgress,
)
from app.models.enums import ExerciseType, SkillStatus
from app.seed import SeedSummary, seed_database

SEEDED_AT = datetime(2026, 8, 13, 12, 0, tzinfo=UTC)


@pytest.fixture
def session() -> Iterator[Session]:
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
    with Session(engine) as database_session:
        yield database_session
    Base.metadata.drop_all(engine)
    engine.dispose()


def test_seed_creates_complete_course_and_sample_progress(session: Session) -> None:
    summary = seed_database(session, seeded_at=SEEDED_AT)

    assert summary == SeedSummary(
        users=6,
        courses=1,
        units=4,
        skills=8,
        lessons=16,
        exercises=80,
    )

    course = session.scalar(select(Course))
    assert course is not None
    assert [unit.title for unit in course.units] == [
        "First Steps",
        "Everyday Life",
        "Explore",
        "Daily Adventures",
    ]
    assert [[skill.title for skill in unit.skills] for unit in course.units] == [
        ["Greetings", "Introductions"],
        ["Food", "Family"],
        ["Travel", "Directions"],
        ["Shopping", "Routine"],
    ]

    exercise_types = Counter(session.scalars(select(Exercise.exercise_type)))
    assert exercise_types == {exercise_type: 16 for exercise_type in ExerciseType}

    learner = session.scalar(select(User).where(User.username == "learner"))
    assert learner is not None
    assert learner.display_name == "Yash"
    assert learner.total_xp == 40
    assert learner.current_streak == 7
    assert learner.hearts == 4

    statuses = list(
        session.scalars(
            select(UserSkillProgress.status)
            .where(UserSkillProgress.user_id == learner.id)
            .order_by(UserSkillProgress.id),
        ),
    )
    assert statuses == [
        SkillStatus.COMPLETED,
        SkillStatus.COMPLETED,
        SkillStatus.AVAILABLE,
        SkillStatus.LOCKED,
        SkillStatus.LOCKED,
        SkillStatus.LOCKED,
        SkillStatus.LOCKED,
        SkillStatus.LOCKED,
    ]
    assert session.scalar(select(func.count()).select_from(UserLessonProgress)) == 5
    assert session.scalar(select(func.count()).select_from(LessonAttempt)) == 5


def test_seed_is_idempotent(session: Session) -> None:
    first_summary = seed_database(session, seeded_at=SEEDED_AT)
    second_summary = seed_database(session, seeded_at=SEEDED_AT)

    assert second_summary == first_summary
    assert session.scalar(select(func.count()).select_from(UserSkillProgress)) == 8
    assert session.scalar(select(func.count()).select_from(UserLessonProgress)) == 5
    assert session.scalar(select(func.count()).select_from(LessonAttempt)) == 5
