from pydantic import BaseModel


class TrackResponse(BaseModel):

    title: str

    artist: str

    album: str

    genre: str

    releaseyear: int

    duration: str

    isrc: str

    albumArturl: str

    previewUrl: str
    
    spotifyUrl : str
    
    appleMusicUrl: str
    
    songLink : str
    
    thumbnail : str


class MusicRecognitionResponse(BaseModel):

    IsSuccessful: bool

    confidenceScore: float

    message: str

    track: TrackResponse | None
    

class MovieResponse(BaseModel):

    title: str

    poster: str

    genre: list[str]

    releaseyear: int

    director: str

    cast: list[str]

    duration: str

    synopsis: str

    trailerUrl: str

    imdbId: str

    rating: float



class MovieRecognitionResponse(BaseModel):

    IsSuccessful: bool

    confidenceScore: float

    message: str

    movie: MovieResponse | None