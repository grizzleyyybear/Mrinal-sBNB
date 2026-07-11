from __future__ import annotations

from datetime import date
from decimal import Decimal

from sqlalchemy.orm import Session

from app.core.database import Base, SessionLocal, engine
from app.models import Amenity, Booking, BookingStatus, Listing, ListingPhoto, Review, User, Wishlist


HOME_PHOTO_BASE = "/assets/airbnb-home"
PHOTOS_PER_SECTION = 7
GALLERY_SIZE = 5


def asset_photo(section: str, index: int) -> str:
    return f"{HOME_PHOTO_BASE}/{section}-{index}.jpg"


def gallery_photos(section: str, primary_index: int) -> list[str]:
    """Build a gallery for a listing: its primary photo first, then the other
    photos from the same city section so the detail-page gallery and modal have
    enough images to render."""
    ordered = [primary_index] + [
        ((primary_index - 1 + offset) % PHOTOS_PER_SECTION) + 1 for offset in range(1, PHOTOS_PER_SECTION)
    ]
    return [asset_photo(section, index) for index in ordered[:GALLERY_SIZE]]


def reset_database() -> None:
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


def create_users(db: Session) -> dict[str, User]:
    users = [
        User(
            name="Aanya Rao",
            email="aanya.host@example.com",
            avatar_url="https://i.pravatar.cc/160?img=47",
            is_host=True,
            is_superhost=True,
        ),
        User(
            name="Kabir Mehta",
            email="kabir.host@example.com",
            avatar_url="https://i.pravatar.cc/160?img=12",
            is_host=True,
            is_superhost=False,
        ),
        User(
            name="Meera Kapoor",
            email="meera.host@example.com",
            avatar_url="https://i.pravatar.cc/160?img=32",
            is_host=True,
            is_superhost=True,
        ),
        User(
            name="Rohan Sen",
            email="rohan.guest@example.com",
            avatar_url="https://i.pravatar.cc/160?img=68",
            is_host=False,
            is_superhost=False,
        ),
        User(
            name="Tara Iyer",
            email="tara.guest@example.com",
            avatar_url="https://i.pravatar.cc/160?img=44",
            is_host=False,
            is_superhost=False,
        ),
    ]
    db.add_all(users)
    db.flush()
    return {user.email: user for user in users}


def create_amenities(db: Session) -> dict[str, Amenity]:
    amenity_rows = [
        ("Wifi", "wifi"),
        ("Kitchen", "utensils"),
        ("Pool", "waves"),
        ("Air conditioning", "snowflake"),
        ("Dedicated workspace", "laptop"),
        ("Free parking", "car"),
        ("Washer", "washing-machine"),
        ("Pet friendly", "paw-print"),
        ("Balcony", "building"),
        ("City view", "map-pin"),
        ("Breakfast", "coffee"),
        ("Self check-in", "key-round"),
    ]
    amenities = [Amenity(name=name, icon=icon) for name, icon in amenity_rows]
    db.add_all(amenities)
    db.flush()
    return {amenity.name: amenity for amenity in amenities}


