import { useState, useEffect } from 'react';
import { DecodedToken, verifyToken } from '../auth';

interface AuthState {
  token: string | null;
  decodedToken: DecodedToken | null;
  isLoading: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    token: null,
    decodedToken: null,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setAuthState({
        token: null,
        decodedToken: null,
        isLoading: false,
        error: null
      });
      return;
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      localStorage.removeItem('auth_token');
      setAuthState({
        token: null,
        decodedToken: null,
        isLoading: false,
        error: 'Invalid or expired token'
      });
      return;
    }

    setAuthState({
      token,
      decodedToken: decoded,
      isLoading: false,
      error: null
    });
  }, []);

  const login = (token: string) => {
    localStorage.setItem('auth_token', token);
    const decoded = verifyToken(token);
    if (!decoded) {
      setAuthState({
        token: null,
        decodedToken: null,
        isLoading: false,
        error: 'Invalid token'
      });
      return;
    }

    setAuthState({
      token,
      decodedToken: decoded,
      isLoading: false,
      error: null
    });
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setAuthState({
      token: null,
      decodedToken: null,
      isLoading: false,
      error: null
    });
  };

  return {
    ...authState,
    login,
    logout
  };
} 