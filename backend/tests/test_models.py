from collections.abc import Iterator
from sqlite3 import Connection as SQLite3Connection
from typing import Any

import pytest
from sqlalchemy import create_engine, event, func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from app.db.base import Base
from app.models import (
    Course,
    Exercise,
    Lesson,
    Skill,
    Unit,
    User,
    UserSkillProgress,
)
from app.models.enums import ExerciseType, SkillStatus


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


def test_learning_hierarchy_and_progress_are_persisted(session: Session) -> None:
    lesson = Lesson(
        position=1,
        title="Greetings 1",
        exercises=[
            Exercise(
                position=1,
                exercise_type=ExerciseType.MULTIPLE_CHOICE,
                instruction="Choose the translation",
                prompt="Hola",
                payload={"options": ["Hello", "Goodbye"], "answer": "Hello"},
            ),
        ],
    )
    skill = Skill(position=1, title="Greetings", lessons=[lesson])
    course = Course(
        slug="spanish-for-english",
        title="Spanish for English Speakers",
        source_language="English",
        target_language="Spanish",
        units=[Unit(position=1, title="Start here", skills=[skill])],
    )
    user = User(username="learner", display_name="Sample Learner")
    user.skill_progress.append(
        UserSkillProgress(
            skill=skill,
            status=SkillStatus.AVAILABLE,
            progress_percent=25,
        ),
    )

    session.add_all([course, user])
    session.commit()

    stored_exercise = session.scalar(select(Exercise))
    stored_progress = session.scalar(select(UserSkillProgress))

    assert stored_exercise is not None
    assert stored_exercise.exercise_type is ExerciseType.MULTIPLE_CHOICE
    assert stored_exercise.payload["answer"] == "Hello"
    assert stored_progress is not None
    assert stored_progress.status is SkillStatus.AVAILABLE


def test_database_rejects_invalid_heart_balance(session: Session) -> None:
    session.add(
        User(
            username="invalid-hearts",
            display_name="Invalid Hearts",
            hearts=6,
            max_hearts=5,
        ),
    )

    with pytest.raises(IntegrityError):
        session.commit()


def test_deleting_course_cascades_through_content_and_progress(session: Session) -> None:
    skill = Skill(
        position=1,
        title="Basics",
        lessons=[Lesson(position=1, title="Basics 1")],
    )
    course = Course(
        slug="cascade-course",
        title="Cascade Course",
        source_language="English",
        target_language="French",
        units=[Unit(position=1, title="Unit 1", skills=[skill])],
    )
    user = User(username="cascade-user", display_name="Cascade User")
    user.skill_progress.append(UserSkillProgress(skill=skill, status=SkillStatus.AVAILABLE))
    session.add_all([course, user])
    session.commit()

    session.delete(course)
    session.commit()

    assert session.scalar(select(func.count()).select_from(Unit)) == 0
    assert session.scalar(select(func.count()).select_from(Skill)) == 0
    assert session.scalar(select(func.count()).select_from(Lesson)) == 0
    assert session.scalar(select(func.count()).select_from(UserSkillProgress)) == 0
    assert session.scalar(select(func.count()).select_from(User)) == 1
