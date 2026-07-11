from sqlalchemy import Boolean, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    avatar_url: Mapped[str] = mapped_column(String(500), nullable=False)
    is_host: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_superhost: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    listings: Mapped[list["Listing"]] = relationship(back_populates="host", cascade="all, delete-orphan")
    bookings: Mapped[list["Booking"]] = relationship(back_populates="guest", cascade="all, delete-orphan")
    reviews: Mapped[list["Review"]] = relationship(back_populates="author", cascade="all, delete-orphan")
    wishlist_items: Mapped[list["Wishlist"]] = relationship(back_populates="user", cascade="all, delete-orphan")
