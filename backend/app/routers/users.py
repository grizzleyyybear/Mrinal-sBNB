from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models import User
from app.schemas import UserRead, UserSwitch

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=list[UserRead])
def list_users(db: Session = Depends(get_db)) -> list[User]:
    return list(db.scalars(select(User).order_by(User.id)).all())


@router.get("/me", response_model=UserRead)
def get_me(current_user: User = Depends(get_current_user)) -> User:
    return current_user


@router.post("/switch", response_model=UserRead)
def switch_user(payload: UserSwitch, response: Response, db: Session = Depends(get_db)) -> User:
    user = db.get(User, payload.user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    response.set_cookie(
        key="current_user_id",
        value=str(user.id),
        max_age=60 * 60 * 24 * 365,
        httponly=False,
        samesite="lax",
    )
    return user
