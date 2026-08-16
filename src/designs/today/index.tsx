import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import type { CSSProperties } from 'react';
import AuthModal from '@/components/AuthModal';
import Toast from '@/components/Toast';
import { useAuth } from '@/hooks/useAuth';
import { useUserData } from '@/hooks/useUserData';
import { TodayContext, type TodayState } from './context';
import { HAND_SIZE, TODAY_BASE, dealFor, loadRitual, localDateKey, saveRitual } from './deal';
import DaysPage from './components/DaysPage';
import DealScreen from './components/DealScreen';
import FindPage from './components/FindPage';
import SkillPage from './components/SkillPage';
import './today.css';

/** TODAY's scoped palette — a near-black stage for one saturated card. */
const THEME: CSSProperties = {
  '--td-stage': '#131118',
  '--td-stage-2': '#1C1924',
  '--td-line': '#2B2735',
  '--td-text': '#EFECF5',
  '--td-text-2': '#A9A3B8',
} as CSSProperties;

/**
 * Design #14 — "Today". Anti-browsing: the app opens onto exactly one dealt
 * skill per calendar day. No taxonomy, no lists — receive the card, do it,
 * come back tomorrow. A quiet corner holds search and an A–Z index for the
 * days you need a specific skill.
 */
export default function TodayApp() {
  const { authError, clearAuthError, currentUser } = useAuth();
  const { user, loaded, syncError, completeSkill, toggleFavorite, completionDates } = useUserData();
  const location = useLocation();
  const navigate = useNavigate();

  const [authOpen, setAuthOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  // Today's calendar key — refreshed on focus/visibility AND on a timer armed
  // for the next local midnight, so an actively-used tab rolls over too
  // (otherwise completing at 00:05 would deal a second card for "yesterday").
  const [dateKey, setDateKey] = useState(() => localDateKey());
  useEffect(() => {
    const refresh = () => setDateKey(localDateKey());
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    // DST-safe next-midnight boundary, with a 1s buffer against early firing.
    const now = new Date();
    const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const timer = window.setTimeout(refresh, nextMidnight.getTime() - now.getTime() + 1000);
    return () => {
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
      window.clearTimeout(timer);
    };
  }, [dateKey]);

  // The day's ritual: redeals used + active mood. Derived against dateKey so
  // it resets itself at midnight without any state syncing.
  const [ritualState, setRitualState] = useState(() => loadRitual(localDateKey()));
  const ritual = useMemo(
    () => (ritualState.date === dateKey ? ritualState : loadRitual(dateKey)),
    [ritualState, dateKey],
  );
  useEffect(() => {
    saveRitual(ritual);
  }, [ritual]);

  const mainRef = useRef<HTMLElement>(null);
  const scrollPositions = useRef(new Map<string, number>());

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
  }, []);

  const requireAuth = useCallback(
    (message: string): boolean => {
      if (currentUser) return true;
      setAuthOpen(true);
      showToast(message);
      return false;
    },
    [currentUser, showToast],
  );

  const markDone = useCallback(
    (skillId: string) => {
      if (!requireAuth('Sign in to keep your days — no scores, just what you did.')) return false;
      return completeSkill(skillId);
    },
    [completeSkill, requireAuth],
  );

  const toggleKeep = useCallback(
    (skillId: string) => {
      if (!requireAuth('Sign in to keep skills close.')) return false;
      return toggleFavorite(skillId);
    },
    [toggleFavorite, requireAuth],
  );

  const setMood = useCallback(
    (id: string | null) => {
      setRitualState((prev) => {
        const cur = prev.date === dateKey ? prev : loadRitual(dateKey);
        return cur.mood === id && cur === prev ? prev : { ...cur, mood: id };
      });
    },
    [dateKey],
  );

  const completedIds = useMemo(() => user?.completedSkillIds ?? [], [user]);
  const favoriteIds = useMemo(() => user?.favorite ?? [], [user]);
  const completedSet = useMemo(() => new Set(completedIds), [completedIds]);

  // The deal is seeded by the completed set AS OF THE START OF TODAY, so
  // completing skills mid-day never reshuffles the card already on the table.
  const baseCompleted = useMemo(() => {
    const base = new Set(completedIds);
    for (const [id, date] of Object.entries(completionDates)) {
      if (date === dateKey) base.delete(id);
    }
    return base;
  }, [completedIds, completionDates, dateKey]);

  const deal = useMemo(
    () => dealFor(dateKey, baseCompleted, ritual.pass, ritual.mood),
    [dateKey, baseCompleted, ritual.pass, ritual.mood],
  );

  const redeal = useCallback(() => {
    const cur = ritualState.date === dateKey ? ritualState : loadRitual(dateKey);
    if (cur.pass >= HAND_SIZE - 1) return;
    // Don't spend a redeal when the pool can't produce a different card
    // (e.g. one eligible skill left in the chosen mood).
    const now = dealFor(dateKey, baseCompleted, cur.pass, cur.mood);
    const next = dealFor(dateKey, baseCompleted, cur.pass + 1, cur.mood);
    if (now.skill.id === next.skill.id) {
      showToast("That's the one that fits today — give it a look.");
      return;
    }
    setRitualState({ ...cur, pass: cur.pass + 1 });
  }, [dateKey, ritualState, baseCompleted, showToast]);

  const state = useMemo<TodayState>(
    () => ({
      dateKey,
      completedSet,
      favoriteIds,
      completionDates,
      deal,
      moodId: ritual.mood,
      redealsLeft: HAND_SIZE - 1 - ritual.pass,
      redeal,
      setMood,
      markDone,
      toggleKeep,
    }),
    [dateKey, completedSet, favoriteIds, completionDates, deal, ritual.mood, ritual.pass, redeal, setMood, markDone, toggleKeep],
  );

  // "/" jumps to Find (unless typing in a field).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return;
      e.preventDefault();
      navigate(`${TODAY_BASE}/find`);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate]);

  // Per-location scroll restoration on the single scroll container.
  useLayoutEffect(() => {
    const el = mainRef.current;
    if (el) el.scrollTop = scrollPositions.current.get(location.key) ?? 0;
  }, [location.key]);

  const handleMainScroll = useCallback(() => {
    const el = mainRef.current;
    if (el) scrollPositions.current.set(location.key, el.scrollTop);
  }, [location.key]);

  if (!loaded) {
    return (
      <div
        className="td-display fixed inset-0 flex items-center justify-center bg-[#131118] text-[#A9A3B8]"
        style={THEME}
      >
        <p className="animate-pulse text-[12px] uppercase tracking-[0.28em]">
          Turning over today&rsquo;s card…
        </p>
      </div>
    );
  }

  return (
    <TodayContext.Provider value={state}>
      <div
        className="td-body fixed inset-0 flex flex-col bg-[var(--td-stage)] text-[var(--td-text)] antialiased"
        style={THEME}
      >
        <main ref={mainRef} onScroll={handleMainScroll} className="min-h-0 flex-1 overflow-y-auto">
          <Routes>
            <Route index element={<DealScreen />} />
            <Route path="skill/:skillId" element={<SkillPage />} />
            <Route path="days" element={<DaysPage />} />
            <Route path="find" element={<FindPage />} />
            <Route path="*" element={<Navigate to={TODAY_BASE} replace />} />
          </Routes>
        </main>

        <AuthModal
          open={authOpen || Boolean(authError)}
          onClose={() => {
            setAuthOpen(false);
            clearAuthError();
          }}
        />

        {syncError && (
          <div className="absolute bottom-6 left-1/2 z-[80] max-w-md -translate-x-1/2 rounded-xl border border-[#7A4A44] bg-[var(--td-stage-2)] px-4 py-3 text-xs text-[var(--td-text-2)] shadow-xl">
            Sync failed: {syncError}
          </div>
        )}

        <Toast
          message={toastMessage}
          visible={toastVisible}
          onDone={() => {
            setToastVisible(false);
            setToastMessage('');
          }}
        />
      </div>
    </TodayContext.Provider>
  );
}
