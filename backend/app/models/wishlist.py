from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Wishlist(Base):
    __tablename__ = "wishlists"
    __table_args__ = (UniqueConstraint("user_id", "listing_id", name="uq_wishlists_user_listing"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    listing_id: Mapped[int] = mapped_column(ForeignKey("listings.id", ondelete="CASCADE"), index=True, nullable=False)

    user: Mapped["User"] = relationship(back_populates="wishlist_items")
    listing: Mapped["Listing"] = relationship(back_populates="wishlist_items")
