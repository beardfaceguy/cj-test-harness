from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # DATABASE_URL is read here for app-level awareness (e.g. health checks);
    # Prisma also reads it directly from the environment at connect time.
    # Both must point to the same value — keep them in sync via .env.
    database_url: str
    # BUG-B5: default secret makes tokens trivially forgeable
    secret_key: str = "secret"
    algorithm: str = "HS256"
    # BUG-N10: no upper-bound validation on expire time — setting 9999999 makes tokens live ~115 days
    access_token_expire_minutes: int = 30
    # BUG-N3: app_name defined but never used anywhere in the codebase — dead config
    app_name: str = "Task Tracker API"
    cors_origins: list[str] = ["http://localhost:5173"]

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
