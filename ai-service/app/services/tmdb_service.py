import requests

from app.config.settings import settings


class TMDBService:

    BASE_URL = "https://api.themoviedb.org/3"

    def __init__(self):

        self.headers = {
            "Authorization": f"Bearer {settings.TMDB_API_KEY}",
            "accept": "application/json"
        }

    def search_movie(
        self,
        title: str
    ) -> dict | None:

        response = requests.get(
            f"{self.BASE_URL}/search/movie",
            params={
                "api_key": settings.TMDB_API_KEY,
                "query": title,
                "include_adult": False,
                "language": "en-US"
            }
        )
        
        response.raise_for_status()

        data = response.json()

        results = data.get("results", [])
        
        if not results:
            return None

        movie = results[0]

        return self.get_movie_details(
            movie["id"]
        )


    def get_movie_details(
        self,
        movie_id: int
    ) -> dict:

        response = requests.get(
            f"{self.BASE_URL}/movie/{movie_id}",
            params={
                "api_key": settings.TMDB_API_KEY,
                "append_to_response": "credits,videos"
            }
        )
        response.raise_for_status()
        
        movie = response.json()
        
        return movie