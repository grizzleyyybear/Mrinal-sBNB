from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import Amenity
from app.schemas import AmenityRead

router = APIRouter(prefix="/amenities", tags=["amenities"])


@router.get("", response_model=list[AmenityRead])
def list_amenities(db: Session = Depends(get_db)) -> list[Amenity]:
    return list(db.scalars(select(Amenity).order_by(Amenity.name)).all())
