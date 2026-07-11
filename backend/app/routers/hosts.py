from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_host
from app.models import User
from app.schemas import HostListingWithBookings
from app.services import listings as listing_service

router = APIRouter(prefix="/hosts", tags=["hosts"])


@router.get("/me/listings", response_model=list[HostListingWithBookings])
def get_my_host_listings(
    db: Session = Depends(get_db),
    current_host: User = Depends(require_host),
) -> list[HostListingWithBookings]:
    return listing_service.get_host_dashboard(db, current_host)
