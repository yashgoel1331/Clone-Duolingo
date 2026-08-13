from datetime import UTC, date, datetime, timedelta

from app.models import User
from app.services.users import regenerate_hearts, update_streak_for_activity

NOW = datetime(2026, 8, 13, 12, 0, tzinfo=UTC)


def test_hearts_regenerate_in_whole_intervals_and_cap_at_maximum() -> None:
    user = User(
        username="hearts",
        display_name="Hearts",
        hearts=2,
        max_hearts=5,
        last_heart_regenerated_at=NOW - timedelta(hours=20),
    )

    changed = regenerate_hearts(user, NOW)

    assert changed is True
    assert user.hearts == 5
    assert user.last_heart_regenerated_at == NOW


def test_streak_rules_cover_same_day_next_day_and_missed_day() -> None:
    same_day = User(
        username="same-day",
        display_name="Same Day",
        current_streak=5,
        longest_streak=8,
        daily_xp=10,
        last_activity_date=date(2026, 8, 13),
    )
    next_day = User(
        username="next-day",
        display_name="Next Day",
        current_streak=5,
        longest_streak=5,
        daily_xp=20,
        last_activity_date=date(2026, 8, 12),
    )
    missed_day = User(
        username="missed-day",
        display_name="Missed Day",
        current_streak=5,
        longest_streak=9,
        daily_xp=20,
        last_activity_date=date(2026, 8, 10),
    )

    update_streak_for_activity(same_day, NOW)
    update_streak_for_activity(next_day, NOW)
    update_streak_for_activity(missed_day, NOW)

    assert (same_day.current_streak, same_day.daily_xp) == (5, 10)
    assert (next_day.current_streak, next_day.longest_streak, next_day.daily_xp) == (6, 6, 0)
    assert (missed_day.current_streak, missed_day.longest_streak, missed_day.daily_xp) == (
        1,
        9,
        0,
    )
