from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models import User
from app.schemas import BookingCreate, BookingWithListing
from app.services import bookings as booking_service

router = APIRouter(prefix="/bookings", tags=["bookings"])


@router.post("", response_model=BookingWithListing, status_code=status.HTTP_201_CREATED)
def create_booking(
    payload: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> BookingWithListing:
    return booking_service.create_booking(db, payload, current_user)


@router.get("/me", response_model=list[BookingWithListing])
def get_my_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[BookingWithListing]:
    return booking_service.get_my_bookings(db, current_user)


@router.delete("/{booking_id}", response_model=BookingWithListing)
def cancel_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> BookingWithListing:
    return booking_service.cancel_booking(db, booking_id, current_user)
