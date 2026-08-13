from datetime import datetime
from typing import Annotated

from fastapi import Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.base import utc_now
from app.db.session import get_db
from app.models import User

DatabaseSession = Annotated[Session, Depends(get_db)]


def get_now() -> datetime:
    return utc_now()


CurrentTime = Annotated[datetime, Depends(get_now)]


def get_current_user(session: DatabaseSession) -> User:
    settings = get_settings()
    user = session.scalar(select(User).where(User.username == settings.default_username))
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="The default learner is missing. Run the seed command first.",
        )
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]
