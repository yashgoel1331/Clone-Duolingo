from typing import Any

from pydantic import BaseModel

from app.models.enums import AttemptStatus, ExerciseType, SkillStatus


class PublicExercise(BaseModel):
    id: int
    position: int
    exercise_type: ExerciseType
    instruction: str | None
    prompt: str
    payload: dict[str, Any]


class LessonStartResponse(BaseModel):
    attempt_id: int
    lesson_id: int
    title: str
    xp_reward: int
    total_exercises: int
    current_exercise_position: int
    hearts: int
    exercises: list[PublicExercise]


class AnswerRequest(BaseModel):
    exercise_id: int
    answer: Any


class AnswerResponse(BaseModel):
    correct: bool
    correction: Any | None
    explanation: str | None
    hearts: int
    current_exercise_position: int
    total_exercises: int
    lesson_failed: bool


class LessonCompleteResponse(BaseModel):
    attempt_id: int
    status: AttemptStatus
    awarded_xp: int
    accuracy: int
    total_xp: int
    daily_xp: int
    daily_goal: int
    daily_goal_reached: bool
    current_streak: int
    skill_status: SkillStatus
    next_skill_id: int | None
