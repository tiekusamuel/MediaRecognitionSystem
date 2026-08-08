import os
import uuid
import aiofiles

from fastapi import UploadFile

from app.config.settings import settings


class AudioProcessor:

    ALLOWED_EXTENSIONS = {
        ".mp3",
        ".wav",
        ".ogg",
        ".m4a",
        ".flac",
        ".webm"
    }

    def __init__(self):

        os.makedirs(settings.TEMP_FOLDER, exist_ok=True)

    async def save_temp_file(self, file: UploadFile) -> str:

        extension = os.path.splitext(file.filename)[1].lower()

        if extension not in self.ALLOWED_EXTENSIONS:
            raise ValueError("Unsupported audio format.")

        filename = f"{uuid.uuid4()}{extension}"

        file_path = os.path.join(
            settings.TEMP_FOLDER,
            filename
        )

        async with aiofiles.open(file_path, "wb") as out:

            while True:

                chunk = await file.read(1024 * 1024)

                if not chunk:
                    break

                await out.write(chunk)

        return file_path

    def delete_temp_file(self, file_path: str):

        if os.path.exists(file_path):

            os.remove(file_path)