import httpx

from app.config.settings import settings


class AudDService:

    BASE_URL = "https://api.audd.io/"

    async def recognize(self, file_path: str):

        with open(file_path, "rb") as audio_file:

            files = {
                "file": audio_file
            }

            data = {
                "api_token": settings.AUDD_API_KEY,
                "return": "apple_music,spotify"
            }

            async with httpx.AsyncClient(timeout=60) as client:

                response = await client.post(
                    self.BASE_URL,
                    data=data,
                    files=files
                )
        

        response.raise_for_status()

        return response.json()