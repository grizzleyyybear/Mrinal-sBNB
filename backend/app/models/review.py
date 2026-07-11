from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Review(Base):
    __tablename__ = "reviews"
    __table_args__ = (CheckConstraint("rating BETWEEN 1 AND 5", name="ck_reviews_rating_range"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    listing_id: Mapped[int] = mapped_column(ForeignKey("listings.id", ondelete="CASCADE"), index=True, nullable=False)
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    booking_id: Mapped[int | None] = mapped_column(ForeignKey("bookings.id", ondelete="SET NULL"), index=True)
    rating: Mapped[int] = mapped_column(nullable=False)
    comment: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    listing: Mapped["Listing"] = relationship(back_populates="reviews")
    author: Mapped["User"] = relationship(back_populates="reviews")
    booking: Mapped["Booking | None"] = relationship(back_populates="reviews")
