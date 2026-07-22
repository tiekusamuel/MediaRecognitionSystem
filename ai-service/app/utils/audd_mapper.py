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

                isrc = apple.get("isrc", ""),

                albumArturl=album_art,

                previewUrl=result.get("spotify",{}).get("preview_url",""),
                
                spotifyUrl = result.get("spotify",{}).get("external_urls",{}).get("spotify"),
                
                appleMusicUrl= result.get("apple_music",{}).get("url",""),
                
                songLink = result.get("song_link", " "),
                
                thumbnail = result.get("spotify",{}).get("album",{}).get("images",[{}])[0].get("url")
                
                
                
            )
        )