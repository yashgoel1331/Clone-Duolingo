from fastapi import APIRouter

from app.api.dependencies import CurrentTime, CurrentUser, DatabaseSession
from app.schemas.user import HeartRefillResponse, MeResponse, ProfileResponse
from app.services.views import build_me, build_profile, refill_hearts

router = APIRouter()


@router.get("/me", response_model=MeResponse, tags=["learner"])
def get_me(
    session: DatabaseSession,
    user: CurrentUser,
    now: CurrentTime,
) -> MeResponse:
    return build_me(session, user, now)


@router.get("/me/profile", response_model=ProfileResponse, tags=["learner"])
def get_profile(
    session: DatabaseSession,
    user: CurrentUser,
    now: CurrentTime,
) -> ProfileResponse:
    return build_profile(session, user, now)


@router.post("/hearts/refill", response_model=HeartRefillResponse, tags=["learner"])
def practice_refill(
    session: DatabaseSession,
    user: CurrentUser,
    now: CurrentTime,
) -> HeartRefillResponse:
    return refill_hearts(session, user, now)
