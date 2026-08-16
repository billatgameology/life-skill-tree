import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import type { CSSProperties } from 'react';
import AuthModal from '@/components/AuthModal';
import Toast from '@/components/Toast';
import { useAuth } from '@/hooks/useAuth';
import { useUserData } from '@/hooks/useUserData';
import { TrailContext, type TrailState } from './context';
import { TR_BASE } from './derive';
import Finder from './components/Finder';
import LegIndex from './components/LegIndex';
import TrailBar from './components/TrailBar';
import TrailPage from './components/TrailPage';
import WaypointPage from './components/WaypointPage';
import './trail.css';

/** Trail's scoped palette — parchment topo map, pine path, berry blazes. */
const THEME: CSSProperties = {
  '--tr-ground': '#F0E8D2',
  '--tr-panel': '#F8F3E3',
  '--tr-ink': '#2E3120',
  '--tr-ink2': '#5B5E45',
  '--tr-pine': '#3F5A2E',
  '--tr-berry': '#8F3B45',
  '--tr-gold': '#77621B',
  '--tr-rule': '#DBD0B2',
  '--tr-contour': 'rgba(91, 94, 69, 0.14)',
} as CSSProperties;

/**
 * Design #15 — "Trail". All 233 skills as ONE continuous path: a deterministic
 * global ordering rendered as a long serpentine trail with every skill as a
 * waypoint, grouped into derived, named legs. Travel onward — or wander;
 * every waypoint is open.
 */
export default function TrailApp() {
  const { authError, clearAuthError } = useAuth();
  const { user, loaded, syncError, completeSkill, toggleFavorite, completionDates } = useUserData();
  const location = useLocation();

  const [finderOpen, setFinderOpen] = useState(false);
  const [legIndexOpen, setLegIndexOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [jumpTarget, setJumpTarget] = useState<string | null>(null);

  const mainRef = useRef<HTMLElement>(null);
  const scrollPositions = useRef(new Map<string, number>());

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
  }, []);

  // Auth gate: completeSkill/toggleFavorite return false when signed out —
  // open the auth modal and say why, never crash.
  const blaze = useCallback(
    (skillId: string) => {
      const ok = completeSkill(skillId);
      if (!ok) {
        setAuthOpen(true);
        showToast('Sign in to blaze waypoints — progress saves to your account.');
      }
      return ok;
    },
    [completeSkill, showToast],
  );

  const toggleFlag = useCallback(
    (skillId: string) => {
      const ok = toggleFavorite(skillId);
      if (!ok) {
        setAuthOpen(true);
        showToast('Sign in to flag waypoints for later.');
      }
      return ok;
    },
    [toggleFavorite, showToast],
  );

  const clearJump = useCallback(() => setJumpTarget(null), []);

  const state = useMemo<TrailState>(
    () => ({
      completedIds: user?.completedSkillIds ?? [],
      favoriteIds: user?.favorite ?? [],
      completionDates,
      blaze,
      toggleFlag,
      openFinder: () => setFinderOpen(true),
      openLegIndex: () => setLegIndexOpen(true),
      jumpTarget,
      requestJump: setJumpTarget,
      clearJump,
    }),
    [user, completionDates, blaze, toggleFlag, jumpTarget, clearJump],
  );

  // "/" opens the waypoint finder (unless typing in a field).
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

  // Per-scope scroll restoration: the trail page keeps its position whenever
  // you come back to it (back button or the "The trail" link), while skill
  // pages restore per visit.
  const scrollScope =
    location.pathname === TR_BASE || location.pathname === `${TR_BASE}/`
      ? TR_BASE
      : location.key;

  useLayoutEffect(() => {
    const el = mainRef.current;
    if (el) el.scrollTop = scrollPositions.current.get(scrollScope) ?? 0;
  }, [scrollScope]);

  const handleMainScroll = useCallback(() => {
    const el = mainRef.current;
    if (el) scrollPositions.current.set(scrollScope, el.scrollTop);
  }, [scrollScope]);

  if (!loaded) {
    return (
      <div className="tr-sans fixed inset-0 flex items-center justify-center bg-[#F0E8D2] text-[#5B5E45]" style={THEME}>
        <p className="tr-mono animate-pulse text-[12px] uppercase tracking-[0.2em]">
          Finding the trailhead…
        </p>
      </div>
    );
  }

  return (
    <TrailContext.Provider value={state}>
      <div
        className="tr-sans tr-root fixed inset-0 flex flex-col bg-[var(--tr-ground)] text-[var(--tr-ink)] antialiased"
        style={THEME}
      >
        {/* Static contour layer — content scrolls above it. */}
        <div aria-hidden="true" className="tr-contours pointer-events-none absolute inset-0" />

        <TrailBar />

        <main ref={mainRef} onScroll={handleMainScroll} className="relative min-h-0 flex-1 overflow-y-auto">
          <Routes>
            <Route index element={<TrailPage />} />
            <Route path="skill/:skillId" element={<WaypointPage />} />
            <Route path="*" element={<Navigate to={TR_BASE} replace />} />
          </Routes>
        </main>

        <Finder open={finderOpen} onClose={() => setFinderOpen(false)} />
        <LegIndex open={legIndexOpen} onClose={() => setLegIndexOpen(false)} />

        <AuthModal
          open={authOpen || Boolean(authError)}
          onClose={() => {
            setAuthOpen(false);
            clearAuthError();
          }}
        />

        {syncError && (
          <div className="absolute bottom-6 left-1/2 z-[80] max-w-md -translate-x-1/2 rounded-lg border border-[var(--tr-berry)] bg-[var(--tr-panel)] px-4 py-3 text-xs text-[var(--tr-ink2)] shadow-xl">
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
    </TrailContext.Provider>
  );
}
