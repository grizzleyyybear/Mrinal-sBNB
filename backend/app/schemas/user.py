from app.schemas.common import ORMModel
from pydantic import BaseModel


class UserSwitch(BaseModel):
    user_id: int


class UserRead(ORMModel):
    id: int
    name: str
    email: str
    avatar_url: str
    is_host: bool
    is_superhost: bool
