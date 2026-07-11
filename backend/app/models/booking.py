from datetime import date, datetime
from decimal import Decimal
from enum import StrEnum

from sqlalchemy import CheckConstraint, Date, DateTime, Enum, ForeignKey, Numeric, event, select, func
from sqlalchemy.orm import Mapped, Session, mapped_column, relationship

from app.core.database import Base


class BookingStatus(StrEnum):
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"


class Booking(Base):
    __tablename__ = "bookings"
    __table_args__ = (
        CheckConstraint("check_out > check_in", name="ck_bookings_valid_date_range"),
        CheckConstraint("guests > 0", name="ck_bookings_positive_guests"),
        CheckConstraint("total_price >= 0", name="ck_bookings_non_negative_total"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    listing_id: Mapped[int] = mapped_column(ForeignKey("listings.id", ondelete="CASCADE"), index=True, nullable=False)
    guest_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    check_in: Mapped[date] = mapped_column(Date, nullable=False)
    check_out: Mapped[date] = mapped_column(Date, nullable=False)
    guests: Mapped[int] = mapped_column(nullable=False)
    total_price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    status: Mapped[BookingStatus] = mapped_column(
        Enum(BookingStatus, native_enum=False, values_callable=lambda enum: [item.value for item in enum]),
        default=BookingStatus.CONFIRMED,
        index=True,
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    listing: Mapped["Listing"] = relationship(back_populates="bookings")
    guest: Mapped["User"] = relationship(back_populates="bookings")
    reviews: Mapped[list["Review"]] = relationship(back_populates="booking")


@event.listens_for(Session, "before_flush")
def prevent_overlapping_confirmed_bookings(session: Session, *_: object) -> None:
    """SQLite has no exclusion constraint, so confirmed booking overlap is guarded here."""
    changed_bookings = [
        item
        for item in session.new.union(session.dirty)
        if isinstance(item, Booking) and item.status == BookingStatus.CONFIRMED
    ]

    for booking in changed_bookings:
        if booking.listing_id is None or booking.check_in is None or booking.check_out is None:
            continue

        conflict_query = select(Booking.id).where(
            Booking.listing_id == booking.listing_id,
            Booking.status == BookingStatus.CONFIRMED,
            Booking.check_in < booking.check_out,
            Booking.check_out > booking.check_in,
        )

        if booking.id is not None:
            conflict_query = conflict_query.where(Booking.id != booking.id)

        if session.execute(conflict_query).first() is not None:
            raise ValueError("Listing already has a confirmed booking for the selected dates.")
