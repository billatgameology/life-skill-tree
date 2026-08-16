import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import type { CSSProperties } from 'react';
import AuthModal from '@/components/AuthModal';
import Toast from '@/components/Toast';
import { useAuth } from '@/hooks/useAuth';
import { useUserData } from '@/hooks/useUserData';
import { TempoContext, type TempoSession, type TempoState } from './context';
import { DEFAULT_BUDGET, buildSlots, swapSlot } from './time';
import { TabBar, TopBar } from './components/Chrome';
import Finder from './components/Finder';
import FitScreen from './components/FitScreen';
import InvestedScreen from './components/InvestedScreen';
import SessionScreen from './components/SessionScreen';
import SessionStrip from './components/SessionStrip';
import SkillPage from './components/SkillPage';
import './tempo.css';

/** Tempo's scoped palette — a precision timepiece: white dial, near-black hands, one sweep red. */
const THEME: CSSProperties = {
  '--tp-dial': '#FAFAF7',
  '--tp-ground': '#EFEFE9',
  '--tp-card': '#FFFFFF',
  '--tp-ink': '#121316',
  '--tp-ink2': '#5A5C61',
  '--tp-hairline': '#E4E4DD',
  '--tp-tick': '#C9C9C1',
  '--tp-red': '#C81E14',
} as CSSProperties;

/**
 * Design #12 — "Tempo". Time is the axis: minutes structure the library, not
 * domains. Fit skills into the time you actually have, assemble sessions that
 * sum to a budget, and watch invested time accumulate — never a streak.
 */
export default function TempoApp() {
  const { authError, clearAuthError, currentUser } = useAuth();
  const { user, loaded, syncError, completeSkill, toggleFavorite, completionDates } = useUserData();
  const location = useLocation();

  const [finderOpen, setFinderOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const [budget, setBudget] = useState(DEFAULT_BUDGET);
  const [session, setSession] = useState<TempoSession | null>(null);
  const [sessionsDone, setSessionsDone] = useState(0);

  const mainRef = useRef<HTMLElement>(null);
  const scrollPositions = useRef(new Map<string, number>());

  const completedIds = useMemo(() => user?.completedSkillIds ?? [], [user]);

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

  const logSkill = useCallback(
    (skillId: string) => {
      if (!requireAuth('Sign in to log your minutes.')) return false;
      return completeSkill(skillId);
    },
    [completeSkill, requireAuth],
  );

  const togglePin = useCallback(
    (skillId: string) => {
      if (!requireAuth('Sign in to pin skills.')) return false;
      return toggleFavorite(skillId);
    },
    [toggleFavorite, requireAuth],
  );

  // ── Session state machine (memory only; completion goes through completeSkill) ──

  const planSession = useCallback(
    (sessionBudget: number) => {
      setSession({
        budget: sessionBudget,
        slots: buildSlots(sessionBudget, completedIds),
        stage: 'plan',
        current: 0,
        loggedIds: [],
      });
    },
    [completedIds],
  );

  const swapSessionSlot = useCallback(
    (index: number) => {
      setSession((s) => (s ? { ...s, slots: swapSlot(s.slots, index, completedIds) } : s));
    },
    [completedIds],
  );

  const startSession = useCallback((): string | null => {
    if (!session || session.slots.length === 0) return null;
    setSession({ ...session, stage: 'run', current: 0 });
    return session.slots[0];
  }, [session]);

  const completeCurrentSlot = useCallback((): { ok: boolean; nextId: string | null } => {
    if (!session || session.stage !== 'run') return { ok: false, nextId: null };
    const id = session.slots[session.current];
    if (!logSkill(id)) return { ok: false, nextId: null };
    const nextIndex = session.current + 1;
    const finished = nextIndex >= session.slots.length;
    const loggedIds = [...session.loggedIds, id];
    setSession({
      ...session,
      stage: finished ? 'done' : 'run',
      current: finished ? session.current : nextIndex,
      loggedIds,
    });
    if (finished && loggedIds.length > 0) setSessionsDone((n) => n + 1);
    return { ok: true, nextId: finished ? null : session.slots[nextIndex] };
  }, [session, logSkill]);

  const skipCurrentSlot = useCallback((): string | null => {
    if (!session || session.stage !== 'run') return null;
    const nextIndex = session.current + 1;
    const finished = nextIndex >= session.slots.length;
    setSession({
      ...session,
      stage: finished ? 'done' : 'run',
      current: finished ? session.current : nextIndex,
    });
    if (finished && session.loggedIds.length > 0) setSessionsDone((n) => n + 1);
    return finished ? null : session.slots[nextIndex];
  }, [session]);

  const endSession = useCallback(() => setSession(null), []);

  const state = useMemo<TempoState>(
    () => ({
      completedIds,
      favoriteIds: user?.favorite ?? [],
      completionDates,
      budget,
      setBudget,
      logSkill,
      togglePin,
      session,
      planSession,
      swapSessionSlot,
      startSession,
      completeCurrentSlot,
      skipCurrentSlot,
      endSession,
      sessionsDone,
      openFinder: () => setFinderOpen(true),
    }),
    [
      completedIds,
      user,
      completionDates,
      budget,
      logSkill,
      togglePin,
      session,
      planSession,
      swapSessionSlot,
      startSession,
      completeCurrentSlot,
      skipCurrentSlot,
      endSession,
      sessionsDone,
    ],
  );

  // "/" opens the finder (unless typing in a field).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return;
      e.preventDefault();
      setFinderOpen(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Per-location scroll restoration: back lands where you left the list.
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
      <div className="tp-sans fixed inset-0 flex items-center justify-center bg-[#FAFAF7] text-[#5A5C61]" style={THEME}>
        <p className="tp-mono animate-pulse text-[12px] uppercase tracking-[0.24em]">
          Winding the movement…
        </p>
      </div>
    );
  }

  return (
    <TempoContext.Provider value={state}>
      <div
        className="tp-sans fixed inset-0 flex flex-col bg-[var(--tp-dial)] text-[var(--tp-ink)] antialiased"
        style={THEME}
      >
        <TopBar />
        <SessionStrip />

        <main ref={mainRef} onScroll={handleMainScroll} className="min-h-0 flex-1 overflow-y-auto">
          <Routes>
            <Route index element={<FitScreen />} />
            <Route path="skill/:skillId" element={<SkillPage />} />
            <Route path="session" element={<SessionScreen />} />
            <Route
              path="invested"
              element={<InvestedScreen signedIn={Boolean(currentUser)} onSignIn={() => setAuthOpen(true)} />}
            />
            <Route path="*" element={<Navigate to="/tempo" replace />} />
          </Routes>
        </main>

        <TabBar />

        <Finder open={finderOpen} onClose={() => setFinderOpen(false)} />

        <AuthModal
          open={authOpen || Boolean(authError)}
          onClose={() => {
            setAuthOpen(false);
            clearAuthError();
          }}
        />

        {syncError && (
          <div className="absolute bottom-20 left-1/2 z-[80] max-w-md -translate-x-1/2 rounded-md border border-[var(--tp-red)] bg-[var(--tp-card)] px-4 py-3 text-xs text-[var(--tp-ink2)] shadow-xl">
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
    </TempoContext.Provider>
  );
}
