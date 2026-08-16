import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import type { CSSProperties } from 'react';
import AuthModal from '@/components/AuthModal';
import Toast from '@/components/Toast';
import { useAuth } from '@/hooks/useAuth';
import { useUserData } from '@/hooks/useUserData';
import { FrontierContext, type Advance, type FrontierState } from './context';
import { FR_BASE, wouldUnlock } from './expedition';
import AheadPage from './components/AheadPage';
import CampPage from './components/CampPage';
import LogbookPage from './components/LogbookPage';
import Scout from './components/Scout';
import SkillPage from './components/SkillPage';
import { MobileTabBar, TopBar } from './components/chrome';
import './frontier.css';

/** Frontier's scoped palette — expedition at dawn: indigo night, horizon light. */
const THEME: CSSProperties = {
  '--fr-night': '#10162B',
  '--fr-deep': '#0B1022',
  '--fr-card': '#1A2140',
  '--fr-card2': '#212A4E',
  '--fr-line': '#2A3457',
  '--fr-ink': '#F4F1E8',
  '--fr-dim': '#A9B2CC',
  '--fr-faint': '#8C96B4',
  '--fr-dawn': '#FF8A5C',
  '--fr-ember': '#FFB454',
} as CSSProperties;

/**
 * Design #11 — "Frontier". The library organized by the user's own progress:
 * ground covered behind, the actionable frontier at dawn, and further ridges
 * ahead — every completion visibly moves the whole territory.
 */
export default function FrontierApp() {
  const { authError, clearAuthError, currentUser } = useAuth();
  const { user, loaded, syncError, completeSkill, toggleFavorite, completionDates } = useUserData();
  const location = useLocation();

  const [scoutOpen, setScoutOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  // An advance belongs to the account that made it, so it is stored with its
  // owner's uid and derived below — sign-out or an account switch can never
  // leave a stale banner contradicting the territory.
  const [ownedAdvance, setOwnedAdvance] = useState<(Advance & { uid: string }) | null>(null);
  const [handSeed, setHandSeed] = useState(1);
  const lastAdvance = ownedAdvance && ownedAdvance.uid === currentUser?.uid ? ownedAdvance : null;

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

  const completedIds = useMemo(() => user?.completedSkillIds ?? [], [user]);

  const advance = useCallback(
    (skillId: string) => {
      if (!requireAuth('Sign in to record the ground you cover.')) return false;
      const alreadyCovered = completedIds.includes(skillId);
      const ok = completeSkill(skillId);
      if (ok && !alreadyCovered) {
        setOwnedAdvance({
          skillId,
          unlockedIds: wouldUnlock(skillId, completedIds).map((s) => s.id),
          at: Date.now(),
          uid: currentUser?.uid ?? '',
        });
      }
      return ok;
    },
    [completeSkill, requireAuth, completedIds, currentUser],
  );

  const toggleWaypoint = useCallback(
    (skillId: string) => {
      if (!requireAuth('Sign in to mark waypoints.')) return false;
      return toggleFavorite(skillId);
    },
    [toggleFavorite, requireAuth],
  );

  const state = useMemo<FrontierState>(
    () => ({
      completedIds,
      favoriteIds: user?.favorite ?? [],
      completionDates,
      advance,
      toggleWaypoint,
      lastAdvance,
      clearLastAdvance: () => setOwnedAdvance(null),
      handSeed,
      reshuffleHand: () => {
        setHandSeed((s) => s + 1);
        setOwnedAdvance(null);
      },
      openScout: () => setScoutOpen(true),
      signedIn: Boolean(currentUser),
      openAuth: () => setAuthOpen(true),
    }),
    [completedIds, user, completionDates, advance, toggleWaypoint, lastAdvance, handSeed, currentUser],
  );

  // "/" opens Scout (unless typing in a field).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return;
      e.preventDefault();
      setScoutOpen(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Per-location scroll restoration: back from a survey lands where you left
  // the camp; fresh navigations start at the top.
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
      <div className="fr-body fixed inset-0 flex items-center justify-center bg-[#10162B] text-[#A9B2CC]" style={THEME}>
        <p className="fr-mono animate-pulse text-[12px] uppercase tracking-[0.24em]">
          Reading the terrain…
        </p>
      </div>
    );
  }

  return (
    <FrontierContext.Provider value={state}>
      <div
        className="fr-root fr-body fixed inset-0 flex flex-col bg-[var(--fr-night)] text-[var(--fr-ink)] antialiased"
        style={THEME}
      >
        <TopBar />

        <main ref={mainRef} onScroll={handleMainScroll} className="min-h-0 flex-1 overflow-y-auto">
          <Routes>
            <Route index element={<CampPage />} />
            <Route path="skill/:skillId" element={<SkillPage />} />
            <Route path="ahead" element={<AheadPage />} />
            <Route path="logbook" element={<LogbookPage user={user} />} />
            <Route path="*" element={<Navigate to={FR_BASE} replace />} />
          </Routes>
        </main>

        <MobileTabBar />

        <Scout open={scoutOpen} onClose={() => setScoutOpen(false)} />

        <AuthModal
          open={authOpen || Boolean(authError)}
          onClose={() => {
            setAuthOpen(false);
            clearAuthError();
          }}
        />

        {syncError && (
          <div className="absolute bottom-20 left-1/2 z-[80] max-w-md -translate-x-1/2 rounded-lg border border-[#B3542F] bg-[var(--fr-card)] px-4 py-3 text-xs text-[var(--fr-dim)] shadow-xl">
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
    </FrontierContext.Provider>
  );
}
