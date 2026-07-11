from app.schemas.common import ORMModel


class AmenityRead(ORMModel):
    id: int
    name: str
    icon: str
