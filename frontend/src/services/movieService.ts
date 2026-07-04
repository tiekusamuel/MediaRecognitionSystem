import api from './api';

// Interfaces
export interface MovieRecognitionRequest {
  videoFile: File;
}

export interface MovieRecognitionResponse {
  id: string;
  title: string;
  poster: string;
  genre: string[];
  year: number;
  director: string;
  cast: string[];
  synopsis: string;
  confidence: number;
  trailerUrl?: string;
  recognitionDate: string;
}

// Movie service functions
const movieService = {
  /**
   * Recognize movie from video file
   */
  recognizeMovie: async (videoFile: File, onUploadProgress?: (progressEvent: any) => void): Promise<MovieRecognitionResponse> => {
    const formData = new FormData();
    formData.append('video', videoFile);

    const response = await api.post<MovieRecognitionResponse>('/movie/recognize', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });

    return response.data;
  },

  /**
   * Get movie details by ID
   */
  getMovieDetails: async (movieId: string): Promise<MovieRecognitionResponse> => {
    const response = await api.get<MovieRecognitionResponse>(`/movie/${movieId}`);
    return response.data;
  },
};

export default movieService;
