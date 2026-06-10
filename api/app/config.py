from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # DATABASE_URL is read here for app-level awareness (e.g. health checks);
    # Prisma also reads it directly from the environment at connect time.
    # Both must point to the same value — keep them in sync via .env.
    database_url: str
    secret_key: str = "secret"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    app_name: str = "Task Tracker API"
    cors_origins: list[str] = ["http://localhost:5173"]

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
