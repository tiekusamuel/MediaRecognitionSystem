import api from './api';

// Interfaces matching backend DTOs
export interface MovieRecognitionRequest {
  file: File;
  startTimeSeconds?: number;
  endTimeSeconds?: number;
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
    videoFile: File, 
    startTimeSeconds?: number,
    endTimeSeconds?: number,
    onUploadProgress?: (progressEvent: any) => void
  ): Promise<MovieRecognitionResponse> => {
    const formData = new FormData();
    formData.append('File', videoFile);  // Changed from 'video' to 'File'
    
    if (startTimeSeconds !== undefined) {
      formData.append('StartTimeSeconds', startTimeSeconds.toString());
    }
    if (endTimeSeconds !== undefined) {
      formData.append('EndTimeSeconds', endTimeSeconds.toString());
    }

    const response = await api.post<ApiResponse<MovieRecognitionResponse>>(
      '/api/MovieRecognition/recognize/video',  // Corrected endpoint
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
      '/api/MovieRecognition/recognize/image',
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
      `/api/MovieRecognition/result/${recognitionId}`
    );
    return response.data.data;
  },

  /**
   * Get recognition history
   */
  getRecognitionHistory: async (pageNumber: number = 1, pageSize: number = 10) => {
    const response = await api.get<ApiResponse<any>>(
      `/api/MovieRecognition/history?pageNumber=${pageNumber}&pageSize=${pageSize}`
    );
    return response.data.data;
  },
};

export default movieService;