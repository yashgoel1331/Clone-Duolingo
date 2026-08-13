from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    UniqueConstraint,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin
from app.models.enums import AttemptStatus, SkillStatus, enum_values

if TYPE_CHECKING:
    from app.models.content import Lesson, Skill
    from app.models.user import User


class UserSkillProgress(TimestampMixin, Base):
    __tablename__ = "user_skill_progress"
    __table_args__ = (
        UniqueConstraint("user_id", "skill_id", name="uq_user_skill_progress"),
        CheckConstraint(
            "progress_percent >= 0 AND progress_percent <= 100",
            name="ck_user_skill_progress_percent_range",
        ),
        CheckConstraint("crowns >= 0", name="ck_user_skill_progress_crowns_nonnegative"),
        CheckConstraint(
            "status IN ('locked', 'available', 'completed')",
            name="ck_user_skill_progress_status",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
    )
    skill_id: Mapped[int] = mapped_column(
        ForeignKey("skills.id", ondelete="CASCADE"),
        index=True,
    )
    status: Mapped[SkillStatus] = mapped_column(
        Enum(
            SkillStatus,
            name="skill_status",
            native_enum=False,
            create_constraint=False,
            validate_strings=True,
            values_callable=enum_values,
        ),
        default=SkillStatus.LOCKED,
        server_default=SkillStatus.LOCKED.value,
    )
    progress_percent: Mapped[int] = mapped_column(Integer, default=0, server_default=text("0"))
    crowns: Mapped[int] = mapped_column(Integer, default=0, server_default=text("0"))
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    user: Mapped[User] = relationship(back_populates="skill_progress")
    skill: Mapped[Skill] = relationship(back_populates="user_progress")


class UserLessonProgress(TimestampMixin, Base):
    __tablename__ = "user_lesson_progress"
    __table_args__ = (
        UniqueConstraint("user_id", "lesson_id", name="uq_user_lesson_progress"),
        CheckConstraint(
            "best_score >= 0 AND best_score <= 100",
            name="ck_user_lesson_progress_best_score_range",
        ),
        CheckConstraint(
            "attempts_count >= 0",
            name="ck_user_lesson_progress_attempts_nonnegative",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
    )
    lesson_id: Mapped[int] = mapped_column(
        ForeignKey("lessons.id", ondelete="CASCADE"),
        index=True,
    )
    is_completed: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        server_default=text("0"),
    )
    best_score: Mapped[int] = mapped_column(Integer, default=0, server_default=text("0"))
    attempts_count: Mapped[int] = mapped_column(Integer, default=0, server_default=text("0"))
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    last_attempt_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    user: Mapped[User] = relationship(back_populates="lesson_progress")
    lesson: Mapped[Lesson] = relationship(back_populates="user_progress")


class LessonAttempt(TimestampMixin, Base):
    __tablename__ = "lesson_attempts"
    __table_args__ = (
        CheckConstraint("correct_answers >= 0", name="ck_attempts_correct_nonnegative"),
        CheckConstraint("incorrect_answers >= 0", name="ck_attempts_incorrect_nonnegative"),
        CheckConstraint("hearts_lost >= 0", name="ck_attempts_hearts_lost_nonnegative"),
        CheckConstraint("xp_earned >= 0", name="ck_attempts_xp_earned_nonnegative"),
        CheckConstraint(
            "current_exercise_position >= 0",
            name="ck_attempts_position_nonnegative",
        ),
        CheckConstraint(
            "status IN ('in_progress', 'completed', 'failed', 'abandoned')",
            name="ck_attempts_status",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
    )
    lesson_id: Mapped[int] = mapped_column(
        ForeignKey("lessons.id", ondelete="CASCADE"),
        index=True,
    )
    status: Mapped[AttemptStatus] = mapped_column(
        Enum(
            AttemptStatus,
            name="attempt_status",
            native_enum=False,
            create_constraint=False,
            validate_strings=True,
            values_callable=enum_values,
        ),
        default=AttemptStatus.IN_PROGRESS,
        server_default=AttemptStatus.IN_PROGRESS.value,
    )
    current_exercise_position: Mapped[int] = mapped_column(
        Integer,
        default=0,
        server_default=text("0"),
    )
    correct_answers: Mapped[int] = mapped_column(Integer, default=0, server_default=text("0"))
    incorrect_answers: Mapped[int] = mapped_column(Integer, default=0, server_default=text("0"))
    hearts_lost: Mapped[int] = mapped_column(Integer, default=0, server_default=text("0"))
    xp_earned: Mapped[int] = mapped_column(Integer, default=0, server_default=text("0"))
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    user: Mapped[User] = relationship(back_populates="lesson_attempts")
    lesson: Mapped[Lesson] = relationship(back_populates="attempts")
