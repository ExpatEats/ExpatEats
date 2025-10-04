import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '../../shared/schema';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (username: string, password: string, rememberMe?: boolean) => Promise<void>;
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
        const data = await response.json();
        const user = data.user; // Extract user from the response object
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

  const login = async (username: string, password: string, rememberMe: boolean = false) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      // Get CSRF token
      const csrfResponse = await fetch('/api/csrf-token', {
        method: 'GET',
        credentials: 'include',
      });
      
      if (!csrfResponse.ok) {
        throw new Error('Failed to get security token');
      }
      
      const { csrfToken } = await csrfResponse.json();

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify({ username, password, rememberMe }),
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
        let errorMessage = data.message || 'Login failed';
        
        // Provide more user-friendly error messages based on error codes
        switch (data.code) {
          case 'INVALID_CREDENTIALS':
            errorMessage = 'Invalid username or password. Please check your credentials and try again.';
            break;
          case 'ACCOUNT_LOCKED':
            errorMessage = `Your account has been locked due to too many failed attempts. ${data.message}`;
            break;
          case 'MISSING_CREDENTIALS':
            errorMessage = 'Please enter both username and password.';
            break;
          case 'LOGIN_RATE_LIMIT_EXCEEDED':
            errorMessage = 'Too many login attempts. Please wait 15 minutes before trying again.';
            break;
          case 'CSRF_ERROR':
            errorMessage = 'Security token expired. Please refresh the page and try again.';
            break;
          default:
            errorMessage = data.message || 'Login failed. Please try again.';
        }
        
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

      // Get CSRF token
      const csrfResponse = await fetch('/api/csrf-token', {
        method: 'GET',
        credentials: 'include',
      });
      
      if (!csrfResponse.ok) {
        throw new Error('Failed to get security token');
      }
      
      const { csrfToken } = await csrfResponse.json();

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
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
        let errorMessage = data.message || 'Registration failed';
        
        // Provide more user-friendly error messages based on error codes
        switch (data.code) {
          case 'USERNAME_EXISTS':
            errorMessage = 'This username is already taken. Please choose a different username.';
            break;
          case 'EMAIL_EXISTS':
            errorMessage = 'An account with this email already exists. Please use a different email or try logging in.';
            break;
          case 'CSRF_ERROR':
            errorMessage = 'Security token expired. Please refresh the page and try again.';
            break;
          default:
            errorMessage = data.message || 'Registration failed. Please try again.';
        }
        
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

      // Get CSRF token
      const csrfResponse = await fetch('/api/csrf-token', {
        method: 'GET',
        credentials: 'include',
      });
      
      let headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (csrfResponse.ok) {
        const { csrfToken } = await csrfResponse.json();
        headers['X-CSRF-Token'] = csrfToken;
      }

      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers,
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