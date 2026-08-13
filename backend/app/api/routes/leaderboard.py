from fastapi import APIRouter

from app.api.dependencies import CurrentUser, DatabaseSession
from app.schemas.user import LeaderboardResponse
from app.services.views import build_leaderboard

router = APIRouter()


@router.get("/leaderboard", response_model=LeaderboardResponse, tags=["leaderboard"])
def get_leaderboard(
    session: DatabaseSession,
    user: CurrentUser,
) -> LeaderboardResponse:
    return build_leaderboard(session, user)
