from pathlib import Path
import subprocess
import uuid
import shutil
import os


class FFmpegService:

    def __init__(self):

        self.temp_folder = Path("temp")

        self.frames_folder = ( self.temp_folder / "frames")
            
        

        self.frames_folder.mkdir(parents=True, exist_ok=True)
            



    def extract_frames(
        self,
        video_path: str,
        fps: float = 0.2,
        start_time: int | None = None,
        end_time: int | None = None
    ) -> list[str]:


        extraction_id = str(uuid.uuid4())


        output_folder = ( self.frames_folder / extraction_id)
            
        output_folder.mkdir(
            parents=True,
            exist_ok=True
        )


        output_pattern = (  output_folder / "frame_%04d.jpg")
           
        
        command = ["ffmpeg","-hide_banner","-loglevel","error"]
            

        # Start position
        if start_time is not None:

            command.extend(
                [
                    "-ss",
                    str(start_time)
                ]
            )



        command.extend(
            [
                "-i",
                video_path
            ]
        )



        # End position
        if end_time is not None:

            if start_time is not None:

                duration = (
                    end_time - start_time
                )

                command.extend(
                    [
                        "-t",
                        str(duration)
                    ]
                )

            else:

                command.extend(
                    [
                        "-to",
                        str(end_time)
                    ]
                )



        command.extend(
            [
                "-vf",
                f"fps={fps}",

                "-q:v",
                "2",

                str(output_pattern)
            ]
        )



        subprocess.run(
            command,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=True
        )



        frames = sorted( output_folder.glob("*.jpg"))
            

        return [
            str(frame)
            for frame in frames
        ]




    def cleanup(
        self,
        frame_paths: list[str]
    ):


        if not frame_paths:
           return

        folder = Path(frame_paths[0]).parent

        if folder.exists():
            shutil.rmtree(folder)
       
       