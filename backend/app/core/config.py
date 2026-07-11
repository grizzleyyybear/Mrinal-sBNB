import os
from dataclasses import dataclass
from pathlib import Path


BACKEND_DIR = Path(__file__).resolve().parents[2]
DEFAULT_DATABASE_URL = "sqlite:////tmp/airbnb_clone.db" if os.getenv("VERCEL") else f"sqlite:///{(BACKEND_DIR / 'airbnb_clone.db').as_posix()}"


@dataclass(frozen=True)
class Settings:
    app_name: str = "Mrinal-sBNB API"
    database_url: str = os.getenv("DATABASE_URL", DEFAULT_DATABASE_URL)
    frontend_origins: tuple[str, ...] = tuple(
        origin.strip()
        for origin in os.getenv(
            "FRONTEND_ORIGINS",
            "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001",
        ).split(",")
        if origin.strip()
    )


settings = Settings()
