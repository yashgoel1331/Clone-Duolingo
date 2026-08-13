from fastapi import APIRouter

from app.api.routes import leaderboard, lessons, me, path

api_router = APIRouter()
api_router.include_router(me.router)
api_router.include_router(path.router)
api_router.include_router(lessons.router)
api_router.include_router(leaderboard.router)
