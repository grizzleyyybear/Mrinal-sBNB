from fastapi import Cookie, Depends, Header, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import User


def get_current_user(
    db: Session = Depends(get_db),
    x_user_id: int | None = Header(default=None, alias="X-User-Id"),
    current_user_id: int | None = Cookie(default=None),
) -> User:
    user_id = x_user_id or current_user_id

    if user_id is None:
        user = db.scalar(select(User).where(User.is_host.is_(False)).order_by(User.id))
    else:
        user = db.get(User, user_id)

    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Select a valid mocked user.")

    return user


def require_host(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_host:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Host access required.")
    return current_user
