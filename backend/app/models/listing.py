from datetime import datetime
from decimal import Decimal

from sqlalchemy import Column, DateTime, ForeignKey, Index, Integer, Numeric, String, Table, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


listing_amenities = Table(
    "listing_amenities",
    Base.metadata,
    Column("listing_id", Integer, ForeignKey("listings.id", ondelete="CASCADE"), primary_key=True),
    Column("amenity_id", Integer, ForeignKey("amenities.id", ondelete="CASCADE"), primary_key=True),
    Index("ix_listing_amenities_listing_id", "listing_id"),
    Index("ix_listing_amenities_amenity_id", "amenity_id"),
)


class Listing(Base):
    __tablename__ = "listings"

    id: Mapped[int] = mapped_column(primary_key=True)
    host_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(180), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    property_type: Mapped[str] = mapped_column(String(80), index=True, nullable=False)
    location_city: Mapped[str] = mapped_column(String(120), index=True, nullable=False)
    location_country: Mapped[str] = mapped_column(String(120), index=True, nullable=False)
    lat: Mapped[float] = mapped_column(nullable=False)
    lng: Mapped[float] = mapped_column(nullable=False)
    price_per_night: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    max_guests: Mapped[int] = mapped_column(nullable=False)
    bedrooms: Mapped[int] = mapped_column(nullable=False)
    beds: Mapped[int] = mapped_column(nullable=False)
    baths: Mapped[float] = mapped_column(nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    host: Mapped["User"] = relationship(back_populates="listings")
    photos: Mapped[list["ListingPhoto"]] = relationship(
        back_populates="listing",
        cascade="all, delete-orphan",
        order_by="ListingPhoto.sort_order",
    )
    amenities: Mapped[list["Amenity"]] = relationship(secondary=listing_amenities, back_populates="listings")
    bookings: Mapped[list["Booking"]] = relationship(back_populates="listing", cascade="all, delete-orphan")
    reviews: Mapped[list["Review"]] = relationship(back_populates="listing", cascade="all, delete-orphan")
    wishlist_items: Mapped[list["Wishlist"]] = relationship(back_populates="listing", cascade="all, delete-orphan")


class ListingPhoto(Base):
    __tablename__ = "listing_photos"

    id: Mapped[int] = mapped_column(primary_key=True)
    listing_id: Mapped[int] = mapped_column(ForeignKey("listings.id", ondelete="CASCADE"), index=True, nullable=False)
    url: Mapped[str] = mapped_column(String(800), nullable=False)
    sort_order: Mapped[int] = mapped_column(default=0, nullable=False)

    listing: Mapped[Listing] = relationship(back_populates="photos")
