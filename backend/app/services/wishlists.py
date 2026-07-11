from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Listing, User, Wishlist
from app.schemas import ListingCard, WishlistToggle
from app.services.listings import build_listing_card, get_listing_or_404, get_wishlisted_ids, listing_load_options


def list_wishlist(db: Session, user: User) -> list[ListingCard]:
    listings = db.scalars(
        select(Listing)
        .join(Wishlist, Wishlist.listing_id == Listing.id)
        .options(*listing_load_options())
        .where(Wishlist.user_id == user.id)
        .order_by(Wishlist.id.desc())
    ).all()
    wishlisted_ids = get_wishlisted_ids(db, user.id)
    return [build_listing_card(listing, wishlisted_ids) for listing in listings]


def toggle_wishlist(db: Session, payload: WishlistToggle, user: User) -> list[ListingCard]:
    get_listing_or_404(db, payload.listing_id)
    existing = db.scalar(
        select(Wishlist).where(Wishlist.user_id == user.id, Wishlist.listing_id == payload.listing_id)
    )

    if existing is None:
        db.add(Wishlist(user_id=user.id, listing_id=payload.listing_id))
    else:
        db.delete(existing)

    db.commit()

    return list_wishlist(db, user)


def remove_from_wishlist(db: Session, listing_id: int, user: User) -> list[ListingCard]:
    wishlist = db.scalar(select(Wishlist).where(Wishlist.user_id == user.id, Wishlist.listing_id == listing_id))
    if wishlist is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Wishlist item not found.")

    db.delete(wishlist)
    db.commit()
    return list_wishlist(db, user)
