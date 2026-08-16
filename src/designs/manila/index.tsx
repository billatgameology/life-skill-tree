import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom';
import type { CSSProperties } from 'react';
import AuthModal from '@/components/AuthModal';
import Toast from '@/components/Toast';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { useUserData } from '@/hooks/useUserData';
import { ManilaContext, type ManilaState } from './context';
import { CARDS, MA_BASE } from './derive';
import CabinetPage from './components/CabinetPage';
import DrawerPage from './components/DrawerPage';
import MyDossierPage from './components/MyDossierPage';
import { DossierPage, DossiersPage } from './components/DossiersPage';
import { LookupOverlay, LookupScreen } from './components/Lookup';
import { MobileTabBar, TopRail } from './components/chrome';

/** Manila's scoped palette — walnut reading room, cream cards, stamp-pad red. */
const THEME: CSSProperties = {
  '--ma-walnut': '#2A211B',
  '--ma-wood': '#3E2F23',
  '--ma-brass': '#C9A45C',
  '--ma-manila': '#F3E5BF',
  '--ma-card': '#F9F2E0',
  '--ma-rule': '#A9BFCB',
  '--ma-redrule': '#C46A5A',
  '--ma-stamp': '#B3472F',
  '--ma-ink': '#2E2A26',
  '--ma-graphite': '#6E655B',
} as CSSProperties;

/** Bare /card/:skillId deep links resolve into the owning drawer's route. */
function CardRedirect() {
  const { skillId } = useParams();
  const info = skillId ? CARDS[skillId] : undefined;
  if (!info) return <Navigate to={MA_BASE} replace />;
  return <Navigate to={`${MA_BASE}/drawer/${info.drawer.domain}/card/${info.skill.id}`} replace />;
}

/**
 * Design #3 — "Manila". The skill library as a mid-century card catalog:
 * drawers (domains), typed index cards (skills), dossiers (paths), and a
 * red FILED date stamp for every completion.
 */
export default function ManilaApp() {
  const { authError, clearAuthError, currentUser } = useAuth();
  const { user, loaded, syncError, completeSkill, toggleFavorite, completionDates } = useUserData();
  const location = useLocation();

  const [lookupOpen, setLookupOpen] = useState(false);
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

  const fileCard = useCallback(
    (skillId: string) => {
      if (!requireAuth('Sign in to file cards — your progress is saved to your account.')) return false;
      return completeSkill(skillId);
    },
    [completeSkill, requireAuth],
  );

  const toggleClip = useCallback(
    (skillId: string) => {
      if (!requireAuth('Sign in to clip cards.')) return false;
      return toggleFavorite(skillId);
    },
    [toggleFavorite, requireAuth],
  );

  const state = useMemo<ManilaState>(
    () => ({
      completedIds: user?.completedSkillIds ?? [],
      favoriteIds: user?.favorite ?? [],
      completionDates,
      fileCard,
      toggleClip,
      openLookup: () => setLookupOpen(true),
    }),
    [user, completionDates, fileCard, toggleClip],
  );

  // "/" opens Lookup (unless typing in a field).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return;
      e.preventDefault();
      setLookupOpen(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Scroll restoration by SCOPE, not location.key: on desktop the drawer +
  // its card routes share one scope, so swapping cards in the blotter keeps
  // the riffle's scroll position, while the mobile back-to-drawer link
  // restores the riffle instead of resetting to the top.
  const isMobile = useIsMobile();
  const drawerMatch = location.pathname.match(/^\/manila\/drawer\/[^/]+/);
  const scrollScope = drawerMatch && !isMobile ? drawerMatch[0] : location.pathname;

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
      <div className="ma-chrome fixed inset-0 flex items-center justify-center bg-[#2A211B] text-[#C9A45C]" style={THEME}>
        <p className="ma-type animate-pulse text-[12px] uppercase tracking-[0.2em]">
          Opening the cabinet…
        </p>
      </div>
    );
  }

  return (
    <ManilaContext.Provider value={state}>
      <div
        className="ma-chrome fixed inset-0 flex flex-col bg-[var(--ma-walnut)] antialiased"
        style={THEME}
      >
        <TopRail />

        <main ref={mainRef} onScroll={handleMainScroll} className="min-h-0 flex-1 overflow-y-auto">
          <Routes>
            <Route index element={<CabinetPage />} />
            <Route path="drawer/:domain" element={<DrawerPage />} />
            <Route path="drawer/:domain/card/:skillId" element={<DrawerPage />} />
            <Route path="card/:skillId" element={<CardRedirect />} />
            <Route path="dossiers" element={<DossiersPage />} />
            <Route path="dossiers/:dossierId" element={<DossierPage />} />
            <Route path="lookup" element={<LookupScreen />} />
            <Route path="desk" element={<MyDossierPage user={user} onSignIn={() => setAuthOpen(true)} />} />
            <Route path="*" element={<Navigate to={MA_BASE} replace />} />
          </Routes>
        </main>

        <MobileTabBar />

        <LookupOverlay open={lookupOpen} onClose={() => setLookupOpen(false)} />

        <AuthModal
          open={authOpen || Boolean(authError)}
          onClose={() => {
            setAuthOpen(false);
            clearAuthError();
          }}
        />

        {syncError && (
          <div className="absolute bottom-20 left-1/2 z-[80] max-w-md -translate-x-1/2 rounded border border-[var(--ma-redrule)] bg-[var(--ma-card)] px-4 py-3 text-xs text-[var(--ma-graphite)] shadow-xl">
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
    </ManilaContext.Provider>
  );
}
