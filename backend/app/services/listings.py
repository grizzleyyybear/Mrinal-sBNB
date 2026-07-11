from __future__ import annotations

from datetime import date
from math import ceil

from fastapi import HTTPException, status
from sqlalchemy import Select, func, select
from sqlalchemy.orm import Session, selectinload

from app.models import Amenity, Booking, BookingStatus, Listing, ListingPhoto, Review, User, Wishlist
from app.schemas import (
    BookedDateRange,
    HostBooking,
    HostListingWithBookings,
    ListingCard,
    ListingCreate,
    ListingDetail,
    ListingPage,
    ListingUpdate,
)


def listing_load_options() -> list:
    return [
        selectinload(Listing.host),
        selectinload(Listing.photos),
        selectinload(Listing.amenities),
        selectinload(Listing.reviews).selectinload(Review.author),
        selectinload(Listing.bookings).selectinload(Booking.guest),
    ]


def build_listing_card(listing: Listing, wishlisted_ids: set[int] | None = None) -> ListingCard:
    review_count = len(listing.reviews)
    rating = round(sum(review.rating for review in listing.reviews) / review_count, 2) if review_count else None
    first_photo_url = listing.photos[0].url if listing.photos else None

    return ListingCard(
        id=listing.id,
        title=listing.title,
        property_type=listing.property_type,
        location_city=listing.location_city,
        location_country=listing.location_country,
        lat=listing.lat,
        lng=listing.lng,
        price_per_night=listing.price_per_night,
        max_guests=listing.max_guests,
        bedrooms=listing.bedrooms,
        beds=listing.beds,
        baths=listing.baths,
        created_at=listing.created_at,
        first_photo_url=first_photo_url,
        photo_urls=[photo.url for photo in listing.photos],
        rating=rating,
        review_count=review_count,
        is_wishlisted=listing.id in (wishlisted_ids or set()),
    )


def get_wishlisted_ids(db: Session, user_id: int) -> set[int]:
    return set(db.scalars(select(Wishlist.listing_id).where(Wishlist.user_id == user_id)).all())


def apply_listing_filters(
    query: Select[tuple[Listing]],
    location: str | None,
    check_in: date | None,
    check_out: date | None,
    guests: int | None,
    min_price: int | None,
    max_price: int | None,
    min_bedrooms: int | None,
    min_beds: int | None,
    min_baths: int | None,
    property_type: str | None,
    amenities: list[str] | None,
) -> Select[tuple[Listing]]:
    if location:
        pattern = f"%{location.strip()}%"
        query = query.where(
            Listing.location_city.ilike(pattern)
            | Listing.location_country.ilike(pattern)
            | Listing.title.ilike(pattern)
        )

    if guests:
        query = query.where(Listing.max_guests >= guests)

    if min_price is not None:
        query = query.where(Listing.price_per_night >= min_price)

    if max_price is not None:
        query = query.where(Listing.price_per_night <= max_price)

    if min_bedrooms is not None:
        query = query.where(Listing.bedrooms >= min_bedrooms)

    if min_beds is not None:
        query = query.where(Listing.beds >= min_beds)

    if min_baths is not None:
        query = query.where(Listing.baths >= min_baths)

    if property_type:
        property_types = [value.strip() for value in property_type.split(",") if value.strip()]
        if property_types:
            query = query.where(Listing.property_type.in_(property_types))

    for amenity in amenities or []:
        token = amenity.strip()
        if not token:
            continue
        if token.isdigit():
            query = query.where(Listing.amenities.any(Amenity.id == int(token)))
        else:
            query = query.where(Listing.amenities.any(Amenity.name.ilike(f"%{token}%")))

    if check_in and check_out:
        if check_out <= check_in:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="check_out must be after check_in.")
        overlapping_booking_ids = (
            select(Booking.listing_id)
            .where(
                Booking.status == BookingStatus.CONFIRMED,
                Booking.check_in < check_out,
                Booking.check_out > check_in,
            )
            .subquery()
        )
        query = query.where(Listing.id.not_in(select(overlapping_booking_ids.c.listing_id)))

    return query


def search_listings(
    db: Session,
    current_user: User,
    location: str | None = None,
    check_in: date | None = None,
    check_out: date | None = None,
    guests: int | None = None,
    min_price: int | None = None,
    max_price: int | None = None,
    min_bedrooms: int | None = None,
    min_beds: int | None = None,
    min_baths: int | None = None,
    property_type: str | None = None,
    amenities: list[str] | None = None,
    page: int = 1,
    limit: int = 12,
) -> ListingPage:
    page = max(page, 1)
    limit = min(max(limit, 1), 50)

    query = select(Listing).options(*listing_load_options()).order_by(Listing.created_at.desc(), Listing.id.desc())
    query = apply_listing_filters(query, location, check_in, check_out, guests, min_price, max_price, min_bedrooms, min_beds, min_baths, property_type, amenities)

    total = db.scalar(select(func.count()).select_from(query.order_by(None).subquery())) or 0
    listings = db.scalars(query.offset((page - 1) * limit).limit(limit)).all()
    wishlisted_ids = get_wishlisted_ids(db, current_user.id)

    return ListingPage(
        items=[build_listing_card(listing, wishlisted_ids) for listing in listings],
        page=page,
        limit=limit,
        total=total,
        pages=ceil(total / limit) if total else 0,
    )


