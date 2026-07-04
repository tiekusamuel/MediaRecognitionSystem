import React, { createContext, useState, useEffect} from 'react';
import type{ ReactNode } from 'react';
import authService from '../services/authService';
import type { LoginRequest, RegisterRequest, User, AuthResponse } from '../services/authService';

// Context interface
interface AuthContextType {
  currentUser: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

// Create context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider props
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Auth Context Provider
 * Manages authentication state and provides auth methods
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Restore authentication from localStorage on mount
  useEffect(() => {
    const initAuth = () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setCurrentUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error restoring auth state:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * Login user
   */
  const login = async (credentials: LoginRequest): Promise<void> => {
    try {
      const response: AuthResponse = await authService.login(credentials);
      
      // Store token and user
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setToken(response.token);
      setCurrentUser(response.user);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  /**
   * Register new user
   */
  const register = async (userData: RegisterRequest): Promise<void> => {
    try {
      const response: AuthResponse = await authService.register(userData);
      
      // Store token and user
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setToken(response.token);
      setCurrentUser(response.user);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  /**
   * Logout user
   */
  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear state
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setCurrentUser(null);
    }
  };

  /**
   * Update current user
   */
  const updateUser = (user: User): void => {
    setCurrentUser(user);
    localStorage.setItem('user', JSON.stringify(user));
  };

  const value: AuthContextType = {
    currentUser,
    token,
    isAuthenticated: !!token && !!currentUser,
    loading,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};