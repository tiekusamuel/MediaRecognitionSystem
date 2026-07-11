from pydantic import BaseModel


class TrackResponse(BaseModel):

    title: str

    artist: str

    album: str

    genre: str

    releaseyear: int

    duration: str

    isrc: str

    albumarturl: str

    previewurl: str


class MusicRecognitionResponse(BaseModel):

    IsSuccessful: bool

    confidenceScore: float

    message: str

    track: TrackResponse | None