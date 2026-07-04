import api from './api';

// Interfaces
export interface MusicRecognitionRequest {
  audioFile: File;
}

export interface MusicRecognitionResponse {
  id: string;
  title: string;
  artist: string;
  album: string;
  albumArt: string;
  genre: string;
  releaseYear: number;
  duration: number;
  confidence: number;
  streamingLinks?: {
    spotify?: string;
    appleMusic?: string;
    youtube?: string;
  };
  recognitionDate: string;
}

// Music service functions
const musicService = {
  /**
   * Recognize music from audio file
   */
  recognizeMusic: async (audioFile: File, onUploadProgress?: (progressEvent: any) => void): Promise<MusicRecognitionResponse> => {
    const formData = new FormData();
    formData.append('audio', audioFile);

    const response = await api.post<MusicRecognitionResponse>('/music/recognize', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });

    return response.data;
  },

  /**
   * Get music details by ID
   */
  getMusicDetails: async (musicId: string): Promise<MusicRecognitionResponse> => {
    const response = await api.get<MusicRecognitionResponse>(`/music/${musicId}`);
    return response.data;
  },
};

export default musicService;