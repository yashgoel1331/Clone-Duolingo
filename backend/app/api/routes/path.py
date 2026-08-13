from fastapi import APIRouter

from app.api.dependencies import CurrentTime, CurrentUser, DatabaseSession
from app.core.config import get_settings
from app.schemas.path import PathResponse
from app.services.learning import build_path

router = APIRouter()


@router.get("/path", response_model=PathResponse, tags=["learning path"])
def get_learning_path(
    session: DatabaseSession,
    user: CurrentUser,
    now: CurrentTime,
) -> PathResponse:
    return build_path(session, user, get_settings().default_course_slug, now)
