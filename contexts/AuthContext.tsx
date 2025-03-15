'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../lib/firebase';
import { User, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      // Ignore cancelled popup and closed popup errors
      if (error.code !== 'auth/cancelled-popup-request' && 
          error.code !== 'auth/popup-closed-by-user') {
        setError(error.message);
        console.error('Error signing in with Google:', error);
      }
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
    } catch (error: any) {
      setError(error.message);
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 