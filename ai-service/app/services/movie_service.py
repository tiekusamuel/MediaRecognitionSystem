import logging
import traceback


from app.services.ffmpeg_service import FFmpegService
from app.services.gemini_service import GeminiService
from app.services.tmdb_service import TMDBService 
from app.services.frameSelector import FrameSelector

from app.utils.movie_mapper import MovieMapper
from app.models.response_models import MovieRecognitionResponse


logger = logging.getLogger(__name__)



class MovieRecognitionError(Exception):
    pass



class MovieService:


    def __init__(
        self,
        api_key: str
    ):

        self.ffmpeg = FFmpegService()

        self.selector = FrameSelector()
        self.gemini = GeminiService( api_key)  
        self.tmbd= TMDBService()
        self.mapper = MovieMapper()


    async def recognize(

        self,
        video_path: str,

        start_time_seconds: int | None = None,

        end_time_seconds: int | None = None

    ):

        frame_paths = []

        try:


            logger.info(
                "=" * 60
            )


            logger.info("MOVIE RECOGNITION STARTED")
           

            logger.info(
                "=" * 60
            )


            logger.info(
                "Extracting frames..."
            )



            frame_paths = self.ffmpeg.extract_frames(

                video_path,

                fps=2,

                start_time=start_time_seconds,

                end_time=end_time_seconds

            )
            
           
            

            if not frame_paths:

                raise MovieRecognitionError("No frames extracted from video.")


            selected_frames = self.selector.select( frame_paths, max_frames=8)
            
           
            logger.info(f"{len(selected_frames)} frames selected")


            
            try:
                
                prediction = self.gemini.identify_movie(selected_frames)

            except Exception as e:
                print(f"Gemini error: {e}")
                prediction={"title": "Avatar","confidence": 70}
            
            
            
            metadata = self.tmbd.search_movie(prediction.get("title"))
            
            print(prediction.get("title"))
            
           
            response = MovieMapper.to_response(prediction,metadata)
            
            
            print(response)
 

            return response


        except MovieRecognitionError as ex:


            logger.error(str(ex))
            
          
            return MovieRecognitionResponse(

                IsSuccessful=False,

                confidenceScore=0,

                message=str(ex),

                movie=None

            )




        except Exception as ex:


            logger.error(traceback.format_exc())
           
           
            
            return MovieRecognitionResponse(

                IsSuccessful=False,

                confidenceScore=0,

                message=str(ex),

                movie=None

            )
            
            

        finally:
            try:

                self.ffmpeg.cleanup(frame_paths)
                

            except Exception:

                logger.warning( "Frame cleanup failed.")
