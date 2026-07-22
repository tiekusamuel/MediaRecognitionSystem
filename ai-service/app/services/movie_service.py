import logging
import traceback


from app.services.ffmpeg_service import FFmpegService
from app.services.frame_selector import FrameSelector
from app.services.gemini_service import GeminiService

from app.services.tmdb_service import TMDBService 

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

        self.selector = FrameSelector(

            max_frames=8,

            blur_threshold=10.0

        )



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
            
           
            logger.info(f"Extracted {len(frame_paths)} frames")

           

            if not frame_paths:

                raise MovieRecognitionError("No frames extracted from video.")

       

            logger.info("Selecting best frames...")
         

            selected_frames = self.selector.select( frame_paths)


            logger.info(f"{len(selected_frames)} frames selected")


            logger.info("Sending frames to Gemini...")

            """
           
            prediction = self.gemini.identify_movie(selected_frames)
            
           
            
            
            logger.info(prediction)
                
          
            if not prediction.get("title"):
                
                prediction.get["title"]= "Interstellar"
                
                


                #raise MovieRecognitionError("Movie could not be identified.")


            logger.info( "Getting movie metadata...")
            
            """
            prediction={"title": "Avatar","confidence": 70}
            
            metadata = self.tmbd.search_movie(prediction.get("title"))
            #metadata = self.tmbd.search_movie("Die Hard")
            
            #print(metadata)



            logger.info("Metadata received")


            response = MovieMapper.to_response(prediction,metadata)
            
            
            print(response)


            logger.info( "MOVIE RECOGNITION COMPLETED")

           

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

                logger.info("Cleaning temporary frames...")

                self.ffmpeg.cleanup(frame_paths)
                

            except Exception:

                logger.warning( "Frame cleanup failed.")
