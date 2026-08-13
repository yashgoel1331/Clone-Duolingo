from datetime import UTC, datetime, timedelta

from app.core.config import get_settings
from app.models import User
from app.schemas.user import UserStats


def _as_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=UTC)
    return value.astimezone(UTC)


def regenerate_hearts(user: User, now: datetime) -> bool:
    """Lazily regenerate whole hearts based on elapsed UTC time."""

    if user.hearts >= user.max_hearts:
        return False

    current_time = _as_utc(now)
    if user.last_heart_regenerated_at is None:
        user.last_heart_regenerated_at = current_time
        return True

    anchor = _as_utc(user.last_heart_regenerated_at)
    interval = timedelta(minutes=get_settings().heart_regen_minutes)
    regenerated = int((current_time - anchor) // interval)
    if regenerated <= 0:
        return False

    user.hearts = min(user.max_hearts, user.hearts + regenerated)
    user.last_heart_regenerated_at = (
        current_time if user.hearts == user.max_hearts else anchor + interval * regenerated
    )
    return True


def update_streak_for_activity(user: User, now: datetime) -> None:
    today = _as_utc(now).date()
    previous_date = user.last_activity_date

    if previous_date == today:
        return

    user.daily_xp = 0
    if previous_date == today - timedelta(days=1):
        user.current_streak += 1
    else:
        user.current_streak = 1

    user.longest_streak = max(user.longest_streak, user.current_streak)
    user.last_activity_date = today


def build_user_stats(user: User) -> UserStats:
    return UserStats(
        total_xp=user.total_xp,
        weekly_xp=user.weekly_xp,
        daily_xp=user.daily_xp,
        daily_goal=user.daily_goal,
        hearts=user.hearts,
        max_hearts=user.max_hearts,
        current_streak=user.current_streak,
        gems=user.gems,
    )
