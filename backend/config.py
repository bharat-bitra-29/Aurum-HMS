from pydantic_settings import BaseSettings
from pydantic import ConfigDict
from typing import Optional
from pathlib import Path
import os

# Find .env file - works whether running from backend/ or project root
BACKEND_DIR = Path(__file__).parent
ENV_FILE = BACKEND_DIR / ".env"

if not ENV_FILE.exists():
    # Try parent directory
    ENV_FILE = BACKEND_DIR.parent / "backend" / ".env"

if not ENV_FILE.exists():
    # Fallback to current working directory
    ENV_FILE = Path.cwd() / ".env"


class Settings(BaseSettings):
    model_config = ConfigDict(
        env_file=str(ENV_FILE) if ENV_FILE.exists() else ".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,  # Allow both BREVO_API_KEY and brevo_api_key
    )

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

# Debug: Log where .env was loaded from
if settings.BREVO_API_KEY:
    print(f"✅ Brevo API key loaded successfully from {ENV_FILE}")
else:
    print(f"⚠️ Warning: BREVO_API_KEY is empty. Check .env file at {ENV_FILE}")