def get_listing_or_404(db: Session, listing_id: int) -> Listing:
    listing = db.scalar(select(Listing).options(*listing_load_options()).where(Listing.id == listing_id))
    if listing is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found.")
    return listing


def get_booked_date_ranges(listing: Listing) -> list[BookedDateRange]:
    return [
        BookedDateRange(check_in=booking.check_in, check_out=booking.check_out)
        for booking in listing.bookings
        if booking.status == BookingStatus.CONFIRMED
    ]


def get_listing_detail(db: Session, listing_id: int, current_user: User) -> ListingDetail:
    listing = get_listing_or_404(db, listing_id)
    card = build_listing_card(listing, get_wishlisted_ids(db, current_user.id))

    return ListingDetail(
        id=listing.id,
        host_id=listing.host_id,
        title=listing.title,
        description=listing.description,
        property_type=listing.property_type,
        location_city=listing.location_city,
        location_country=listing.location_country,
        lat=listing.lat,
        lng=listing.lng,
        price_per_night=listing.price_per_night,
        max_guests=listing.max_guests,
        bedrooms=listing.bedrooms,
        beds=listing.beds,
        baths=listing.baths,
        created_at=listing.created_at,
        host=listing.host,
        photos=listing.photos,
        amenities=listing.amenities,
        reviews=listing.reviews,
        booked_date_ranges=get_booked_date_ranges(listing),
        rating=card.rating,
        review_count=card.review_count,
        is_wishlisted=card.is_wishlisted,
    )


def get_amenities_by_ids(db: Session, amenity_ids: list[int]) -> list[Amenity]:
    if not amenity_ids:
        return []

    amenities = db.scalars(select(Amenity).where(Amenity.id.in_(amenity_ids))).all()
    if len(amenities) != len(set(amenity_ids)):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="One or more amenities were not found.")
    return list(amenities)


def create_listing(db: Session, payload: ListingCreate, host: User) -> ListingDetail:
    listing = Listing(host=host, **payload.model_dump(exclude={"photo_urls", "amenity_ids"}))
    listing.photos = [ListingPhoto(url=url, sort_order=index) for index, url in enumerate(payload.photo_urls)]
    listing.amenities = get_amenities_by_ids(db, payload.amenity_ids)

    db.add(listing)
    db.commit()
    db.refresh(listing)
    return get_listing_detail(db, listing.id, host)


def update_listing(db: Session, listing_id: int, payload: ListingUpdate, host: User) -> ListingDetail:
    listing = get_listing_or_404(db, listing_id)
    if listing.host_id != host.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only edit your own listings.")

    data = payload.model_dump(exclude_unset=True)
    photo_urls = data.pop("photo_urls", None)
    amenity_ids = data.pop("amenity_ids", None)

    for key, value in data.items():
        setattr(listing, key, value)

    if photo_urls is not None:
        if not photo_urls:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="At least one photo URL is required.")
        listing.photos = [ListingPhoto(url=url, sort_order=index) for index, url in enumerate(photo_urls)]

    if amenity_ids is not None:
        listing.amenities = get_amenities_by_ids(db, amenity_ids)

    db.commit()
    return get_listing_detail(db, listing.id, host)


def delete_listing(db: Session, listing_id: int, host: User) -> None:
    listing = get_listing_or_404(db, listing_id)
    if listing.host_id != host.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only delete your own listings.")

    db.delete(listing)
    db.commit()


def get_availability(db: Session, listing_id: int) -> list[BookedDateRange]:
    listing = get_listing_or_404(db, listing_id)
    return get_booked_date_ranges(listing)


def get_host_dashboard(db: Session, host: User) -> list[HostListingWithBookings]:
    listings = db.scalars(
        select(Listing)
        .options(*listing_load_options())
        .where(Listing.host_id == host.id)
        .order_by(Listing.created_at.desc(), Listing.id.desc())
    ).all()
    wishlisted_ids = get_wishlisted_ids(db, host.id)

    return [
        HostListingWithBookings(
            listing=build_listing_card(listing, wishlisted_ids),
            bookings=[HostBooking.model_validate(booking) for booking in listing.bookings],
        )
        for listing in listings
    ]
