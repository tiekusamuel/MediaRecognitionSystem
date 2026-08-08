from pydantic import BaseModel, Field
from google import genai
from google.genai import types

from app.utils.json_utils import parse_json


# 1. Define the exact response structure using Pydantic
class MovieIdentification(BaseModel):
    title: str = Field(description="The movie title.")
    confidence: int = Field(description="Confidence score as an integer between 0 and 100.")


class GeminiService:

    def __init__(self, api_key: str):
        self.client = genai.Client(api_key=api_key)

    def identify_movie(self, frame_paths: list[str]) -> dict:
        contents = []

        # Read images as byte parts
        for frame in frame_paths:
            with open(frame, "rb") as image:
                contents.append(
                    types.Part.from_bytes(
                        data=image.read(),
                        mime_type="image/jpeg"
                    )
                )

        # Simplified prompt focusing only on the reasoning task
        prompt = """
        You are an expert movie identification AI. 
        The provided images are frames extracted sequentially or randomly from the SAME movie.
        Analyze all the images together to identify the film. 
        If you are unsure, provide your best guess with a lower confidence score.
        """
        contents.append(prompt)

        # 2. Enforce the JSON schema at the API level
        response = self.client.models.generate_content(
            model="gemini-3.5-flash", 
            contents=contents,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=MovieIdentification,
                temperature=0.1, # Keep temperature low for structured factual tasks
            ),
        )
        
        
        # The SDK guarantees response.text will be a valid JSON string fitting the schema
        return parse_json(response.text)