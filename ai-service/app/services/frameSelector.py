"""
frame_selector.py

Production-ready module for selecting representative frames from a movie
for AI vision models to identify the movie title.

Author: Senior Computer Vision Engineer
Python: 3.12+
"""

import cv2
import numpy as np
from pathlib import Path
from typing import List, Optional, Tuple
from dataclasses import dataclass, field
from PIL import Image
import imagehash
import shutil


@dataclass
class FrameInfo:
    """Store comprehensive analysis data for a single frame."""
    
    path: str
    index: int
    sharpness: float = 0.0
    brightness: float = 0.0
    contrast: float = 0.0
    edge_density: float = 0.0
    color_variance: float = 0.0
    entropy: float = 0.0
    perceptual_hash: Optional[imagehash.ImageHash] = None
    scene_id: int = -1
    is_duplicate: bool = False
    quality_score: float = 0.0
    
    def __repr__(self) -> str:
        return (
            f"FrameInfo(index={self.index}, sharpness={self.sharpness:.2f}, "
            f"brightness={self.brightness:.2f}, contrast={self.contrast:.2f}, "
            f"edge_density={self.edge_density:.2f}, entropy={self.entropy:.2f}, "
            f"scene_id={self.scene_id}, score={self.quality_score:.2f})"
        )


@dataclass
class QualityThresholds:
    """Configurable thresholds for frame quality filtering."""
    
    min_sharpness: float = 80.0
    min_brightness: float = 30.0
    max_brightness: float = 230.0
    min_contrast: float = 20.0
    min_edge_density: float = 0.015
    min_entropy: float = 4.0
    
    # Perceptual hash distance for duplicate detection
    max_hash_distance: int = 6
    
    # Scene detection threshold (histogram correlation)
    scene_change_threshold: float = 0.75


@dataclass
class QualityWeights:
    """Configurable weights for composite quality scoring."""
    
    sharpness: float = 0.30
    contrast: float = 0.25
    edge_density: float = 0.20
    color_variance: float = 0.15
    entropy: float = 0.10
    
    def __post_init__(self):
        """Validate that weights sum to approximately 1.0."""
        total = (self.sharpness + self.contrast + self.edge_density + 
                 self.color_variance + self.entropy)
        if not (0.99 <= total <= 1.01):
            raise ValueError(f"Weights must sum to 1.0, got {total}")


