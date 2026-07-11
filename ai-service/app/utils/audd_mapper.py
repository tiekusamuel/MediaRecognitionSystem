from app.models.response_models import (
    MusicRecognitionResponse,
    TrackResponse
)


class AudDMapper:

    @staticmethod
    def to_response(audd_result: dict) -> MusicRecognitionResponse:

        result = audd_result.get("result")

        if not result:
            return MusicRecognitionResponse(
                success=False,
                confidence=0.0,
                message="No music match found.",
                track=None
            )

        apple = result.get("apple_music", {})

        artwork = apple.get("artwork", {})

        previews = apple.get("previews", [])

        genre_names = apple.get("genreNames", [])

        release_year = 0

        release_date = result.get("release_date")

        if release_date:
            try:
                release_year = int(release_date[:4])
            except ValueError:
                pass

        album_art = artwork.get("url", "")

        if album_art:
            album_art = album_art.replace("{w}", "1000").replace("{h}", "1000")

        preview_url = ""

        if previews:
            preview_url = previews[0].get("url", "")

        return MusicRecognitionResponse(

            IsSuccessful=True,

            confidenceScore=1.0,

            message="Music recognized successfully.",

            track=TrackResponse(

                
                title=result.get("title", ""),

                artist=result.get("artist", ""),

                album=result.get("album", ""),

                genre=genre_names[0] if genre_names else "",

                releaseyear=release_year,

                duration=result.get("timecode", ""),

                isrc=apple.get("isrc", ""),

                albumarturl=album_art,

                previewurl=preview_url
            )
        )