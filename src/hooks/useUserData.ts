import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  deleteField,
  doc,
  getDoc,
  getDocs,
  increment,
  runTransaction,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import type { UserData } from '@/lib/types';

const USER_KEY = 'skillblox_user';
const FIRESTORE_SYNC_TIMEOUT_MS = 8000;

interface CompletionDoc {
  skillId: string;
  xpAwarded: number;
  completedDate: string;
}

function createEmptyUser(): UserData {
  return {
    xp: 0,
    completedSkillIds: [],
    favorite: [],
    badges: [],
    firstVisitDate: new Date().toISOString(),
    currentStreak: 0,
    longestStreak: 0,
    lastCompletionDate: null,
  };
}

function normalizeUserData(data: Partial<UserData> | undefined, fallback: UserData): UserData {
  return {
    xp: typeof data?.xp === 'number' ? data.xp : fallback.xp,
    completedSkillIds: fallback.completedSkillIds,
    favorite: Array.isArray(data?.favorite) ? data.favorite : fallback.favorite,
    badges: Array.isArray(data?.badges) ? data.badges : fallback.badges,
    firstVisitDate: typeof data?.firstVisitDate === 'string' ? data.firstVisitDate : fallback.firstVisitDate,
    currentStreak: typeof data?.currentStreak === 'number' ? data.currentStreak : fallback.currentStreak,
    longestStreak: typeof data?.longestStreak === 'number' ? data.longestStreak : fallback.longestStreak,
    lastCompletionDate: typeof data?.lastCompletionDate === 'string' ? data.lastCompletionDate : fallback.lastCompletionDate,
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

function getPreviousDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() - 1);
  return getLocalDateKey(date);
}

function getNextStreak(currentStreak: number, longestStreak: number, lastCompletionDate: string | null) {
  const today = getLocalDateKey();
  const yesterday = getPreviousDateKey(today);

  if (lastCompletionDate === today) {
    return { currentStreak, longestStreak, lastCompletionDate };
  }

  const nextCurrentStreak = lastCompletionDate === yesterday ? currentStreak + 1 : 1;

  return {
    currentStreak: nextCurrentStreak,
    longestStreak: Math.max(longestStreak, nextCurrentStreak),
    lastCompletionDate: today,
  };
}

async function loadCompletionDocs(uid: string) {
  if (!db) return [] as CompletionDoc[];

  const snapshot = await getDocs(collection(db, 'users', uid, 'skillCompletions'));

  return snapshot.docs.map((completionDoc) => {
    const data = completionDoc.data() as Partial<CompletionDoc>;

    return {
      skillId: typeof data.skillId === 'string' ? data.skillId : completionDoc.id,
      xpAwarded: typeof data.xpAwarded === 'number' ? data.xpAwarded : 0,
      completedDate: typeof data.completedDate === 'string' ? data.completedDate : '',
    };
  });
}

async function saveSkillCompletion(uid: string, skillId: string, xp: number) {
  if (!db) return;

  const userRef = doc(db, 'users', uid);
  const completionRef = doc(db, 'users', uid, 'skillCompletions', skillId);

  await runTransaction(db, async (transaction) => {
    const completionSnapshot = await transaction.get(completionRef);
    if (completionSnapshot.exists()) return;

    const userSnapshot = await transaction.get(userRef);
    const userData = userSnapshot.exists() ? userSnapshot.data() as Partial<UserData> : {};
    const streak = getNextStreak(
      typeof userData.currentStreak === 'number' ? userData.currentStreak : 0,
      typeof userData.longestStreak === 'number' ? userData.longestStreak : 0,
      typeof userData.lastCompletionDate === 'string' ? userData.lastCompletionDate : null,
    );

    transaction.set(completionRef, {
      skillId,
      xpAwarded: xp,
      completedAt: serverTimestamp(),
      completedDate: getLocalDateKey(),
    });

    transaction.set(userRef, {
      xp: increment(xp),
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      lastCompletionDate: streak.lastCompletionDate,
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
      const derivedXp = completionDocs.reduce((total, completion) => total + completion.xpAwarded, 0);
      const remoteUser = snapshot.exists()
        ? normalizeUserData(snapshot.data() as Partial<UserData>, {
          ...fallbackUser,
          completedSkillIds: derivedCompletedIds,
          xp: derivedXp,
        })
        : {
          ...fallbackUser,
          completedSkillIds: derivedCompletedIds,
          xp: derivedXp,
        };

      const nextUser = {
        ...remoteUser,
        completedSkillIds: derivedCompletedIds,
        xp: derivedXp,
      };

      await withTimeout(setDoc(userRef, {
        email: currentUser.email,
        displayName: currentUser.displayName || '',
        badges: nextUser.badges,
        favorite: nextUser.favorite,
        firstVisitDate: nextUser.firstVisitDate,
        currentStreak: nextUser.currentStreak,
        longestStreak: nextUser.longestStreak,
        lastCompletionDate: nextUser.lastCompletionDate,
        xp: nextUser.xp,
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

  const completeSkill = useCallback((skillId: string, xp: number) => {
    if (!currentUser || !db) return false;

    setUser((prev) => {
      if (!prev) return prev;
      if (prev.completedSkillIds.includes(skillId)) return prev;
      const newUser = {
        ...prev,
        completedSkillIds: [...prev.completedSkillIds, skillId],
        xp: prev.xp + xp,
      };
      return newUser;
    });

    void saveSkillCompletion(currentUser.uid, skillId, xp).catch((error: unknown) => {
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
