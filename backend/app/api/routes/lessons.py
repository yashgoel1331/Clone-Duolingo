from fastapi import APIRouter

from app.api.dependencies import CurrentTime, CurrentUser, DatabaseSession
from app.schemas.lesson import (
    AnswerRequest,
    AnswerResponse,
    LessonCompleteResponse,
    LessonStartResponse,
)
from app.services.learning import complete_lesson, start_lesson, submit_answer

router = APIRouter()


@router.post(
    "/lessons/{lesson_id}/start",
    response_model=LessonStartResponse,
    tags=["lessons"],
)
def start(
    lesson_id: int,
    session: DatabaseSession,
    user: CurrentUser,
    now: CurrentTime,
) -> LessonStartResponse:
    return start_lesson(session, user, lesson_id, now)


@router.post(
    "/attempts/{attempt_id}/answer",
    response_model=AnswerResponse,
    tags=["lessons"],
)
def answer(
    attempt_id: int,
    request: AnswerRequest,
    session: DatabaseSession,
    user: CurrentUser,
    now: CurrentTime,
) -> AnswerResponse:
    return submit_answer(
        session,
        user,
        attempt_id,
        request.exercise_id,
        request.answer,
        now,
    )


@router.post(
    "/attempts/{attempt_id}/complete",
    response_model=LessonCompleteResponse,
    tags=["lessons"],
)
def complete(
    attempt_id: int,
    session: DatabaseSession,
    user: CurrentUser,
    now: CurrentTime,
) -> LessonCompleteResponse:
    return complete_lesson(session, user, attempt_id, now)
