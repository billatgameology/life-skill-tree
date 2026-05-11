import { createContext } from 'react';
import type { User } from 'firebase/auth';

export interface AuthContextValue {
  firebaseReady: boolean;
  currentUser: User | null;
  loading: boolean;
  authError: string;
  clearAuthError: () => void;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