def create_listings(db: Session, users: dict[str, User], amenities: dict[str, Amenity]) -> list[Listing]:
    listing_rows = [
        ("Flat in Noida", "Airbnb-style city flat with a bright living room, compact kitchen, and easy access to Noida cafes.", "Flat", "Noida", "India", 28.5355, 77.3910, "2812.00", 4, 2, 2, 2.0, "aanya.host@example.com", ["Wifi", "Kitchen", "Air conditioning", "Self check-in"], "noida", 1, 5.0),
        ("Flat in Sector 75", "Warm private flat in Sector 75 with a cozy bedroom, lift access, and a quiet work corner.", "Flat", "Noida", "India", 28.5794, 77.3841, "2812.00", 3, 1, 1, 1.0, "kabir.host@example.com", ["Wifi", "Kitchen", "Air conditioning", "Dedicated workspace"], "noida", 2, 4.92),
        ("Guest house in Noida", "Guest house with cheerful interiors, a sofa lounge, and simple access to metro corridors.", "Guest house", "Noida", "India", 28.5742, 77.3560, "2255.00", 3, 1, 2, 1.0, "meera.host@example.com", ["Wifi", "Kitchen", "Free parking", "Self check-in"], "noida", 3, 5.0),
        ("Flat in Sector 77", "Peaceful Sector 77 apartment with a lounge setup, dining nook, and reliable air conditioning.", "Flat", "Noida", "India", 28.5747, 77.3746, "3163.50", 4, 2, 2, 2.0, "aanya.host@example.com", ["Wifi", "Air conditioning", "Kitchen", "Washer"], "noida", 4, 4.76),
        ("Flat in Sector 94", "Stylish flat near Sector 94 with a dramatic bedroom, city views, and premium linens.", "Flat", "Noida", "India", 28.5142, 77.3495, "2640.00", 2, 1, 1, 1.0, "kabir.host@example.com", ["Wifi", "Air conditioning", "City view", "Self check-in"], "noida", 5, 4.96),
        ("Flat in Noida", "Modern Noida stay with quick road connectivity, secure entry, and a clean private room.", "Flat", "Noida", "India", 28.5672, 77.3260, "3925.50", 3, 1, 1, 1.0, "meera.host@example.com", ["Wifi", "Free parking", "Air conditioning", "Dedicated workspace"], "noida", 6, 4.88),
        ("Apartment in Sector 94", "High-rise apartment in Sector 94 with balcony seating, soft lighting, and a polished bedroom.", "Apartment", "Noida", "India", 28.5159, 77.3509, "4222.50", 4, 2, 2, 2.0, "aanya.host@example.com", ["Wifi", "Balcony", "Kitchen", "Air conditioning"], "noida", 7, 4.93),
        ("Apartment in Dehradun", "Comfortable Dehradun apartment with a calm bedroom, warm storage wall, and easy check-in.", "Apartment", "Dehradun", "India", 30.3165, 78.0322, "3893.00", 3, 1, 1, 1.0, "kabir.host@example.com", ["Wifi", "Kitchen", "Air conditioning", "Self check-in"], "dehradun", 1, 5.0),
        ("Flat in Dehradun", "Spacious Dehradun flat with a sectional sofa, marble flooring, and room for a weekend group.", "Flat", "Dehradun", "India", 30.3292, 78.0470, "4051.50", 5, 2, 3, 2.0, "meera.host@example.com", ["Wifi", "Kitchen", "Free parking", "Washer"], "dehradun", 2, 5.0),
        ("Apartment in Dehradun", "Apartment with an orange lounge setup, warm lights, and fast access to Rajpur Road.", "Apartment", "Dehradun", "India", 30.3640, 78.0741, "3412.00", 4, 2, 2, 2.0, "aanya.host@example.com", ["Wifi", "Kitchen", "Air conditioning", "Dedicated workspace"], "dehradun", 3, 5.0),
        ("Flat in Kulhan Karanpur", "Guest-favourite flat around Kulhan Karanpur with a tidy bedroom and simple transit access.", "Flat", "Dehradun", "India", 30.3826, 78.0870, "2042.50", 2, 1, 1, 1.0, "kabir.host@example.com", ["Wifi", "Air conditioning", "Kitchen", "Self check-in"], "dehradun", 4, 5.0),
        ("Flat in Dehradun", "Quiet Dehradun flat with a plush living room, balcony light, and an easy weekend rhythm.", "Flat", "Dehradun", "India", 30.3361, 78.0538, "3715.00", 4, 2, 2, 2.0, "meera.host@example.com", ["Wifi", "Kitchen", "Balcony", "Free parking"], "dehradun", 5, 4.88),
        ("Flat in Dehradun", "Polished flat with decorative lighting, a bright lounge, and comfortable seating for evenings in.", "Flat", "Dehradun", "India", 30.3455, 78.0648, "6583.50", 5, 2, 3, 2.0, "aanya.host@example.com", ["Wifi", "Kitchen", "Air conditioning", "City view"], "dehradun", 6, 4.9),
        ("Apartment in Dehradun", "Apartment with a media wall, generous sofa seating, and a clean family-ready layout.", "Apartment", "Dehradun", "India", 30.3198, 78.0339, "4565.00", 4, 2, 2, 2.0, "kabir.host@example.com", ["Wifi", "Kitchen", "Washer", "Free parking"], "dehradun", 7, 4.98),
        ("Flat in Gurugram", "Studio-style Gurgaon stay with a compact dining corner and a bright private balcony.", "Flat", "Gurgaon District", "India", 28.4595, 77.0266, "5200.00", 2, 1, 1, 1.0, "meera.host@example.com", ["Wifi", "Air conditioning", "Dedicated workspace", "Self check-in"], "gurgaon", 1, 5.0),
        ("Apartment in Sector 53", "Apartment near Sector 53 with a dark sofa lounge, TV wall, and skyline-facing windows.", "Apartment", "Gurgaon District", "India", 28.4386, 77.0950, "6800.00", 4, 2, 2, 2.0, "aanya.host@example.com", ["Wifi", "Kitchen", "Balcony", "Air conditioning"], "gurgaon", 2, 4.93),
        ("Place to stay in Sector 53", "Minimal serviced stay in Sector 53 with built-in storage and a comfortable work setup.", "Serviced apartment", "Gurgaon District", "India", 28.4369, 77.0948, "6120.00", 3, 1, 1, 1.0, "kabir.host@example.com", ["Wifi", "Dedicated workspace", "Air conditioning", "Self check-in"], "gurgaon", 3, 4.83),
        ("Flat in Sector 49 Manesar", "Window-side flat around Sector 49 Manesar with sunset views and a hotel-like bed.", "Flat", "Gurgaon District", "India", 28.4070, 76.9585, "7400.00", 3, 1, 1, 1.0, "meera.host@example.com", ["Wifi", "Kitchen", "City view", "Free parking"], "gurgaon", 4, 4.88),
        ("Apartment in Gurugram", "Apartment in Gurugram with a chandelier-lit lounge, smart TV, and a comfortable sofa area.", "Apartment", "Gurgaon District", "India", 28.4572, 77.0727, "8350.00", 5, 2, 3, 2.0, "aanya.host@example.com", ["Wifi", "Kitchen", "Air conditioning", "Washer"], "gurgaon", 5, 4.92),
        ("Apartment in Gurugram", "Sunset-facing Gurugram apartment with a balcony lounge and soft neutral interiors.", "Apartment", "Gurgaon District", "India", 28.4518, 77.0652, "9200.00", 4, 2, 2, 2.0, "kabir.host@example.com", ["Wifi", "Balcony", "Kitchen", "Air conditioning"], "gurgaon", 6, 4.95),
        ("Flat in Sector 51", "Guest-favourite Sector 51 flat with a calm bedroom, compact desk, and bright wall finishes.", "Flat", "Gurgaon District", "India", 28.4238, 77.0635, "5750.00", 2, 1, 1, 1.0, "meera.host@example.com", ["Wifi", "Air conditioning", "Dedicated workspace", "Self check-in"], "gurgaon", 7, 5.0),
        ("Apartment near India Gate", "Bright New Delhi apartment with a quiet bedroom, a compact kitchen, and an easy connection to museums and parks.", "Apartment", "New Delhi", "India", 28.6129, 77.2295, "6900.00", 4, 2, 2, 2.0, "aanya.host@example.com", ["Wifi", "Kitchen", "Air conditioning", "Dedicated workspace"], "gurgaon", 1, 4.91),
        ("Heritage stay in Old Delhi", "Character-filled stay close to Old Delhi markets with air conditioning, a refreshed bath, and a relaxed reading area.", "Heritage", "New Delhi", "India", 28.6562, 77.2410, "5400.00", 3, 1, 2, 1.0, "kabir.host@example.com", ["Wifi", "Air conditioning", "Breakfast", "Self check-in"], "noida", 2, 4.84),
        ("Garden home in Rishikesh", "Peaceful Rishikesh home with a garden-facing sitting area, reliable wifi, and room to slow down after a day outdoors.", "House", "Rishikesh", "India", 30.0869, 78.2676, "6100.00", 5, 2, 3, 2.0, "meera.host@example.com", ["Wifi", "Kitchen", "Free parking", "Balcony"], "dehradun", 3, 4.96),
        ("Riverside cabin in Rishikesh", "Compact cabin stay with warm wood finishes, a practical work corner, and easy access to the riverfront.", "Cabin", "Rishikesh", "India", 30.1031, 78.2848, "4800.00", 2, 1, 1, 1.0, "aanya.host@example.com", ["Wifi", "Dedicated workspace", "Free parking", "Self check-in"], "dehradun", 4, 4.89),
        ("Pink City courtyard stay", "Jaipur apartment with a light-filled living room, traditional touches, and a calm courtyard-facing bedroom.", "Apartment", "Jaipur", "India", 26.9124, 75.7873, "5300.00", 4, 2, 2, 2.0, "kabir.host@example.com", ["Wifi", "Kitchen", "Air conditioning", "Breakfast"], "noida", 5, 4.93),
        ("Jaipur balcony loft", "A compact loft in Jaipur with a private balcony, reliable air conditioning, and a carefully arranged lounge.", "Loft", "Jaipur", "India", 26.8850, 75.7680, "4500.00", 2, 1, 1, 1.0, "meera.host@example.com", ["Wifi", "Balcony", "Air conditioning", "Self check-in"], "gurgaon", 6, 4.87),
        ("Beach apartment in Goa", "Relaxed apartment near the coast with a breezy balcony, clean linens, and simple self check-in.", "Apartment", "Goa", "India", 15.2993, 74.1240, "7200.00", 4, 2, 2, 2.0, "aanya.host@example.com", ["Wifi", "Balcony", "Pool", "Air conditioning"], "dehradun", 7, 4.95),
        ("Goa poolside bungalow", "Private bungalow stay with a pool, outdoor dining space, and enough room for a small group.", "Bungalow", "Goa", "India", 15.4909, 73.8278, "8900.00", 6, 3, 4, 3.0, "kabir.host@example.com", ["Wifi", "Pool", "Kitchen", "Free parking"], "noida", 1, 4.98),
        ("Hillside home in Mussoorie", "Comfortable Mussoorie stay with a city view, warm interiors, and a balcony for slow mornings.", "House", "Mussoorie", "India", 30.4598, 78.0644, "7600.00", 5, 2, 3, 2.0, "meera.host@example.com", ["Wifi", "Balcony", "City view", "Free parking"], "gurgaon", 2, 4.94),
        ("Sea-view apartment in Mumbai", "Well-connected Mumbai apartment with a bright lounge, fast wifi, and a balcony made for evening city views.", "Apartment", "Mumbai", "India", 19.0760, 72.8777, "9800.00", 4, 2, 2, 2.0, "aanya.host@example.com", ["Wifi", "Balcony", "Air conditioning", "Dedicated workspace"], "noida", 3, 4.92),
        ("Bandra city loft", "A compact Mumbai loft with thoughtful storage, reliable self check-in, and a calm workspace.", "Loft", "Mumbai", "India", 19.0596, 72.8295, "8400.00", 3, 1, 1, 1.0, "kabir.host@example.com", ["Wifi", "Air conditioning", "Dedicated workspace", "Self check-in"], "dehradun", 4, 4.86),
        ("Lake-side cabin in Nainital", "Cozy cabin near Nainital with warm interiors, free parking, and a quiet view over the hills.", "Cabin", "Nainital", "India", 29.3803, 79.4636, "6800.00", 4, 2, 2, 2.0, "meera.host@example.com", ["Wifi", "Free parking", "Balcony", "Kitchen"], "gurgaon", 5, 4.97),
        ("Nainital family home", "Comfortable hillside home with a living room, well-equipped kitchen, and room for a family weekend.", "House", "Nainital", "India", 29.3919, 79.4542, "7300.00", 6, 3, 4, 2.0, "aanya.host@example.com", ["Wifi", "Kitchen", "Free parking", "Washer"], "noida", 6, 4.9),
        ("Bengaluru work-friendly flat", "Practical Bengaluru flat with a dedicated desk, fast wifi, and a restful bedroom after a day in the city.", "Flat", "Bengaluru", "India", 12.9716, 77.5946, "6500.00", 3, 1, 1, 1.0, "kabir.host@example.com", ["Wifi", "Dedicated workspace", "Air conditioning", "Self check-in"], "dehradun", 7, 4.88),
        ("Bengaluru garden apartment", "Garden-facing Bengaluru apartment with a comfortable lounge, kitchen, and easy parking.", "Apartment", "Bengaluru", "India", 12.9352, 77.6245, "7100.00", 4, 2, 2, 2.0, "meera.host@example.com", ["Wifi", "Kitchen", "Free parking", "Balcony"], "gurgaon", 1, 4.94),
        ("Coastal villa in Alibaug", "Spacious Alibaug villa with a pool, generous common spaces, and room for a large family or group stay.", "Villa", "Alibaug", "India", 18.6414, 72.8722, "18500.00", 20, 7, 12, 7.0, "aanya.host@example.com", ["Wifi", "Pool", "Kitchen", "Free parking", "Balcony"], "noida", 4, 4.98),
        ("Mountain chalet in Manali", "Warm chalet in Manali with wide views, comfortable beds, and practical space for a group getaway.", "Chalet", "Manali", "India", 32.2432, 77.1892, "14200.00", 14, 5, 9, 5.0, "kabir.host@example.com", ["Wifi", "Kitchen", "Free parking", "Balcony", "City view"], "dehradun", 5, 4.96),
        ("Beach house in North Goa", "Large beach stay with a pool, outdoor dining, and plenty of room for friends or an extended family.", "Beach", "North Goa", "India", 15.5697, 73.7730, "21000.00", 20, 8, 14, 8.0, "meera.host@example.com", ["Wifi", "Pool", "Kitchen", "Free parking", "Air conditioning"], "gurgaon", 6, 5.0),
        ("Lonavala garden bungalow", "Group-ready bungalow in Lonavala with a garden, ample parking, and a bright shared living space.", "Bungalow", "Lonavala", "India", 18.7546, 73.4062, "15800.00", 16, 6, 10, 6.0, "aanya.host@example.com", ["Wifi", "Kitchen", "Free parking", "Balcony", "Washer"], "noida", 7, 4.95),
        ("Udaipur heritage haveli", "Restored Udaipur heritage stay with generous bedrooms, a courtyard feel, and easy access to the old city.", "Heritage", "Udaipur", "India", 24.5854, 73.7125, "12500.00", 12, 5, 8, 5.0, "kabir.host@example.com", ["Wifi", "Breakfast", "Air conditioning", "City view"], "dehradun", 1, 4.93),
    ]

    listings: list[Listing] = []
    for row in listing_rows:
        (
            title,
            description,
            property_type,
            city,
            country,
            lat,
            lng,
            price,
            max_guests,
            bedrooms,
            beds,
            baths,
            host_email,
            amenity_names,
            photo_section,
            photo_index,
            rating,
        ) = row
        listing = Listing(
            host=users[host_email],
            title=title,
            description=description,
            property_type=property_type,
            location_city=city,
            location_country=country,
            lat=lat,
            lng=lng,
            price_per_night=Decimal(price),
            max_guests=max_guests,
            bedrooms=bedrooms,
            beds=beds,
            baths=baths,
            amenities=[amenities[name] for name in amenity_names],
        )
        listing.photos = [
            ListingPhoto(url=url, sort_order=sort_order)
            for sort_order, url in enumerate(gallery_photos(photo_section, photo_index))
        ]
        listing._seed_rating = rating
        listings.append(listing)

    db.add_all(listings)
    db.flush()
    return listings


