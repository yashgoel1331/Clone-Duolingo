from __future__ import annotations

from datetime import date, datetime
from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, Date, DateTime, Integer, String, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.progress import LessonAttempt, UserLessonProgress, UserSkillProgress


class User(TimestampMixin, Base):
    __tablename__ = "users"
    __table_args__ = (
        CheckConstraint("total_xp >= 0", name="ck_users_total_xp_nonnegative"),
        CheckConstraint("weekly_xp >= 0", name="ck_users_weekly_xp_nonnegative"),
        CheckConstraint("daily_xp >= 0", name="ck_users_daily_xp_nonnegative"),
        CheckConstraint("gems >= 0", name="ck_users_gems_nonnegative"),
        CheckConstraint("max_hearts > 0", name="ck_users_max_hearts_positive"),
        CheckConstraint("hearts >= 0 AND hearts <= max_hearts", name="ck_users_hearts_range"),
        CheckConstraint("current_streak >= 0", name="ck_users_current_streak_nonnegative"),
        CheckConstraint("longest_streak >= current_streak", name="ck_users_streak_order"),
        CheckConstraint("daily_goal > 0", name="ck_users_daily_goal_positive"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    display_name: Mapped[str] = mapped_column(String(100))
    avatar_url: Mapped[str | None] = mapped_column(String(500))

    total_xp: Mapped[int] = mapped_column(Integer, default=0, server_default=text("0"))
    weekly_xp: Mapped[int] = mapped_column(Integer, default=0, server_default=text("0"))
    daily_xp: Mapped[int] = mapped_column(Integer, default=0, server_default=text("0"))
    daily_goal: Mapped[int] = mapped_column(Integer, default=20, server_default=text("20"))
    gems: Mapped[int] = mapped_column(Integer, default=500, server_default=text("500"))

    hearts: Mapped[int] = mapped_column(Integer, default=5, server_default=text("5"))
    max_hearts: Mapped[int] = mapped_column(Integer, default=5, server_default=text("5"))
    last_heart_regenerated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    current_streak: Mapped[int] = mapped_column(Integer, default=0, server_default=text("0"))
    longest_streak: Mapped[int] = mapped_column(Integer, default=0, server_default=text("0"))
    last_activity_date: Mapped[date | None] = mapped_column(Date)

    skill_progress: Mapped[list[UserSkillProgress]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    lesson_progress: Mapped[list[UserLessonProgress]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    lesson_attempts: Mapped[list[LessonAttempt]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
