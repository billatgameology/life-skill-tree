import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  createUserWithEmailAndPassword,
  getRedirectResult,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { AuthContext, type AuthContextValue } from '@/context/auth';
import { auth, db, isFirebaseConfigured } from '@/lib/firebase';

const GOOGLE_PENDING_KEY = 'life_skill_atlas_google_pending';
const GOOGLE_POPUP_TIMEOUT_MS = 15000;

function requireAuth() {
  if (!auth) {
    throw new Error('Firebase is not configured yet.');
  }
  return auth;
}

function createGoogleProvider() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  return provider;
}

async function ensureUserProfile(user: User, displayName = user.displayName || '') {
  if (!db) return;

  const userRef = doc(db, 'users', user.uid);
  const snapshot = await getDoc(userRef);

  if (snapshot.exists()) {
    await setDoc(userRef, {
      email: user.email,
      displayName,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    return;
  }

  await setDoc(userRef, {
    email: user.email,
    displayName,
    xp: 0,
    badges: [],
    firstVisitDate: new Date().toISOString(),
    currentStreak: 0,
    longestStreak: 0,
    lastCompletionDate: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

function timeoutGooglePopup() {
  return new Promise<never>((_, reject) => {
    window.setTimeout(() => {
      reject(new Error('Google sign-in timed out. Try again in regular Chrome, or use email/password.'));
    }, GOOGLE_POPUP_TIMEOUT_MS);
  });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState(() => auth?.currentUser ?? null);
  const [loading, setLoading] = useState(Boolean(auth));
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (!auth) return;

    void getRedirectResult(auth).then((credential) => {
      if (credential?.user) {
        void ensureUserProfile(credential.user);
      }
    }).catch((error: unknown) => {
      const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';
      setAuthError(code || 'Google sign-in could not finish.');
      localStorage.removeItem(GOOGLE_PENDING_KEY);
    });

    return onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        localStorage.removeItem(GOOGLE_PENDING_KEY);
        setAuthError('');
        void ensureUserProfile(user);
      }
      setLoading(false);
    });
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    firebaseReady: isFirebaseConfigured,
    currentUser,
    loading,
    authError,
    clearAuthError() {
      setAuthError('');
    },
    async signUp(email, password, displayName) {
      const credential = await createUserWithEmailAndPassword(requireAuth(), email, password);
      const trimmedName = displayName?.trim();

      if (trimmedName) {
        await updateProfile(credential.user, { displayName: trimmedName });
      }

      await ensureUserProfile(credential.user, trimmedName || credential.user.displayName || '');
    },
    async signIn(email, password) {
      await signInWithEmailAndPassword(requireAuth(), email, password);
    },
    async signInWithGoogle() {
      localStorage.setItem(GOOGLE_PENDING_KEY, 'true');
      try {
        const credential = await Promise.race([
          signInWithPopup(requireAuth(), createGoogleProvider()),
          timeoutGooglePopup(),
        ]);
        localStorage.removeItem(GOOGLE_PENDING_KEY);
        await ensureUserProfile(credential.user);
      } catch (error) {
        localStorage.removeItem(GOOGLE_PENDING_KEY);
        const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';
        if (code.includes('popup-blocked')) {
          await signInWithRedirect(requireAuth(), createGoogleProvider());
          return;
        }
        throw error;
      }
    },
    async signOutUser() {
      await signOut(requireAuth());
    },
  }), [authError, currentUser, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
