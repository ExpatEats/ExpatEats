import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '../../shared/schema';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  register: (userData: RegisterData, autoLogin?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

interface RegisterData {
  username: string;
  password: string;
  email: string;
  name?: string;
  city?: string;
  country?: string;
  bio?: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const checkAuthStatus = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const user = await response.json();
        setAuthState(prev => ({
          ...prev,
          user,
          isAuthenticated: true,
          isLoading: false,
        }));
        
        // Keep localStorage in sync for backward compatibility
        localStorage.setItem('userProfile', JSON.stringify(user));
      } else {
        // Not authenticated
        setAuthState(prev => ({
          ...prev,
          user: null,
          isAuthenticated: false,
          isLoading: false,
        }));
        
        // Clear localStorage
        localStorage.removeItem('userProfile');
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setAuthState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      }));
      
      // Clear localStorage on error
      localStorage.removeItem('userProfile');
    }
  };

  const login = async (username: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setAuthState(prev => ({
          ...prev,
          user: data.user,
          isAuthenticated: true,
          isLoading: false,
        }));
        
        // Keep localStorage in sync
        localStorage.setItem('userProfile', JSON.stringify(data.user));
      } else {
        const errorMessage = data.message || 'Login failed';
        setAuthState(prev => ({
          ...prev,
          user: null,
          isAuthenticated: false,
          isLoading: false,
        }));
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // If it's already an Error we threw (login failed), re-throw it
      if (error instanceof Error && error.message !== 'Network error during login') {
        throw error;
      }
      
      // Handle network errors
      const errorMessage = 'Network error during login';
      setAuthState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      }));
      throw new Error(errorMessage);
    }
  };

  const register = async (userData: RegisterData, autoLogin: boolean = false) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        if (autoLogin) {
          setAuthState(prev => ({
            ...prev,
            user: data.user,
            isAuthenticated: true,
            isLoading: false,
          }));
          
          // Keep localStorage in sync
          localStorage.setItem('userProfile', JSON.stringify(data.user));
        } else {
          setAuthState(prev => ({
            ...prev,
            user: null,
            isAuthenticated: false,
            isLoading: false,
          }));
        }
      } else {
        const errorMessage = data.message || 'Registration failed';
        setAuthState(prev => ({
          ...prev,
          user: null,
          isAuthenticated: false,
          isLoading: false,
        }));
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      // If it's already an Error we threw (registration failed), re-throw it
      if (error instanceof Error && error.message !== 'Network error during registration') {
        throw error;
      }
      
      // Handle network errors
      const errorMessage = 'Network error during registration';
      setAuthState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      }));
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Clear state regardless of response status
      setAuthState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      }));
      
      // Clear localStorage
      localStorage.removeItem('userProfile');

      if (!response.ok) {
        console.warn('Logout request failed, but local state cleared');
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if network request fails
      setAuthState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      }));
      
      localStorage.removeItem('userProfile');
    }
  };

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const contextValue: AuthContextType = {
    ...authState,
    login,
    register,
    logout,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;