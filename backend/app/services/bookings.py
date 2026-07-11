from datetime import date
from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from sqlalchemy.orm import selectinload

from app.models import Booking, BookingStatus, Listing, Review, User
from app.schemas import BookingCreate, BookingWithListing
from app.services.listings import build_listing_card, get_listing_or_404, get_wishlisted_ids


def booking_load_options() -> list:
    return [
        selectinload(Booking.listing).selectinload(Listing.host),
        selectinload(Booking.listing).selectinload(Listing.photos),
        selectinload(Booking.listing).selectinload(Listing.amenities),
        selectinload(Booking.listing).selectinload(Listing.reviews).selectinload(Review.author),
        selectinload(Booking.guest),
    ]


def calculate_total_price(nightly_price: Decimal, check_in: date, check_out: date) -> Decimal:
    nights = (check_out - check_in).days
    cleaning_fee = Decimal("3500.00")
    service_fee = nightly_price * Decimal(nights) * Decimal("0.12")
    return (nightly_price * Decimal(nights) + cleaning_fee + service_fee).quantize(Decimal("0.01"))


def create_booking(db: Session, payload: BookingCreate, guest: User) -> BookingWithListing:
    if payload.check_out <= payload.check_in:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="check_out must be after check_in.")

    listing = get_listing_or_404(db, payload.listing_id)
    if payload.guests > listing.max_guests:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Guest count exceeds listing capacity.")

    booking = Booking(
        listing_id=listing.id,
        guest_id=guest.id,
        check_in=payload.check_in,
        check_out=payload.check_out,
        guests=payload.guests,
        total_price=calculate_total_price(listing.price_per_night, payload.check_in, payload.check_out),
        status=BookingStatus.CONFIRMED,
    )
    db.add(booking)

    try:
        db.commit()
    except ValueError as exc:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc

    db.refresh(booking)
    return build_booking_response(db, booking, guest.id)


def build_booking_response(db: Session, booking: Booking, user_id: int) -> BookingWithListing:
    listing = get_listing_or_404(db, booking.listing_id)
    return BookingWithListing(
        id=booking.id,
        listing_id=booking.listing_id,
        guest_id=booking.guest_id,
        check_in=booking.check_in,
        check_out=booking.check_out,
        guests=booking.guests,
        total_price=booking.total_price,
        status=booking.status,
        created_at=booking.created_at,
        listing=build_listing_card(listing, get_wishlisted_ids(db, user_id)),
    )


def get_my_bookings(db: Session, user: User) -> list[BookingWithListing]:
    bookings = db.scalars(
        select(Booking)
        .options(*booking_load_options())
        .where(Booking.guest_id == user.id)
        .order_by(Booking.check_in.desc(), Booking.id.desc())
    ).all()
    wishlisted_ids = get_wishlisted_ids(db, user.id)

    return [
        BookingWithListing(
            id=booking.id,
            listing_id=booking.listing_id,
            guest_id=booking.guest_id,
            check_in=booking.check_in,
            check_out=booking.check_out,
            guests=booking.guests,
            total_price=booking.total_price,
            status=booking.status,
            created_at=booking.created_at,
            listing=build_listing_card(booking.listing, wishlisted_ids),
        )
        for booking in bookings
    ]


def cancel_booking(db: Session, booking_id: int, user: User) -> BookingWithListing:
    booking = db.scalar(select(Booking).options(*booking_load_options()).where(Booking.id == booking_id))
    if booking is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found.")

    if booking.guest_id != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can cancel only your own bookings.")

    booking.status = BookingStatus.CANCELLED
    db.commit()
    db.refresh(booking)
    return build_booking_response(db, booking, user.id)