def create_bookings(db: Session, users: dict[str, User], listings: list[Listing]) -> list[Booking]:
    booking_rows = [
        (0, "rohan.guest@example.com", date(2026, 3, 10), date(2026, 3, 14), 2, BookingStatus.CONFIRMED),
        (1, "tara.guest@example.com", date(2026, 4, 2), date(2026, 4, 5), 2, BookingStatus.CONFIRMED),
        (2, "rohan.guest@example.com", date(2026, 5, 18), date(2026, 5, 21), 2, BookingStatus.CONFIRMED),
        (3, "tara.guest@example.com", date(2026, 6, 4), date(2026, 6, 8), 2, BookingStatus.CONFIRMED),
        (4, "rohan.guest@example.com", date(2026, 8, 15), date(2026, 8, 19), 2, BookingStatus.CONFIRMED),
        (5, "tara.guest@example.com", date(2026, 9, 5), date(2026, 9, 9), 2, BookingStatus.CONFIRMED),
        (6, "rohan.guest@example.com", date(2026, 10, 20), date(2026, 10, 23), 2, BookingStatus.CONFIRMED),
        (7, "tara.guest@example.com", date(2026, 11, 11), date(2026, 11, 16), 2, BookingStatus.CONFIRMED),
        (8, "rohan.guest@example.com", date(2026, 12, 22), date(2026, 12, 27), 2, BookingStatus.CONFIRMED),
        (9, "tara.guest@example.com", date(2027, 1, 8), date(2027, 1, 11), 2, BookingStatus.CONFIRMED),
    ]
    bookings = [
        Booking(
            listing=listings[listing_index],
            guest=users[email],
            check_in=check_in,
            check_out=check_out,
            guests=guests,
            total_price=calculate_seed_total(listings[listing_index].price_per_night, check_in, check_out),
            status=status,
        )
        for listing_index, email, check_in, check_out, guests, status in booking_rows
    ]
    db.add_all(bookings)
    db.flush()
    return bookings


