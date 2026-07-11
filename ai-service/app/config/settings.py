from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str
    HOST: str
    PORT: int
    DEBUG: bool

    AUDD_API_KEY: str = ""

    TEMP_FOLDER: str = "temp"

    MAX_AUDIO_SIZE_MB: int = 20

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )


settings = Settings()