class FrameSelector:
    """
    Intelligent frame selector for movie identification using AI vision models.
    
    Analyzes frames based on multiple quality metrics, removes duplicates,
    detects scene changes, and selects the most representative frames.
    """
    
    def __init__(
        self,
        thresholds: Optional[QualityThresholds] = None,
        weights: Optional[QualityWeights] = None,
        debug: bool = False
    ):
        """
        Initialize the FrameSelector.
        
        Args:
            thresholds: Quality thresholds for filtering frames
            weights: Weights for composite quality score calculation
            debug: Enable debug output
        """
        self.thresholds = thresholds or QualityThresholds()
        self.weights = weights or QualityWeights()
        self.debug = debug
        
    def select(
        self,
        frame_paths: List[str],
        max_frames: int = 10
    ) -> List[str]:
        """
        Select the best representative frames from a list of frame paths.
        
        Args:
            frame_paths: List of paths to extracted frame images
            max_frames: Maximum number of frames to return
            
        Returns:
            List of paths to selected frames, ordered by quality
        """
        if not frame_paths:
            return []
        
        if self.debug:
            print(f"\n{'='*80}")
            print(f"Starting frame selection from {len(frame_paths)} frames")
            print(f"Target: {max_frames} frames")
            print(f"{'='*80}\n")
        
        # Stage 1: Analyze all frames
        frame_infos = self._analyze_frames(frame_paths)
        
        if not frame_infos:
            return []
        
        # Stage 2: Filter out unusable frames
        usable_frames = self._filter_unusable_frames(frame_infos)
        
        if not usable_frames:
            if self.debug:
                print("WARNING: No frames passed quality filters!")
            return []
        
        # Stage 3: Remove duplicates
        unique_frames = self._remove_duplicates(usable_frames)
        
        if not unique_frames:
            return []
        
        # Stage 4: Detect scenes
        scenes = self._detect_scenes(unique_frames)
        
        # Stage 5: Select best frame from each scene
        scene_representatives = self._select_scene_representatives(scenes)
        
        # Stage 6: Rank and limit scenes
        selected_frames = self._rank_and_limit_scenes(
            scene_representatives,
            max_frames
        )
        
        # Stage 7: Quality scoring (already done in stage 1)
        # Scores are used throughout the pipeline
        
        if self.debug:
            print(f"\n{'='*80}")
            print(f"Selected {len(selected_frames)} final frames")
            print(f"{'='*80}\n")
        
        return [frame.path for frame in selected_frames]
    
    def _analyze_frames(self, frame_paths: List[str]) -> List[FrameInfo]:
        """
        Stage 1: Analyze every frame and compute all metrics.
        
        Args:
            frame_paths: List of frame image paths
            
        Returns:
            List of FrameInfo objects with computed metrics
        """
        frame_infos = []
        
        for idx, path in enumerate(frame_paths):
            try:
                frame_info = self._analyze_single_frame(path, idx)
                frame_infos.append(frame_info)
                
                if self.debug:
                    print(f"Frame {idx:04d}: {frame_info}")
                    
            except Exception as e:
                if self.debug:
                    print(f"Error analyzing frame {idx} ({path}): {e}")
                continue
        
        return frame_infos
    
    def _analyze_single_frame(self, path: str, index: int) -> FrameInfo:
        """
        Analyze a single frame and compute all quality metrics.
        
        Args:
            path: Path to the frame image
            index: Frame index in the sequence
            
        Returns:
            FrameInfo object with all metrics computed
        """
        # Load image with OpenCV
        img = cv2.imread(path)
        if img is None:
            raise ValueError(f"Could not load image: {path}")
        
        # Convert to grayscale for some metrics
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Compute metrics
        sharpness = self._compute_sharpness(gray)
        brightness = self._compute_brightness(gray)
        contrast = self._compute_contrast(gray)
        edge_density = self._compute_edge_density(gray)
        color_variance = self._compute_color_variance(img)
        entropy = self._compute_entropy(gray)
        perceptual_hash = self._compute_perceptual_hash(path)
        
        # Create FrameInfo
        frame_info = FrameInfo(
            path=path,
            index=index,
            sharpness=sharpness,
            brightness=brightness,
            contrast=contrast,
            edge_density=edge_density,
            color_variance=color_variance,
            entropy=entropy,
            perceptual_hash=perceptual_hash
        )
        
        # Stage 7: Compute composite quality score
        frame_info.quality_score = self._compute_quality_score(frame_info)
        
        return frame_info
    
    def _compute_sharpness(self, gray: np.ndarray) -> float:
        """
        Compute Laplacian variance as sharpness metric.
        
        Args:
            gray: Grayscale image
            
        Returns:
            Sharpness score (higher is sharper)
        """
        laplacian = cv2.Laplacian(gray, cv2.CV_64F)
        return float(laplacian.var())
    
    def _compute_brightness(self, gray: np.ndarray) -> float:
        """
        Compute average brightness.
        
        Args:
            gray: Grayscale image
            
        Returns:
            Brightness value [0-255]
        """
        return float(gray.mean())
    
    def _compute_contrast(self, gray: np.ndarray) -> float:
        """
        Compute contrast as standard deviation of pixel intensities.
        
        Args:
            gray: Grayscale image
            
        Returns:
            Contrast score
        """
        return float(gray.std())
    
    def _compute_edge_density(self, gray: np.ndarray) -> float:
        """
        Compute edge density using Canny edge detection.
        
        Args:
            gray: Grayscale image
            
        Returns:
            Ratio of edge pixels to total pixels
        """
        edges = cv2.Canny(gray, 50, 150)
        edge_pixels = np.count_nonzero(edges)
        total_pixels = edges.size
        return float(edge_pixels / total_pixels)
    
    def _compute_color_variance(self, img: np.ndarray) -> float:
        """
        Compute color variance across all channels.
        
        Args:
            img: Color image (BGR)
            
        Returns:
            Average variance across color channels
        """
        variances = [img[:, :, i].var() for i in range(3)]
        return float(np.mean(variances))
    
    def _compute_entropy(self, gray: np.ndarray) -> float:
        """
        Compute Shannon entropy of the image.
        
        Args:
            gray: Grayscale image
            
        Returns:
            Entropy value
        """
        # Compute histogram
        hist, _ = np.histogram(gray.ravel(), bins=256, range=(0, 256))
        
        # Normalize to get probability distribution
        hist = hist.astype(float) / hist.sum()
        
        # Remove zero entries
        hist = hist[hist > 0]
        
        # Compute entropy
        entropy = -np.sum(hist * np.log2(hist))
        return float(entropy)
    
    def _compute_perceptual_hash(self, path: str) -> imagehash.ImageHash:
        """
        Compute perceptual hash for duplicate detection.
        
        Args:
            path: Path to image file
            
        Returns:
            Perceptual hash
        """
        img = Image.open(path)
        return imagehash.phash(img)
    
    def _compute_quality_score(self, frame_info: FrameInfo) -> float:
        """
        Stage 7: Compute composite quality score using weighted metrics.
        
        Args:
            frame_info: FrameInfo with computed metrics
            
        Returns:
            Normalized quality score [0-100]
        """
        # Normalize each metric to 0-1 range
        # These normalization constants are empirically determined
        norm_sharpness = min(frame_info.sharpness / 500.0, 1.0)
        norm_contrast = min(frame_info.contrast / 80.0, 1.0)
        norm_edge_density = min(frame_info.edge_density / 0.15, 1.0)
        norm_color_variance = min(frame_info.color_variance / 2000.0, 1.0)
        norm_entropy = min(frame_info.entropy / 8.0, 1.0)
        
        # Compute weighted sum
        score = (
            self.weights.sharpness * norm_sharpness +
            self.weights.contrast * norm_contrast +
            self.weights.edge_density * norm_edge_density +
            self.weights.color_variance * norm_color_variance +
            self.weights.entropy * norm_entropy
        )
        
        # Scale to 0-100
        return score * 100.0
    
    def _filter_unusable_frames(
        self,
        frame_infos: List[FrameInfo]
    ) -> List[FrameInfo]:
        """
        Stage 2: Filter out frames that don't meet quality thresholds.
        
        Args:
            frame_infos: List of analyzed frames
            
        Returns:
            List of frames that pass quality filters
        """
        usable = []
        
        for frame in frame_infos:
            # Check all threshold conditions
            if (frame.sharpness < self.thresholds.min_sharpness):
                if self.debug:
                    print(f"  Frame {frame.index:04d} REJECTED: too blurry "
                          f"({frame.sharpness:.2f} < {self.thresholds.min_sharpness})")
                continue
            
            if (frame.brightness < self.thresholds.min_brightness):
                if self.debug:
                    print(f"  Frame {frame.index:04d} REJECTED: too dark "
                          f"({frame.brightness:.2f} < {self.thresholds.min_brightness})")
                continue
            
            if (frame.brightness > self.thresholds.max_brightness):
                if self.debug:
                    print(f"  Frame {frame.index:04d} REJECTED: too bright "
                          f"({frame.brightness:.2f} > {self.thresholds.max_brightness})")
                continue
            
            if (frame.contrast < self.thresholds.min_contrast):
                if self.debug:
                    print(f"  Frame {frame.index:04d} REJECTED: low contrast "
                          f"({frame.contrast:.2f} < {self.thresholds.min_contrast})")
                continue
            
            if (frame.edge_density < self.thresholds.min_edge_density):
                if self.debug:
                    print(f"  Frame {frame.index:04d} REJECTED: few edges "
                          f"({frame.edge_density:.4f} < {self.thresholds.min_edge_density})")
                continue
            
            if (frame.entropy < self.thresholds.min_entropy):
                if self.debug:
                    print(f"  Frame {frame.index:04d} REJECTED: low entropy "
                          f"({frame.entropy:.2f} < {self.thresholds.min_entropy})")
                continue
            
            usable.append(frame)
        
        if self.debug:
            print(f"\nQuality filter: {len(usable)}/{len(frame_infos)} frames passed\n")
        
        return usable
    
    def _remove_duplicates(
        self,
        frame_infos: List[FrameInfo]
    ) -> List[FrameInfo]:
        """
        Stage 3: Remove duplicate frames using perceptual hashing.
        
        Args:
            frame_infos: List of frames to deduplicate
            
        Returns:
            List of unique frames (highest quality kept from duplicates)
        """
        if not frame_infos:
            return []
        
        unique_frames = []
        
        for frame in frame_infos:
            is_duplicate = False
            
            # Compare with all unique frames so far
            for unique in unique_frames:
                hash_distance = frame.perceptual_hash - unique.perceptual_hash
                
                if hash_distance <= self.thresholds.max_hash_distance:
                    # Found a duplicate
                    is_duplicate = True
                    
                    # Keep the higher quality frame
                    if frame.quality_score > unique.quality_score:
                        # Replace the unique frame with this better one
                        unique_frames.remove(unique)
                        unique_frames.append(frame)
                        
                        if self.debug:
                            print(f"  Frame {frame.index:04d} replaces "
                                  f"Frame {unique.index:04d} (duplicate, higher quality)")
                    else:
                        if self.debug:
                            print(f"  Frame {frame.index:04d} DUPLICATE of "
                                  f"Frame {unique.index:04d} (lower quality, discarded)")
                    
                    frame.is_duplicate = True
                    break
            
            if not is_duplicate:
                unique_frames.append(frame)
        
        if self.debug:
            print(f"\nDuplicate removal: {len(unique_frames)}/{len(frame_infos)} "
                  f"unique frames\n")
        
        return unique_frames
    
    def _detect_scenes(
        self,
        frame_infos: List[FrameInfo]
    ) -> List[List[FrameInfo]]:
        """
        Stage 4: Detect scene changes using histogram correlation.
        
        Args:
            frame_infos: List of unique frames
            
        Returns:
            List of scenes, where each scene is a list of FrameInfo objects
        """
        if not frame_infos:
            return []
        
        scenes: List[List[FrameInfo]] = [[frame_infos[0]]]
        frame_infos[0].scene_id = 0
        current_scene_id = 0
        
        prev_hist = self._compute_hsv_histogram(frame_infos[0].path)
        
        for frame in frame_infos[1:]:
            curr_hist = self._compute_hsv_histogram(frame.path)
            
            # Compute correlation
            correlation = cv2.compareHist(
                prev_hist,
                curr_hist,
                cv2.HISTCMP_CORREL
            )
            
            # Check if scene changed
            if correlation < self.thresholds.scene_change_threshold:
                # Start new scene
                current_scene_id += 1
                scenes.append([])
                
                if self.debug:
                    print(f"  Scene change detected at frame {frame.index:04d} "
                          f"(correlation: {correlation:.3f})")
            
            frame.scene_id = current_scene_id
            scenes[current_scene_id].append(frame)
            prev_hist = curr_hist
        
        if self.debug:
            print(f"\nScene detection: {len(scenes)} scenes found")
            for i, scene in enumerate(scenes):
                print(f"  Scene {i}: {len(scene)} frames")
            print()
        
        return scenes
    
    def _compute_hsv_histogram(self, path: str) -> np.ndarray:
        """
        Compute normalized HSV histogram for scene detection.
        
        Args:
            path: Path to image file
            
        Returns:
            Normalized histogram
        """
        img = cv2.imread(path)
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        
        # Compute 3D histogram
        hist = cv2.calcHist(
            [hsv],
            [0, 1, 2],
            None,
            [8, 8, 8],
            [0, 180, 0, 256, 0, 256]
        )
        
        # Normalize
        hist = cv2.normalize(hist, hist).flatten()
        
        return hist
    
    def _select_scene_representatives(
        self,
        scenes: List[List[FrameInfo]]
    ) -> List[FrameInfo]:
        """
        Stage 5: Select the best representative frame from each scene.
        
        Args:
            scenes: List of scenes
            
        Returns:
            List of representative frames (one per scene)
        """
        representatives = []
        
        for scene_id, scene in enumerate(scenes):
            if not scene:
                continue
            
            # Select frame with highest quality score
            best_frame = max(scene, key=lambda f: f.quality_score)
            representatives.append(best_frame)
            
            if self.debug:
                print(f"  Scene {scene_id}: selected frame {best_frame.index:04d} "
                      f"(score: {best_frame.quality_score:.2f})")
        
        if self.debug:
            print(f"\nScene representatives: {len(representatives)} frames\n")
        
        return representatives
    
    def _rank_and_limit_scenes(
        self,
        representatives: List[FrameInfo],
        max_frames: int
    ) -> List[FrameInfo]:
        """
        Stage 6: Rank scenes and limit to max_frames.
        
        Args:
            representatives: List of scene representative frames
            max_frames: Maximum number of frames to return
            
        Returns:
            Top max_frames frames, sorted by quality
        """
        # Sort by quality score (descending)
        sorted_frames = sorted(
            representatives,
            key=lambda f: f.quality_score,
            reverse=True
        )
        
        # Limit to max_frames
        selected = sorted_frames[:max_frames]
        
        # Re-sort by frame index for temporal ordering
        selected = sorted(selected, key=lambda f: f.index)
        
        if self.debug:
            print(f"Final selection ({len(selected)} frames):")
            for frame in selected:
                print(f"  Frame {frame.index:04d}: scene {frame.scene_id}, "
                      f"score {frame.quality_score:.2f}")
            print()
        
        return selected
    
    def save_selected_frames(
        self,
        selected_paths: List[str],
        output_dir: str = "temp/selected_frames"
    ) -> List[str]:
        """
        Stage 9: Copy selected frames to an output directory.
        
        Args:
            selected_paths: List of paths to selected frames
            output_dir: Directory to save selected frames
            
        Returns:
            List of paths to saved frames
        """
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)
        
        saved_paths = []
        
        for i, src_path in enumerate(selected_paths):
            src = Path(src_path)
            
            # Create destination filename
            dst_filename = f"selected_{i:03d}{src.suffix}"
            dst_path = output_path / dst_filename
            
            # Copy file
            shutil.copy2(src, dst_path)
            saved_paths.append(str(dst_path))
            
            if self.debug:
                print(f"Saved: {dst_path}")
        
        if self.debug:
            print(f"\nSaved {len(saved_paths)} frames to {output_dir}\n")
        
        return saved_paths


# Example usage
if __name__ == "__main__":
    # Example with custom configuration
    thresholds = QualityThresholds(
        min_sharpness=50.0,
        min_brightness=30.0,
        max_brightness=225.0,
        min_contrast=20.0,
        min_edge_density=0.01,
        min_entropy=3.0,
        max_hash_distance=5,
        scene_change_threshold=0.85
    )
    
    weights = QualityWeights(
        sharpness=0.30,
        contrast=0.25,
        edge_density=0.20,
        color_variance=0.15,
        entropy=0.10
    )
    
    selector = FrameSelector(
        thresholds=thresholds,
        weights=weights,
        debug=True
    )
    
    # Assume you have a list of extracted frame paths
    frame_paths = [
        # "path/to/frame_0001.jpg",
        # "path/to/frame_0002.jpg",
        # ...
    ]
    
    # Select best frames
    selected = selector.select(frame_paths, max_frames=10)
    
    # Optionally save to directory
    if selected:
        saved = selector.save_selected_frames(selected)
        print(f"Selected {len(saved)} representative frames")