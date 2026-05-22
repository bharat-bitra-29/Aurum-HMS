from pydantic_settings import BaseSettings
from pydantic import ConfigDict
from typing import Optional


class Settings(BaseSettings):
    model_config = ConfigDict(env_file=".env", extra="ignore")

    SECRET_KEY: str = "luxury-hotel-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24
    DATABASE_URL: str = "sqlite:///./hotel.db"
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://localhost:3000"]
    COMMISSION_RATE: float = 0.10

    # Email configuration (Brevo SMTP)
    EMAIL_PROVIDER: str = "brevo"  # Options: "brevo", "resend", or "none"
    BREVO_API_KEY: str = ""  # Get from https://app.brevo.com/settings/keys/api
    RESEND_API_KEY: Optional[str] = None
    FROM_EMAIL: str = "noreply@aurum-hotels.com"
    FROM_NAME: str = "Aurum Hotels"


settings = Settings()