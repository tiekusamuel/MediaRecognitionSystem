import api from './api';

// Interfaces matching backend DTOs
export interface MovieRecognitionRequest {
  file: File;
  startTimeSeconds?: number;
  endTimeSeconds?: number;
}

export interface MovieRecognitionResponse {
    recognitionId: string;
    isSuccessful: boolean;
    confidenceScore: number;
    movie?: Movie;
    recognizedAt: string;
    message: string;
}

export interface Movie{
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
  ImdbId : string;
  rating: number;
}


// Backend API Response wrapper
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errors: string[];
}

// Movie service functions
const movieService = {
  /**
   * Recognize movie from video file
   */
  recognizeMovie: async (
    request: MovieRecognitionRequest,
    onUploadProgress?: (progressEvent: any) => void
  ): Promise<MovieRecognitionResponse> => {
    const formData = new FormData();
    formData.append('File', request.file);

    if (request.startTimeSeconds !== undefined) {
      formData.append('StartTimeSeconds', request.startTimeSeconds.toString());
    }
    if (request.endTimeSeconds !== undefined) {
      formData.append('EndTimeSeconds', request.endTimeSeconds.toString());
    }

    const response = await api.post<ApiResponse<MovieRecognitionResponse>>(
      '/MovieRecognition/recognize/video',  // Corrected endpoint
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress,
      }
    );

    return response.data.data;  // Extract data from ApiResponse wrapper
    
  },


  /**
   * Recognize movie from image file
   */
  recognizeMovieFromImage: async (
    imageFile: File,
    onUploadProgress?: (progressEvent: any) => void
  ): Promise<MovieRecognitionResponse> => {
    const formData = new FormData();
    formData.append('File', imageFile);

    const response = await api.post<ApiResponse<MovieRecognitionResponse>>(
      '/MovieRecognition/recognize/image',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress,
      }
    );

    return response.data.data;
  },

  /**
   * Get recognition result by ID
   */
  getRecognitionResult: async (recognitionId: string): Promise<MovieRecognitionResponse> => {
    const response = await api.get<ApiResponse<MovieRecognitionResponse>>(
      `MovieRecognition/result/${recognitionId}`
    );
    return response.data.data;
  },

  /**
   * Get recognition history
   */
  getRecognitionHistory: async (pageNumber: number = 1, pageSize: number = 10) => {
    const response = await api.get<ApiResponse<any>>(
      `MovieRecognition/history?pageNumber=${pageNumber}&pageSize=${pageSize}`
    );
    return response.data.data;
  },
};

export default movieService;