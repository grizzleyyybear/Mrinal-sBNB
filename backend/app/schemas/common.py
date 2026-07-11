from pydantic import BaseModel, ConfigDict


class ApiMessage(BaseModel):
    message: str


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)
