from fastapi import UploadFile
from app.services.audd_service import AudDService

from app.models.response_models import (
    MusicRecognitionResponse,
    TrackResponse
)

from app.services.audio_processor import AudioProcessor
from app.utils.audd_mapper import AudDMapper

class MusicService:

    def __init__(self):

        self.audio_processor = AudioProcessor()
        self.audd_service = AudDService()

    async def recognize(
        self,
        audio: UploadFile
    ):

        temp_file = await self.audio_processor.save_temp_file(audio)

        try:
            
            result = await self.audd_service.recognize(temp_file)
            
            print(result)

            return AudDMapper.to_response(result)


        finally:

            self.audio_processor.delete_temp_file(temp_file)