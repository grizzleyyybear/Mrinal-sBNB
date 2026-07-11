from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models import User
from app.schemas import WishlistResponse, WishlistToggle
from app.services import wishlists as wishlist_service

router = APIRouter(prefix="/wishlist", tags=["wishlist"])


@router.get("", response_model=WishlistResponse)
def get_wishlist(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> WishlistResponse:
    return WishlistResponse(items=wishlist_service.list_wishlist(db, current_user))


@router.post("", response_model=WishlistResponse)
def add_to_wishlist(
    payload: WishlistToggle,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> WishlistResponse:
    return WishlistResponse(items=wishlist_service.toggle_wishlist(db, payload, current_user))


@router.delete("/{listing_id}", response_model=WishlistResponse)
def remove_from_wishlist(
    listing_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> WishlistResponse:
    return WishlistResponse(items=wishlist_service.remove_from_wishlist(db, listing_id, current_user))
