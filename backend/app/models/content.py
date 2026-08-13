from __future__ import annotations

from typing import TYPE_CHECKING, Any

from sqlalchemy import (
    JSON,
    CheckConstraint,
    Enum,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin
from app.models.enums import ExerciseType, enum_values

if TYPE_CHECKING:
    from app.models.progress import LessonAttempt, UserLessonProgress, UserSkillProgress


class Course(TimestampMixin, Base):
    __tablename__ = "courses"
    __table_args__ = (
        UniqueConstraint(
            "source_language",
            "target_language",
            name="uq_courses_language_pair",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(120))
    source_language: Mapped[str] = mapped_column(String(50))
    target_language: Mapped[str] = mapped_column(String(50))
    description: Mapped[str | None] = mapped_column(Text)

    units: Mapped[list[Unit]] = relationship(
        back_populates="course",
        cascade="all, delete-orphan",
        passive_deletes=True,
        order_by="Unit.position",
    )


class Unit(TimestampMixin, Base):
    __tablename__ = "units"
    __table_args__ = (
        UniqueConstraint("course_id", "position", name="uq_units_course_position"),
        CheckConstraint("position > 0", name="ck_units_position_positive"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    course_id: Mapped[int] = mapped_column(
        ForeignKey("courses.id", ondelete="CASCADE"),
        index=True,
    )
    position: Mapped[int] = mapped_column(Integer)
    title: Mapped[str] = mapped_column(String(120))
    description: Mapped[str | None] = mapped_column(Text)

    course: Mapped[Course] = relationship(back_populates="units")
    skills: Mapped[list[Skill]] = relationship(
        back_populates="unit",
        cascade="all, delete-orphan",
        passive_deletes=True,
        order_by="Skill.position",
    )


class Skill(TimestampMixin, Base):
    __tablename__ = "skills"
    __table_args__ = (
        UniqueConstraint("unit_id", "position", name="uq_skills_unit_position"),
        CheckConstraint("position > 0", name="ck_skills_position_positive"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    unit_id: Mapped[int] = mapped_column(
        ForeignKey("units.id", ondelete="CASCADE"),
        index=True,
    )
    position: Mapped[int] = mapped_column(Integer)
    title: Mapped[str] = mapped_column(String(120))
    description: Mapped[str | None] = mapped_column(Text)
    icon: Mapped[str] = mapped_column(String(50), default="star", server_default="star")
    color: Mapped[str] = mapped_column(String(20), default="#58CC02", server_default="#58CC02")
    crown_goal: Mapped[int] = mapped_column(Integer, default=1, server_default=text("1"))

    unit: Mapped[Unit] = relationship(back_populates="skills")
    lessons: Mapped[list[Lesson]] = relationship(
        back_populates="skill",
        cascade="all, delete-orphan",
        passive_deletes=True,
        order_by="Lesson.position",
    )
    user_progress: Mapped[list[UserSkillProgress]] = relationship(
        back_populates="skill",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )


class Lesson(TimestampMixin, Base):
    __tablename__ = "lessons"
    __table_args__ = (
        UniqueConstraint("skill_id", "position", name="uq_lessons_skill_position"),
        CheckConstraint("position > 0", name="ck_lessons_position_positive"),
        CheckConstraint("xp_reward >= 0", name="ck_lessons_xp_reward_nonnegative"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    skill_id: Mapped[int] = mapped_column(
        ForeignKey("skills.id", ondelete="CASCADE"),
        index=True,
    )
    position: Mapped[int] = mapped_column(Integer)
    title: Mapped[str] = mapped_column(String(120))
    xp_reward: Mapped[int] = mapped_column(Integer, default=10, server_default=text("10"))

    skill: Mapped[Skill] = relationship(back_populates="lessons")
    exercises: Mapped[list[Exercise]] = relationship(
        back_populates="lesson",
        cascade="all, delete-orphan",
        passive_deletes=True,
        order_by="Exercise.position",
    )
    user_progress: Mapped[list[UserLessonProgress]] = relationship(
        back_populates="lesson",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    attempts: Mapped[list[LessonAttempt]] = relationship(
        back_populates="lesson",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )


class Exercise(TimestampMixin, Base):
    __tablename__ = "exercises"
    __table_args__ = (
        UniqueConstraint("lesson_id", "position", name="uq_exercises_lesson_position"),
        CheckConstraint("position > 0", name="ck_exercises_position_positive"),
        CheckConstraint(
            "exercise_type IN "
            "('multiple_choice', 'word_bank', 'match_pairs', 'fill_blank', 'type_answer')",
            name="ck_exercises_type",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    lesson_id: Mapped[int] = mapped_column(
        ForeignKey("lessons.id", ondelete="CASCADE"),
        index=True,
    )
    position: Mapped[int] = mapped_column(Integer)
    exercise_type: Mapped[ExerciseType] = mapped_column(
        Enum(
            ExerciseType,
            name="exercise_type",
            native_enum=False,
            create_constraint=False,
            validate_strings=True,
            values_callable=enum_values,
        ),
    )
    instruction: Mapped[str | None] = mapped_column(String(200))
    prompt: Mapped[str] = mapped_column(Text)
    payload: Mapped[dict[str, Any]] = mapped_column(JSON)
    explanation: Mapped[str | None] = mapped_column(Text)

    lesson: Mapped[Lesson] = relationship(back_populates="exercises")
