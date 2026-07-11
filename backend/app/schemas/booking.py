from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, Field

from app.models.booking import BookingStatus
from app.schemas.common import ORMModel
from app.schemas.listing import ListingCard
from app.schemas.user import UserRead


class BookingCreate(BaseModel):
    listing_id: int
    check_in: date
    check_out: date
    guests: int = Field(gt=0)


class BookingRead(ORMModel):
    id: int
    listing_id: int
    guest_id: int
    check_in: date
    check_out: date
    guests: int
    total_price: Decimal
    status: BookingStatus
    created_at: datetime


class BookingWithListing(BookingRead):
    listing: ListingCard


class HostBooking(BookingRead):
    guest: UserRead


class HostListingWithBookings(BaseModel):
    listing: ListingCard
    bookings: list[HostBooking]
