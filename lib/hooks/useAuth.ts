import { useState, useEffect } from 'react';
import { JWTPayload, verifyToken } from '../auth';

interface AuthState {
  token: string | null;
  user: JWTPayload | null;
  isLoading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    token: null,
    user: null,
    isLoading: true
  });

  useEffect(() => {
    // Check localStorage first
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      const decoded = verifyToken(storedToken);
      if (decoded) {
        setAuthState({
          token: storedToken,
          user: decoded,
          isLoading: false
        });
        return;
      }
      // Clear invalid token
      localStorage.removeItem('auth_token');
    }

    // Check URL token
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');
    
    if (urlToken) {
      const decoded = verifyToken(urlToken);
      if (decoded) {
        // Store valid token
        localStorage.setItem('auth_token', urlToken);
        setAuthState({
          token: urlToken,
          user: decoded,
          isLoading: false
        });
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }
    }

    setAuthState(prev => ({ ...prev, isLoading: false }));
  }, []);

  const logout = () => {
    localStorage.removeItem('auth_token');
    setAuthState({
      token: null,
      user: null,
      isLoading: false
    });
  };

  return {
    ...authState,
    logout
  };
} 