from fastapi import APIRouter
from fastapi import UploadFile
from fastapi import File

from app.models.response_models import MusicRecognitionResponse
from app.services.music_service import MusicService

router = APIRouter(
    prefix="/music",
    tags=["Music"]
)

music_service = MusicService()


@router.post(
    "/recognize",
    response_model=MusicRecognitionResponse
)
async def recognize_music(
    audio: UploadFile = File(...)
):

    return await music_service.recognize(audio)