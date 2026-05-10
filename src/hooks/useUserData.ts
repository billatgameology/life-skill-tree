import { useState, useEffect, useCallback } from 'react';
import type { UserData } from '@/lib/types';

const USER_KEY = 'skillblox_user';

const DEFAULT_USER: UserData = {
  xp: 0,
  completedSkillIds: [],
  badges: [],
  firstVisitDate: new Date().toISOString(),
};

function loadUser(): UserData | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) as UserData : null;
  } catch {
    return null;
  }
}

function saveUser(user: UserData) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function useUserData() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let u = loadUser();
    // Auto-create user on first visit — no welcome screen needed
    if (!u) {
      u = { ...DEFAULT_USER };
      saveUser(u);
    }
    setUser(u);
    setLoaded(true);
  }, []);

  const completeSkill = useCallback((skillId: string, xp: number) => {
    setUser((prev) => {
      if (!prev) return prev;
      if (prev.completedSkillIds.includes(skillId)) return prev;
      const newUser = {
        ...prev,
        completedSkillIds: [...prev.completedSkillIds, skillId],
        xp: prev.xp + xp,
      };
      saveUser(newUser);
      return newUser;
    });
  }, []);

  return {
    user,
    loaded,
    completeSkill,
  };
}
