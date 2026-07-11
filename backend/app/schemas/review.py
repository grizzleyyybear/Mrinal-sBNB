from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.common import ORMModel
from app.schemas.user import UserRead


class ReviewCreate(BaseModel):
    listing_id: int
    rating: int = Field(ge=1, le=5)
    comment: str = Field(min_length=2, max_length=1200)
    booking_id: int | None = None


class ReviewRead(ORMModel):
    id: int
    listing_id: int
    author_id: int
    booking_id: int | None
    rating: int
    comment: str
    created_at: datetime
    author: UserRead
