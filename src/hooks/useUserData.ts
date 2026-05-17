import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  deleteField,
  doc,
  getDoc,
  getDocs,
  runTransaction,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import type { UserData } from '@/lib/types';

const USER_KEY = 'lifeskilltree_user';
const FIRESTORE_SYNC_TIMEOUT_MS = 8000;

interface CompletionDoc {
  skillId: string;
  completedDate: string;
}

function createEmptyUser(): UserData {
  return {
    completedSkillIds: [],
    favorite: [],
    badges: [],
    firstVisitDate: new Date().toISOString(),
  };
}

function normalizeUserData(data: Partial<UserData> | undefined, fallback: UserData): UserData {
  return {
    completedSkillIds: fallback.completedSkillIds,
    favorite: Array.isArray(data?.favorite) ? data.favorite : fallback.favorite,
    badges: Array.isArray(data?.badges) ? data.badges : fallback.badges,
    firstVisitDate: typeof data?.firstVisitDate === 'string' ? data.firstVisitDate : fallback.firstVisitDate,
  };
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      reject(new Error('Firestore sync timed out.'));
    }, ms);

    promise.then(
      (value) => {
        window.clearTimeout(timeoutId);
        resolve(value);
      },
      (error: unknown) => {
        window.clearTimeout(timeoutId);
        reject(error);
      },
    );
  });
}

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

async function loadCompletionDocs(uid: string) {
  if (!db) return [] as CompletionDoc[];

  const snapshot = await getDocs(collection(db, 'users', uid, 'skillCompletions'));

  return snapshot.docs.map((completionDoc) => {
    const data = completionDoc.data() as Partial<CompletionDoc>;

    return {
      skillId: typeof data.skillId === 'string' ? data.skillId : completionDoc.id,
      completedDate: typeof data.completedDate === 'string' ? data.completedDate : '',
    };
  });
}

async function saveSkillCompletion(uid: string, skillId: string) {
  if (!db) return;

  const userRef = doc(db, 'users', uid);
  const completionRef = doc(db, 'users', uid, 'skillCompletions', skillId);

  await runTransaction(db, async (transaction) => {
    const completionSnapshot = await transaction.get(completionRef);
    if (completionSnapshot.exists()) return;

    transaction.set(completionRef, {
      skillId,
      completedAt: serverTimestamp(),
      completedDate: getLocalDateKey(),
    });

    transaction.set(userRef, {
      completedSkillIds: deleteField(),
      updatedAt: serverTimestamp(),
    }, { merge: true });
  });
}

export function useUserData() {
  const { currentUser, loading: authLoading } = useAuth();
  const [user, setUser] = useState<UserData | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [syncError, setSyncError] = useState('');

  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;

    async function load() {
      setLoaded(false);
      setSyncError('');
      localStorage.removeItem(USER_KEY);

      if (!currentUser || !db) {
        if (!cancelled) {
          setUser(createEmptyUser());
          setLoaded(true);
        }
        return;
      }

      const fallbackUser = createEmptyUser();
      const userRef = doc(db, 'users', currentUser.uid);
      const snapshot = await withTimeout(getDoc(userRef), FIRESTORE_SYNC_TIMEOUT_MS);
      const completionDocs = await withTimeout(loadCompletionDocs(currentUser.uid), FIRESTORE_SYNC_TIMEOUT_MS);
      const derivedCompletedIds = completionDocs.map((completion) => completion.skillId);
      const remoteUser = snapshot.exists()
        ? normalizeUserData(snapshot.data() as Partial<UserData>, {
          ...fallbackUser,
          completedSkillIds: derivedCompletedIds,
        })
        : {
          ...fallbackUser,
          completedSkillIds: derivedCompletedIds,
        };

      const nextUser = {
        ...remoteUser,
        completedSkillIds: derivedCompletedIds,
      };

      await withTimeout(setDoc(userRef, {
        email: currentUser.email,
        displayName: currentUser.displayName || '',
        badges: nextUser.badges,
        favorite: nextUser.favorite,
        firstVisitDate: nextUser.firstVisitDate,
        completedSkillIds: deleteField(),
        updatedAt: serverTimestamp(),
        ...(!snapshot.exists() ? { createdAt: serverTimestamp() } : {}),
      }, { merge: true }), FIRESTORE_SYNC_TIMEOUT_MS);

      if (!cancelled) {
        setUser(nextUser);
        setLoaded(true);
      }
    }

    void load().catch((error: unknown) => {
      const message = error instanceof Error ? error.message : 'Firestore sync failed.';
      setSyncError(message);
      console.error('Firestore sync failed', error);
    });

    return () => {
      cancelled = true;
    };
  }, [authLoading, currentUser]);

  const completeSkill = useCallback((skillId: string) => {
    if (!currentUser || !db) return false;

    setUser((prev) => {
      if (!prev) return prev;
      if (prev.completedSkillIds.includes(skillId)) return prev;
      return {
        ...prev,
        completedSkillIds: [...prev.completedSkillIds, skillId],
      };
    });

    void saveSkillCompletion(currentUser.uid, skillId).catch((error: unknown) => {
      const message = error instanceof Error ? error.message : 'Firestore sync failed.';
      setSyncError(message);
      console.error('Firestore sync failed', error);
    });

    return true;
  }, [currentUser]);

  const toggleFavorite = useCallback((skillId: string) => {
    if (!currentUser || !db) return false;

    setUser((prev) => {
      if (!prev) return prev;
      const alreadyFavorite = prev.favorite.includes(skillId);
      const nextFavorite = alreadyFavorite
        ? prev.favorite.filter((id) => id !== skillId)
        : [...prev.favorite, skillId];
      return {
        ...prev,
        favorite: nextFavorite,
      };
    });

    const userRef = doc(db, 'users', currentUser.uid);
    void runTransaction(db, async (transaction) => {
      const snapshot = await transaction.get(userRef);
      const data = snapshot.exists() ? snapshot.data() as Partial<UserData> : {};
      const favorite = Array.isArray(data.favorite) ? data.favorite : [];
      const nextFavorite = favorite.includes(skillId)
        ? favorite.filter((id) => id !== skillId)
        : [...favorite, skillId];

      transaction.set(userRef, {
        favorite: nextFavorite,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    }).catch((error: unknown) => {
      const message = error instanceof Error ? error.message : 'Firestore sync failed.';
      setSyncError(message);
      console.error('Firestore sync failed', error);
    });

    return true;
  }, [currentUser]);

  return {
    user,
    loaded,
    syncError,
    completeSkill,
    toggleFavorite,
  };
}
