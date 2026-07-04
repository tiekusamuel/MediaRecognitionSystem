import api from './api';

// Interfaces
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface User {
  id: string;
  username: string;
  email: string;
  joinDate: string;
  avatar?: string;
}

export interface ProfileResponse {
  user: User;
  statistics: {
    totalRecognitions: number;
    movieRecognitions: number;
    musicRecognitions: number;
    averageAccuracy: number;
  };
}

// Authentication service functions
const authService = {
  /**
   * Login user
   */
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  /**
   * Register new user
   */
  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', userData);
    return response.data;
  },

  /**
   * Logout user
   */
  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  /**
   * Get user profile
   */
  getProfile: async (): Promise<ProfileResponse> => {
    const response = await api.get<ProfileResponse>('/auth/profile');
    return response.data;
  },

  /**
   * Update user profile
   */
  updateProfile: async (userData: Partial<User>): Promise<User> => {
    const response = await api.put<User>('/auth/profile', userData);
    return response.data;
  },

  /**
   * Change password
   */
  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await api.post('/auth/change-password', { currentPassword, newPassword });
  },
};

export default authService;