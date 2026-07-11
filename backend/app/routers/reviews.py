from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models import User
from app.schemas import ReviewCreate, ReviewRead
from app.services import reviews as review_service

router = APIRouter(prefix="/reviews", tags=["reviews"])


@router.post("", response_model=ReviewRead, status_code=status.HTTP_201_CREATED)
def create_review(
    payload: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ReviewRead:
    return review_service.create_review(db, payload, current_user)
