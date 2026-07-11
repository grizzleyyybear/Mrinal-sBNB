from pydantic import BaseModel

from app.schemas.listing import ListingCard


class WishlistToggle(BaseModel):
    listing_id: int


class WishlistResponse(BaseModel):
    items: list[ListingCard]
