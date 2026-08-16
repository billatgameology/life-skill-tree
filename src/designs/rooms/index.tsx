import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import type { CSSProperties } from 'react';
import AuthModal from '@/components/AuthModal';
import Toast from '@/components/Toast';
import { useAuth } from '@/hooks/useAuth';
import { useUserData } from '@/hooks/useUserData';
import { RoomsContext, type RoomsState } from './context';
import { RM_BASE } from './places';
import DwellingPage from './components/DwellingPage';
import HouseHeader from './components/HouseHeader';
import RoomPage from './components/RoomPage';
import SearchOverlay from './components/SearchOverlay';
import SkillPage from './components/SkillPage';
import './rooms.css';

/** Rooms' scoped palette — a home at dusk: deep teal night, lamp amber, warm cream. */
const THEME: CSSProperties = {
  '--rm-night': '#1B2C31',
  '--rm-deep': '#152327',
  '--rm-wall': '#24383E',
  '--rm-card': '#2B4249',
  '--rm-rule': '#3B565C',
  '--rm-ink': '#F4E8D6',
  '--rm-muted': '#AEC3BE',
  '--rm-amber': '#F0B860',
  '--rm-amber-dim': 'rgba(240, 184, 96, 0.55)',
  '--rm-terra': '#E08A6D',
  '--rm-rose': '#D9A0A8',
} as CSSProperties;

/**
 * Design #13 — "Rooms". The skill library arranged by WHERE in life each
 * skill happens: a dwelling at dusk whose rooms (and the street, the shops,
 * your phone) cross-cut the domain taxonomy. Finishing a skill turns on
 * another light in the house.
 */
export default function RoomsApp() {
  const { authError, clearAuthError, currentUser } = useAuth();
  const { user, loaded, syncError, completeSkill, toggleFavorite, completionDates } = useUserData();
  const location = useLocation();

  const [searchOpen, setSearchOpen] = useState(false);
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

  const markDone = useCallback(
    (skillId: string) => {
      if (!requireAuth('Sign in to save your progress — the lights stay on.')) return false;
      return completeSkill(skillId);
    },
    [completeSkill, requireAuth],
  );

  const togglePin = useCallback(
    (skillId: string) => {
      if (!requireAuth('Sign in to pin skills to the corkboard.')) return false;
      return toggleFavorite(skillId);
    },
    [requireAuth, toggleFavorite],
  );

  const state = useMemo<RoomsState>(
    () => ({
      completedIds: user?.completedSkillIds ?? [],
      favoriteIds: user?.favorite ?? [],
      completionDates,
      markDone,
      togglePin,
      openSearch: () => setSearchOpen(true),
      celebrate: showToast,
    }),
    [user, completionDates, markDone, togglePin, showToast],
  );

  // "/" opens search (unless typing in a field).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return;
      e.preventDefault();
      setSearchOpen(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Per-location scroll restoration: back from a skill lands exactly where
  // you were in the room; fresh navigations start at the top.
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
        className="rm-body rm-root fixed inset-0 flex items-center justify-center bg-[#1B2C31] text-[#AEC3BE]"
        style={THEME}
      >
        <p className="animate-pulse text-[12px] uppercase tracking-[0.2em]">Turning on the lights…</p>
      </div>
    );
  }

  return (
    <RoomsContext.Provider value={state}>
      <div
        className="rm-body rm-root fixed inset-0 flex flex-col bg-[var(--rm-night)] text-[var(--rm-ink)] antialiased"
        style={THEME}
      >
        <HouseHeader />

        <main ref={mainRef} onScroll={handleMainScroll} className="min-h-0 flex-1 overflow-y-auto">
          <Routes>
            <Route index element={<DwellingPage />} />
            <Route path="room/:placeId" element={<RoomPage />} />
            <Route path="skill/:skillId" element={<SkillPage />} />
            <Route path="*" element={<Navigate to={RM_BASE} replace />} />
          </Routes>
        </main>

        <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />

        <AuthModal
          open={authOpen || Boolean(authError)}
          onClose={() => {
            setAuthOpen(false);
            clearAuthError();
          }}
        />

        {syncError && (
          <div className="absolute bottom-6 left-1/2 z-[80] max-w-md -translate-x-1/2 rounded-lg border border-[var(--rm-terra)] bg-[var(--rm-card)] px-4 py-3 text-xs text-[var(--rm-muted)] shadow-xl">
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
    </RoomsContext.Provider>
  );
}
