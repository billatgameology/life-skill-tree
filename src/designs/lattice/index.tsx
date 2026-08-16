import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import type { CSSProperties } from 'react';
import AuthModal from '@/components/AuthModal';
import Toast from '@/components/Toast';
import { useAuth } from '@/hooks/useAuth';
import { useUserData } from '@/hooks/useUserData';
import { LatticeContext, type LatticeState } from './context';
import { LAT_BASE } from './graph';
import BoardHeader from './components/BoardHeader';
import BoardHome from './components/BoardHome';
import NetPage from './components/NetPage';
import Probe from './components/Probe';
import SkillPage from './components/SkillPage';
import './lattice.css';

/**
 * Lattice's scoped palette — dark solder-mask green, copper traces,
 * HASL gold, silkscreen white. All text pairs hold ≥4.5:1 on their grounds.
 */
const THEME: CSSProperties = {
  '--lt-board': '#0E2318',
  '--lt-panel': '#122B1E',
  '--lt-well': '#0A1B12',
  '--lt-line': '#24422F',
  '--lt-silk': '#E9F4EB',
  '--lt-dim': '#A8C4B0',
  '--lt-copper': '#D98E4A',
  '--lt-gold': '#F0C33C',
  '--lt-gold-ink': '#221A06',
  '--lt-red': '#E58A8A',
} as CSSProperties;

/**
 * Design #10 — "Lattice". The prerequisite DAG is the navigation itself:
 * skills are pads, prerequisites are copper traces, connected components
 * are nets, and the user WALKS the edges. Completion never locks anything —
 * soldered joints just make the frontier glow.
 */
export default function LatticeApp() {
  const { authError, clearAuthError, currentUser } = useAuth();
  const { user, loaded, syncError, completeSkill, toggleFavorite, completionDates } = useUserData();
  const location = useLocation();

  const [probeOpen, setProbeOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

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

  const solder = useCallback(
    (skillId: string) => {
      if (!requireAuth('Sign in to save your progress.')) return false;
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

  const state = useMemo<LatticeState>(() => {
    const completedIds = user?.completedSkillIds ?? [];
    return {
      completedIds,
      completedSet: new Set(completedIds),
      favoriteIds: user?.favorite ?? [],
      completionDates,
      solder,
      togglePin,
      openProbe: () => setProbeOpen(true),
    };
  }, [user, completionDates, solder, togglePin]);

  // "/" opens the Probe (unless typing in a field).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) {
        return;
      }
      e.preventDefault();
      setProbeOpen(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Per-location scroll restoration: back from a pad lands where you left.
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
        className="lattice lt-board-grid fixed inset-0 flex items-center justify-center bg-[#0E2318] text-[#A8C4B0]"
        style={THEME}
      >
        <p className="lt-mono lt-blink text-[12px] uppercase tracking-[0.24em]">
          Powering up the board…
        </p>
      </div>
    );
  }

  return (
    <LatticeContext.Provider value={state}>
      <div
        className="lattice lt-board-grid fixed inset-0 flex flex-col bg-[var(--lt-board)] text-[var(--lt-silk)] antialiased"
        style={THEME}
      >
        <BoardHeader />

        <main
          ref={mainRef}
          onScroll={handleMainScroll}
          className="lt-scroll min-h-0 flex-1 overflow-y-auto"
        >
          <Routes>
            <Route index element={<BoardHome />} />
            <Route path="net/:netId" element={<NetPage />} />
            <Route path="skill/:skillId" element={<SkillPage />} />
            <Route path="*" element={<Navigate to={LAT_BASE} replace />} />
          </Routes>
        </main>

        <Probe open={probeOpen} onClose={() => setProbeOpen(false)} />

        <AuthModal
          open={authOpen || Boolean(authError)}
          onClose={() => {
            setAuthOpen(false);
            clearAuthError();
          }}
        />

        {syncError && (
          <div className="lt-mono absolute bottom-6 left-1/2 z-[70] w-[min(480px,calc(100%-32px))] -translate-x-1/2 rounded-lg border border-[var(--lt-red)] bg-[var(--lt-well)] px-4 py-3 text-[11px] text-[var(--lt-dim)] shadow-xl">
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
    </LatticeContext.Provider>
  );
}
