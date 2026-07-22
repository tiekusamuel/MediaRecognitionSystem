
from pathlib import Path
from typing import List
import cv2
import numpy as np
import shutil


class FrameSelector:

    def __init__(
        self,
        max_frames: int = 2,
        blur_threshold: float = 60.0
    ):
        self.max_frames = max_frames
        self.blur_threshold = blur_threshold

    def _blur_score(self, image_path: str) -> float:
        """
        Higher score = sharper image.
        """

        image = cv2.imread(image_path)

        if image is None:
            return 0

        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        return cv2.Laplacian(gray, cv2.CV_64F).var()

    def select(self, frame_paths: List[str]) -> List[str]:

        if len(frame_paths) <= self.max_frames:
            return frame_paths

        scored = []

        for frame in frame_paths:

            score = self._blur_score(frame)

            if score >= self.blur_threshold:
                scored.append(
                    (
                        frame,
                        score
                    )
                )
        
        if not scored:
            return frame_paths[:self.max_frames]

        scored.sort(
            key=lambda x: x[1],
            reverse=True
        )
        

        selected = scored[: self.max_frames]
        
        selected_paths = [
            frame
            for frame, _ in selected
        ]
        
        #self.save_selected_frames(selected_paths)

        return [frame for frame, _ in selected]
    
    def save_selected_frames(
        self,
        selected_frames: list[str],
        output_folder: str = "temp/selected_frames"
    ) -> list[str]:

        output_path = Path(output_folder)

        output_path.mkdir(
            parents=True,
            exist_ok=True
        )

        saved_paths = []

        for index, frame in enumerate(selected_frames):

            destination = output_path / f"selected_{index}.jpg"

            shutil.copy(
                frame,
                destination
            )

            saved_paths.append(
                str(destination)
            )

        return saved_paths