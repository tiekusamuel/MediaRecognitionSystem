from fastapi import APIRouter, UploadFile, File
import shutil
import uuid

from app.services.movie_service import MovieService
from app.config.settings import settings


router = APIRouter(
    prefix="/movie",
    tags=["Movie Recognition"]
)


movie_service = MovieService(
    settings.GEMINI_API_KEY
)


@router.post("/recognize")
async def recognize_movie(
    file: UploadFile = File(...)
):

    movie_id = str(uuid.uuid4())


    video_path = (
        f"temp/{movie_id}_{file.filename}"
    )


    with open(video_path, "wb") as buffer:

        shutil.copyfileobj(
            file.file,
            buffer
        )


    result = await movie_service.recognize(
        video_path
    )


    return result