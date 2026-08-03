import api from './api';

// Interfaces matching backend DTOs
export interface MusicRecognitionRequest {
  audioFile: File;
  durationSeconds?: number;
}

export interface MicrophoneRecognitionRequest {
  audioData: string;  // Base64 encoded audio
  audioFormat: string;  // MIME type (e.g., 'audio/webm')
  durationSeconds?: number;
}

export interface MusicRecognitionResponse{
  recognitionId: string;
  isSuccessful: boolean;
  confidenceScore: number;
  recognizedAt: string;
  message: string;
  track: MusicTrack;
}
export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  albumArtUrl: string;
  genre: string;
  releaseYear: number;
  duration: number;
  isrc: string;
  previewUrl: string;
  spotifyUrl: string;
  appleMusicUrl: string;
  songLink: string;
  thumbnail: string;

  
}

export interface RecognitionHistoryItem {
  id: string;
  title: string;
  artist: string;
  recognitionDate: string;
  confidence: number;
}

export interface RecognitionHistoryResponse {
  items: RecognitionHistoryItem[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
}

// Backend API Response wrapper
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errors: string[];
  timestamp: string;
}

// Music service functions
const musicService = {
  /**
   * Recognize music from audio file
   */
  recognizeMusic: async (
    audioFile: File,
    durationSeconds?: number,
    onUploadProgress?: (progressEvent: any) => void
  ): Promise<MusicRecognitionResponse> => {
    const formData = new FormData();
    formData.append('AudioFile', audioFile);  // Changed from 'audio' to 'AudioFile'
    
    if (durationSeconds !== undefined) {
      formData.append('DurationSeconds', durationSeconds.toString());
    }

    const response = await api.post<ApiResponse<MusicRecognitionResponse>>(
      'MusicRecognition/recognize/file',  // Corrected endpoint
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
   * Recognize music from microphone recording (Base64 audio data)
   */
  recognizeMusicFromMicrophone: async (
    audioData: string,
    audioFormat: string,
    durationSeconds?: number
  ): Promise<MusicRecognitionResponse> => {
    const requestBody: MicrophoneRecognitionRequest = {
      audioData,
      audioFormat,
      durationSeconds,
    };

    const response = await api.post<ApiResponse<MusicRecognitionResponse>>(
      'MusicRecognition/recognize/microphone',
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    console.log("response:", response);

    return response.data.data;
  },

  /**
   * Recognize music from microphone Blob
   * Helper method that converts Blob to Base64 and calls the microphone endpoint
   */
  recognizeMusicFromMicrophoneBlob: async (
    audioBlob: Blob,
    durationSeconds?: number
  ): Promise<MusicRecognitionResponse> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        try {
          const base64data = reader.result as string;
          const result = await musicService.recognizeMusicFromMicrophone(
            base64data,
            audioBlob.type || 'audio/webm',
            durationSeconds
          );
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read audio blob'));
      };
      
      reader.readAsDataURL(audioBlob);
    });
  },

  /**
   * Get recognition result by ID
   */
  getRecognitionResult: async (recognitionId: string): Promise<MusicRecognitionResponse> => {
    const response = await api.get<ApiResponse<MusicRecognitionResponse>>(
      `MusicRecognition/result/${recognitionId}`
    );
    return response.data.data;
  },

  /**
   * Get recognition history with pagination
   */
  getRecognitionHistory: async (
    pageNumber: number = 1,
    pageSize: number = 10
  ): Promise<RecognitionHistoryResponse> => {
    const response = await api.get<ApiResponse<RecognitionHistoryResponse>>(
      `MusicRecognition/history`,
      {
        params: {
          pageNumber,
          pageSize,
        },
      }
    );
    return response.data.data;
  },

  /**
   * Legacy method - kept for backward compatibility
   * @deprecated Use getRecognitionResult instead
   */
  getMusicDetails: async (musicId: string): Promise<MusicRecognitionResponse> => {
    return musicService.getRecognitionResult(musicId);
  },
};

export default musicService;