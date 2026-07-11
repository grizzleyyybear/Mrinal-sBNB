from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, Field

from app.schemas.amenity import AmenityRead
from app.schemas.common import ORMModel
from app.schemas.review import ReviewRead
from app.schemas.user import UserRead


class ListingPhotoRead(ORMModel):
    id: int
    url: str
    sort_order: int


class BookedDateRange(BaseModel):
    check_in: date
    check_out: date


class ListingBase(BaseModel):
    title: str = Field(min_length=3, max_length=180)
    description: str = Field(min_length=10)
    property_type: str = Field(min_length=2, max_length=80)
    location_city: str = Field(min_length=2, max_length=120)
    location_country: str = Field(min_length=2, max_length=120)
    lat: float
    lng: float
    price_per_night: Decimal = Field(gt=0)
    max_guests: int = Field(gt=0)
    bedrooms: int = Field(ge=0)
    beds: int = Field(gt=0)
    baths: float = Field(gt=0)


class ListingCreate(ListingBase):
    photo_urls: list[str] = Field(min_length=1)
    amenity_ids: list[int] = Field(default_factory=list)


class ListingUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=180)
    description: str | None = Field(default=None, min_length=10)
    property_type: str | None = Field(default=None, min_length=2, max_length=80)
    location_city: str | None = Field(default=None, min_length=2, max_length=120)
    location_country: str | None = Field(default=None, min_length=2, max_length=120)
    lat: float | None = None
    lng: float | None = None
    price_per_night: Decimal | None = Field(default=None, gt=0)
    max_guests: int | None = Field(default=None, gt=0)
    bedrooms: int | None = Field(default=None, ge=0)
    beds: int | None = Field(default=None, gt=0)
    baths: float | None = Field(default=None, gt=0)
    photo_urls: list[str] | None = None
    amenity_ids: list[int] | None = None


class ListingCard(ORMModel):
    id: int
    title: str
    property_type: str
    location_city: str
    location_country: str
    lat: float
    lng: float
    price_per_night: Decimal
    max_guests: int
    bedrooms: int
    beds: int
    baths: float
    created_at: datetime
    first_photo_url: str | None
    photo_urls: list[str]
    rating: float | None
    review_count: int
    is_wishlisted: bool = False


class ListingPage(BaseModel):
    items: list[ListingCard]
    page: int
    limit: int
    total: int
    pages: int


class ListingDetail(ORMModel):
    id: int
    host_id: int
    title: str
    description: str
    property_type: str
    location_city: str
    location_country: str
    lat: float
    lng: float
    price_per_night: Decimal
    max_guests: int
    bedrooms: int
    beds: int
    baths: float
    created_at: datetime
    host: UserRead
    photos: list[ListingPhotoRead]
    amenities: list[AmenityRead]
    reviews: list[ReviewRead]
    booked_date_ranges: list[BookedDateRange]
    rating: float | None
    review_count: int
    is_wishlisted: bool = False
