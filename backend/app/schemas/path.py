from pydantic import BaseModel

from app.models.enums import SkillStatus
from app.schemas.user import UserStats


class PathLesson(BaseModel):
    id: int
    position: int
    title: str
    xp_reward: int


class PathSkill(BaseModel):
    id: int
    position: int
    title: str
    description: str | None
    icon: str
    color: str
    status: SkillStatus
    progress_percent: int
    crowns: int
    crown_goal: int
    lessons: list[PathLesson]


class PathUnit(BaseModel):
    id: int
    position: int
    title: str
    description: str | None
    skills: list[PathSkill]


class PathResponse(BaseModel):
    course_id: int
    course_title: str
    source_language: str
    target_language: str
    stats: UserStats
    units: list[PathUnit]
