from pydantic import BaseModel


class UserStats(BaseModel):
    total_xp: int
    weekly_xp: int
    daily_xp: int
    daily_goal: int
    hearts: int
    max_hearts: int
    current_streak: int
    gems: int


class MeResponse(BaseModel):
    id: int
    username: str
    display_name: str
    avatar_url: str | None
    stats: UserStats


class ProfileResponse(MeResponse):
    longest_streak: int
    completed_skills: int
    completed_lessons: int
    total_attempts: int


class HeartRefillResponse(BaseModel):
    hearts: int
    max_hearts: int
    refilled: bool
    gems: int
    gems_spent: int


class LeaderboardEntry(BaseModel):
    rank: int
    user_id: int
    display_name: str
    avatar_url: str | None
    weekly_xp: int
    is_current_user: bool


class LeaderboardResponse(BaseModel):
    entries: list[LeaderboardEntry]
