from datetime import date

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user, require_host
from app.models import User
from app.schemas import ApiMessage, BookedDateRange, ListingCreate, ListingDetail, ListingPage, ListingUpdate
from app.services import listings as listing_service

router = APIRouter(prefix="/listings", tags=["listings"])


@router.get("", response_model=ListingPage)
def search_listings(
    location: str | None = None,
    check_in: date | None = None,
    check_out: date | None = None,
    guests: int | None = Query(default=None, ge=1),
    min_price: int | None = Query(default=None, ge=0),
    max_price: int | None = Query(default=None, ge=0),
    min_bedrooms: int | None = Query(default=None, ge=0),
    min_beds: int | None = Query(default=None, ge=0),
    min_baths: int | None = Query(default=None, ge=0),
    property_type: str | None = None,
    amenities: list[str] | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=12, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ListingPage:
    return listing_service.search_listings(
        db=db,
        current_user=current_user,
        location=location,
        check_in=check_in,
        check_out=check_out,
        guests=guests,
        min_price=min_price,
        max_price=max_price,
        min_bedrooms=min_bedrooms,
        min_beds=min_beds,
        min_baths=min_baths,
        property_type=property_type,
        amenities=amenities,
        page=page,
        limit=limit,
    )


@router.post("", response_model=ListingDetail, status_code=status.HTTP_201_CREATED)
def create_listing(
    payload: ListingCreate,
    db: Session = Depends(get_db),
    current_host: User = Depends(require_host),
) -> ListingDetail:
    return listing_service.create_listing(db, payload, current_host)


@router.get("/{listing_id}", response_model=ListingDetail)
def get_listing(
    listing_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ListingDetail:
    return listing_service.get_listing_detail(db, listing_id, current_user)


@router.put("/{listing_id}", response_model=ListingDetail)
def update_listing(
    listing_id: int,
    payload: ListingUpdate,
    db: Session = Depends(get_db),
    current_host: User = Depends(require_host),
) -> ListingDetail:
    return listing_service.update_listing(db, listing_id, payload, current_host)


@router.delete("/{listing_id}", response_model=ApiMessage)
def delete_listing(
    listing_id: int,
    db: Session = Depends(get_db),
    current_host: User = Depends(require_host),
) -> ApiMessage:
    listing_service.delete_listing(db, listing_id, current_host)
    return ApiMessage(message="Listing deleted.")


@router.get("/{listing_id}/availability", response_model=list[BookedDateRange])
def get_listing_availability(listing_id: int, db: Session = Depends(get_db)) -> list[BookedDateRange]:
    return listing_service.get_availability(db, listing_id)
