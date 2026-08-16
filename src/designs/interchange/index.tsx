import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import type { CSSProperties } from 'react';
import AuthModal from '@/components/AuthModal';
import Toast from '@/components/Toast';
import { useAuth } from '@/hooks/useAuth';
import { useUserData } from '@/hooks/useUserData';
import { InterchangeContext, type InterchangeState } from './context';
import { IC_BASE } from './lineMeta';
import LineIndex from './components/LineIndex';
import NetworkBoard from './components/NetworkBoard';
import PlatformDiagram from './components/PlatformDiagram';
import SavedScreen from './components/SavedScreen';
import StationFinder from './components/StationFinder';
import StationPage from './components/StationPage';
import SystemHeader from './components/SystemHeader';
import TabBar from './components/TabBar';
import YouScreen from './components/YouScreen';
import { JourneyItinerary, JourneysScreen } from './components/JourneysScreen';

/** Interchange's scoped palette — municipal ink on map paper. */
const THEME: CSSProperties = {
  '--ic-paper': '#F7F6F2',
  '--ic-band': '#EFEDE6',
  '--ic-card': '#FFFFFF',
  '--ic-ink': '#16181B',
  '--ic-ink2': '#63665F',
  '--ic-rule': '#E3E0D8',
  '--ic-green': '#2E7D4F',
  '--ic-amber': '#D97E00',
} as CSSProperties;

function HomeScreen() {
  return (
    <>
      <div className="lg:hidden">
        <LineIndex variant="screen" />
      </div>
      <div className="hidden lg:block">
        <NetworkBoard />
      </div>
    </>
  );
}

/**
 * Design #2 — "Interchange". The skill library as a city transit system:
 * lines (domains), stations (skills), zones (levels), journeys (paths).
 */
export default function InterchangeApp() {
  const { authError, clearAuthError, currentUser } = useAuth();
  const { user, loaded, syncError, completeSkill, toggleFavorite, completionDates } = useUserData();
  const location = useLocation();

  const [finderOpen, setFinderOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [activeJourneyId, setActiveJourneyId] = useState<string | null>(null);

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

  const markVisited = useCallback(
    (skillId: string) => {
      if (!requireAuth('Sign in to save your progress.')) return false;
      return completeSkill(skillId);
    },
    [completeSkill, requireAuth],
  );

  const toggleSaved = useCallback(
    (skillId: string) => {
      if (!requireAuth('Sign in to save stops.')) return false;
      return toggleFavorite(skillId);
    },
    [toggleFavorite, requireAuth],
  );

  const state = useMemo<InterchangeState>(
    () => ({
      completedIds: user?.completedSkillIds ?? [],
      favoriteIds: user?.favorite ?? [],
      completionDates,
      markVisited,
      toggleSaved,
      activeJourneyId,
      startJourney: setActiveJourneyId,
      clearJourney: () => setActiveJourneyId(null),
      openFinder: () => setFinderOpen(true),
    }),
    [user, completionDates, markVisited, toggleSaved, activeJourneyId],
  );

  // "/" opens the Station Finder (unless typing in a field).
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

  // Per-location scroll restoration: back from a station lands on the exact
  // diagram position; fresh navigations start at the top.
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
      <div className="ic-sans fixed inset-0 flex items-center justify-center bg-[#F7F6F2] text-[#6B6E66]" style={THEME}>
        <p className="ic-mono animate-pulse text-[12px] uppercase tracking-[0.2em]">
          Opening the network…
        </p>
      </div>
    );
  }

  return (
    <InterchangeContext.Provider value={state}>
      <div
        className="ic-sans fixed inset-0 flex flex-col bg-[var(--ic-paper)] text-[var(--ic-ink)] antialiased"
        style={THEME}
      >
        <SystemHeader />

        <div className="flex min-h-0 flex-1">
          {/* Desktop rail */}
          <aside className="hidden w-[300px] shrink-0 overflow-y-auto border-r border-[var(--ic-rule)] lg:block">
            <LineIndex variant="rail" />
          </aside>

          <main ref={mainRef} onScroll={handleMainScroll} className="min-h-0 flex-1 overflow-y-auto">
            <Routes>
              <Route index element={<HomeScreen />} />
              <Route path="line/:domain" element={<PlatformDiagram />} />
              <Route path="station/:stationId" element={<StationPage />} />
              <Route path="journeys" element={<JourneysScreen />} />
              <Route path="journey/:journeyId" element={<JourneyItinerary />} />
              <Route path="saved" element={<SavedScreen />} />
              <Route path="you" element={<YouScreen user={user} onSignIn={() => setAuthOpen(true)} />} />
              <Route path="*" element={<Navigate to={IC_BASE} replace />} />
            </Routes>
          </main>
        </div>

        <TabBar />

        <StationFinder open={finderOpen} onClose={() => setFinderOpen(false)} />

        <AuthModal
          open={authOpen || Boolean(authError)}
          onClose={() => {
            setAuthOpen(false);
            clearAuthError();
          }}
        />

        {syncError && (
          <div className="absolute bottom-20 left-1/2 z-[80] max-w-md -translate-x-1/2 rounded-lg border border-[#944B4B] bg-[var(--ic-card)] px-4 py-3 text-xs text-[var(--ic-ink2)] shadow-xl">
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
    </InterchangeContext.Provider>
  );
}