def calculate_seed_total(nightly_price: Decimal, check_in: date, check_out: date) -> Decimal:
    nights = (check_out - check_in).days
    cleaning_fee = Decimal("3500.00")
    service_fee = nightly_price * Decimal(nights) * Decimal("0.12")
    return (nightly_price * Decimal(nights) + cleaning_fee + service_fee).quantize(Decimal("0.01"))


def review_scores_for_rating(target: float) -> list[int]:
    if target >= 5:
        return [5, 5, 5]

    for total in range(2, 101):
        for four_star_count in range(1, total + 1):
            score = round((5 * (total - four_star_count) + 4 * four_star_count) / total, 2)
            if score == round(target, 2):
                return [4] * four_star_count + [5] * (total - four_star_count)

    return [5]


def create_reviews(db: Session, users: dict[str, User], listings: list[Listing], bookings: list[Booking]) -> None:
    review_comments = [
        "Spotless, easy check-in, and exactly like the photos.",
        "Comfortable stay with thoughtful details and a responsive host.",
        "Great location, polished interiors, and a stay we would repeat.",
    ]
    guests = [users["rohan.guest@example.com"], users["tara.guest@example.com"]]

    reviews: list[Review] = []
    for listing_index, listing in enumerate(listings):
        target_rating = getattr(listing, "_seed_rating", 5.0)
        for review_index, score in enumerate(review_scores_for_rating(target_rating)):
            reviews.append(
                Review(
                    listing=listing,
                    author=guests[(listing_index + review_index) % len(guests)],
                    booking=bookings[listing_index] if listing_index < len(bookings) and review_index == 0 else None,
                    rating=score,
                    comment=review_comments[(listing_index + review_index) % len(review_comments)],
                )
            )

    db.add_all(reviews)


def create_wishlists(db: Session, users: dict[str, User], listings: list[Listing]) -> None:
    db.add_all(
        [
            Wishlist(user=users["rohan.guest@example.com"], listing=listings[0]),
            Wishlist(user=users["rohan.guest@example.com"], listing=listings[7]),
            Wishlist(user=users["tara.guest@example.com"], listing=listings[2]),
            Wishlist(user=users["tara.guest@example.com"], listing=listings[14]),
        ]
    )


def seed_database() -> None:
    reset_database()
    with SessionLocal() as db:
        users = create_users(db)
        amenities = create_amenities(db)
        listings = create_listings(db, users, amenities)
        bookings = create_bookings(db, users, listings)
        create_reviews(db, users, listings, bookings)
        create_wishlists(db, users, listings)
        db.commit()


if __name__ == "__main__":
    seed_database()
    print("Seeded SQLite database with Airbnb-reference users, listings, photos, amenities, bookings, reviews, and wishlists.")
