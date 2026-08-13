from datetime import datetime

from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import LessonAttempt, User, UserLessonProgress, UserSkillProgress
from app.models.enums import SkillStatus
from app.schemas.user import (
    HeartRefillResponse,
    LeaderboardEntry,
    LeaderboardResponse,
    MeResponse,
    ProfileResponse,
)
from app.services.users import build_user_stats, regenerate_hearts

HEART_REFILL_GEM_COST = 50


def build_me(session: Session, user: User, now: datetime) -> MeResponse:
    regenerate_hearts(user, now)
    response = MeResponse(
        id=user.id,
        username=user.username,
        display_name=user.display_name,
        avatar_url=user.avatar_url,
        stats=build_user_stats(user),
    )
    session.commit()
    return response


def build_profile(session: Session, user: User, now: datetime) -> ProfileResponse:
    regenerate_hearts(user, now)
    completed_skills = (
        session.scalar(
            select(func.count())
            .select_from(UserSkillProgress)
            .where(
                UserSkillProgress.user_id == user.id,
                UserSkillProgress.status == SkillStatus.COMPLETED,
            ),
        )
        or 0
    )
    completed_lessons = (
        session.scalar(
            select(func.count())
            .select_from(UserLessonProgress)
            .where(
                UserLessonProgress.user_id == user.id,
                UserLessonProgress.is_completed.is_(True),
            ),
        )
        or 0
    )
    total_attempts = (
        session.scalar(
            select(func.count()).select_from(LessonAttempt).where(LessonAttempt.user_id == user.id),
        )
        or 0
    )
    response = ProfileResponse(
        id=user.id,
        username=user.username,
        display_name=user.display_name,
        avatar_url=user.avatar_url,
        stats=build_user_stats(user),
        longest_streak=user.longest_streak,
        completed_skills=completed_skills,
        completed_lessons=completed_lessons,
        total_attempts=total_attempts,
    )
    session.commit()
    return response


def build_leaderboard(session: Session, current_user: User) -> LeaderboardResponse:
    users = session.scalars(
        select(User).order_by(User.weekly_xp.desc(), User.id),
    )
    return LeaderboardResponse(
        entries=[
            LeaderboardEntry(
                rank=rank,
                user_id=user.id,
                display_name=user.display_name,
                avatar_url=user.avatar_url,
                weekly_xp=user.weekly_xp,
                is_current_user=user.id == current_user.id,
            )
            for rank, user in enumerate(users, start=1)
        ],
    )


def refill_hearts(session: Session, user: User, now: datetime) -> HeartRefillResponse:
    if user.gems < HEART_REFILL_GEM_COST:
        raise HTTPException(
            status_code=409,
            detail=f"Not enough gems. {HEART_REFILL_GEM_COST} gems are required to refill hearts.",
        )

    regenerated = regenerate_hearts(user, now)
    refilled = user.hearts < user.max_hearts
    user.gems -= HEART_REFILL_GEM_COST
    if refilled:
        user.hearts = user.max_hearts
        user.last_heart_regenerated_at = now
    response = HeartRefillResponse(
        hearts=user.hearts,
        max_hearts=user.max_hearts,
        refilled=refilled or regenerated,
        gems=user.gems,
        gems_spent=HEART_REFILL_GEM_COST,
    )
    session.commit()
    return response
