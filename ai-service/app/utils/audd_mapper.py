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
                IsSuccessful=False,
                confidenceScore=0.0,
                message="No music match found.",
                track=None
            )

        apple = result.get("apple_music", {})
        spotify = result.get("spotify", {})

        artwork = apple.get("artwork", {})
        genre_names = apple.get("genreNames", [])

        release_year = 0
        release_date = result.get("release_date")
        preview_url = None
        previews = apple.get("previews",[])

        if release_date:
            try:
                release_year = int(release_date[:4])
            except ValueError:
                pass

        # -------------------------
        # Album Art / Thumbnail
        # -------------------------
        if spotify:
            images = spotify.get("album", {}).get("images", [])
            if images:
                album_art = images[0].get("url", "")
            else:
                album_art = ""

            thumbnail = album_art

        elif artwork:
            album_art = artwork.get("url", "")
            if album_art:
                album_art = (
                    album_art
                    .replace("{w}", "1000")
                    .replace("{h}", "1000")
                )

            thumbnail = album_art

        else:
            album_art = ""
            thumbnail = ""

        # -------------------------
        # Preview URL
        # -------------------------
        if spotify and spotify.get("preview_url"):
            preview_url = spotify.get("preview_url")

        elif previews:
            preview_url = previews[0].get("url")

        else:
            preview_url = ""

        # -------------------------
        # Spotify URL
        # -------------------------
        if spotify:
            spotify_url = spotify.get("external_urls", {}).get("spotify", "")
        else:
            spotify_url = ""

        # -------------------------
        # Apple Music URL
        # -------------------------
        if apple:
            apple_music_url = apple.get("url", "")
        else:
            apple_music_url = ""

        return MusicRecognitionResponse(

            IsSuccessful=True,
            confidenceScore=90.0,
            message="Music recognized successfully.",

            track=TrackResponse(

                title=result.get("title", ""),
                artist=result.get("artist", ""),
                album=result.get("album", ""),
                genre=genre_names[0] if genre_names else "",
                releaseyear=release_year,
                duration=result.get("timecode", ""),
                isrc=apple.get("isrc", ""),

                previewUrl=preview_url,
                albumArturl=album_art,
                thumbnail=thumbnail,

                spotifyUrl=spotify_url,
                appleMusicUrl=apple_music_url,

                songLink=result.get("song_link", "")
            )
        )