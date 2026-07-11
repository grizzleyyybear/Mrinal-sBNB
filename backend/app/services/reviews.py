from datetime import date

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Booking, BookingStatus, Review, User
from app.schemas import ReviewCreate, ReviewRead
from app.services.listings import get_listing_or_404


def find_completed_booking(db: Session, payload: ReviewCreate, user: User) -> Booking | None:
    query = select(Booking).where(
        Booking.listing_id == payload.listing_id,
        Booking.guest_id == user.id,
        Booking.status == BookingStatus.CONFIRMED,
        Booking.check_out <= date.today(),
    )

    if payload.booking_id is not None:
        query = query.where(Booking.id == payload.booking_id)

    return db.scalar(query.order_by(Booking.check_out.desc()))


def create_review(db: Session, payload: ReviewCreate, user: User) -> ReviewRead:
    get_listing_or_404(db, payload.listing_id)
    booking = find_completed_booking(db, payload, user)

    if booking is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can review only after a completed stay.")

    review = Review(
        listing_id=payload.listing_id,
        author_id=user.id,
        booking_id=booking.id,
        rating=payload.rating,
        comment=payload.comment,
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return ReviewRead.model_validate(review)
