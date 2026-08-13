from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Duolingo Clone API"
    api_prefix: str = "/api"
    database_url: str = "sqlite:///./duolingo.db"
    backend_cors_origins: list[str] = ["http://localhost:3000"]
    default_username: str = "learner"
    default_course_slug: str = "spanish-for-english"
    heart_regen_minutes: int = 240

    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
