from app.models.response_models import (
    MovieRecognitionResponse,
    MovieResponse
)


class MovieMapper:

    @staticmethod
    def to_response(
        prediction: dict,
        result: dict
    ) -> MovieRecognitionResponse:

        metadata = result
        
        if not metadata:

            return MovieRecognitionResponse(

                IsSuccessful=False,

                confidenceScore=0.0,

                message="No movie match found.",

                movie=None
            )


        return MovieRecognitionResponse(

            IsSuccessful=True,

            confidenceScore= prediction.get("confidence", 0),
        
            message= "Movie recognized successfully.",

            movie=MovieResponse(
                title=metadata.get("title", ""),

                poster=(
                    f"https://image.tmdb.org/t/p/w500{metadata['poster_path']}"
                    if metadata.get("poster_path")
                    else ""
                ),

                genre=[
                    genre["name"]
                    for genre in metadata.get("genres", [])
                ],

                releaseyear=(
                    int(metadata["release_date"][:4])
                    if metadata.get("release_date")
                    else 0
                ),

                director=next(
                    (
                        person["name"]
                        for person in metadata.get("credits", {}).get("crew", [])
                        if person.get("job") == "Director"
                    ),
                    ""
                ),

                cast=[
                    actor["name"]
                    for actor in metadata.get("credits", {}).get("cast", [])[:5]
                ],

                duration=str(metadata.get("runtime", "")),
                synopsis=metadata.get("overview", ""),

                trailerUrl=next(
                    (
                        f"https://www.youtube.com/watch?v={video['key']}"
                        for video in metadata.get("videos", {}).get("results", [])
                        if video.get("site") == "YouTube"
                        and video.get("type") == "Trailer"
                    ),
                    ""
                ),

                imdbId=metadata.get("imdb_id", ""),

                rating=metadata.get("vote_average", 0)
            )
        )
        