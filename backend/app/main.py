from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select

from app.core.config import settings
from app.core.database import Base, SessionLocal, engine
from app.models import Listing
from app.routers import amenities, bookings, hosts, listings, reviews, users, wishlist


def create_app() -> FastAPI:
    Base.metadata.create_all(bind=engine)

    # Vercel functions use an ephemeral writable /tmp directory, so seed a
    # fresh demo catalog only when that temporary database is empty.
    if settings.database_url.startswith("sqlite:////tmp/"):
        with SessionLocal() as db:
            has_listings = db.scalar(select(Listing.id).limit(1)) is not None
        if not has_listings:
            from app.seed import seed_database

            seed_database()

    app = FastAPI(title=settings.app_name)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=list(settings.frontend_origins),
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(users.router)
    app.include_router(amenities.router)
    app.include_router(listings.router)
    app.include_router(bookings.router)
    app.include_router(hosts.router)
    app.include_router(reviews.router)
    app.include_router(wishlist.router)

    @app.get("/health", tags=["health"])
    def health_check() -> dict[str, str]:
        return {"status": "ok"}

    return app


app = create_app()
