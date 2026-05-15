"""Application configuration via pydantic-settings."""

from typing import List
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    # MongoDB
    MONGODB_URL: str = Field(..., env="MONGODB_URL")
    DB_NAME: str = "interviewai"

    # JWT
    JWT_SECRET: str = Field(..., env="JWT_SECRET")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Anthropic
    ANTHROPIC_API_KEY: str = Field(..., env="ANTHROPIC_API_KEY")

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]

    # AI Models
    EMOTION_MODEL_PATH: str = "models/emotion_model.h5"
    CONFIDENCE_THRESHOLD: float = 0.6

    # Interview
    MAX_QUESTIONS_PER_SESSION: int = 10
    DEFAULT_QUESTION_TIME_SECONDS: int = 120

    # Redis (optional, for caching)
    REDIS_URL: str = "redis://localhost:6379"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
