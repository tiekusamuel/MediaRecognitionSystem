from pydantic import BaseModel


class MusicRecognitionRequest(BaseModel):
    duration_seconds: int | None = None