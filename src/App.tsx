import { useState, useCallback, useRef } from 'react';
import { X } from 'lucide-react';
import StarfieldBackground from '@/components/StarfieldBackground';
import BottomTabBar from '@/components/BottomTabBar';
import SkillsScreen, { type SkillsViewMode } from '@/components/screens/SkillsScreen';
import PathsScreen from '@/components/screens/PathsScreen';
import SavedScreen from '@/components/screens/SavedScreen';
import ProfileScreen from '@/components/screens/ProfileScreen';
import SkillDetailPanel from '@/components/SkillDetailPanel';
import SettingsSheet from '@/components/SettingsSheet';
import BadgesView from '@/components/BadgesView';
import AuthModal from '@/components/AuthModal';
import CelebrationOverlay from '@/components/CelebrationOverlay';
import Toast from '@/components/Toast';
import { useAuth } from '@/hooks/useAuth';
import { useUserData } from '@/hooks/useUserData';
import { CATEGORY_KEYS } from '@/data/skills';
import type { TabId, Skill } from '@/lib/types';
import { useIsMobile } from '@/hooks/use-mobile';

// All skills are always shown — the category filter UI was removed.
const ALL_CATEGORIES = new Set(CATEGORY_KEYS);

export default function App() {
  const { authError, clearAuthError, currentUser, signOutUser } = useAuth();
  const { user, loaded, syncError, completeSkill, toggleFavorite } = useUserData();
  const isMobile = useIsMobile();

  const [activeTab, setActiveTab] = useState<TabId>('skills');
  const [skillsView, setSkillsView] = useState<SkillsViewMode>('map');
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [selectedPathId, setSelectedPathId] = useState<string | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isBadgesOpen, setIsBadgesOpen] = useState(false);
  const [mobileSheetH, setMobileSheetH] = useState(0);
  const [sheetDragging, setSheetDragging] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const sheetStartYRef = useRef(0);
  const sheetStartHRef = useRef(0);

  const getSheetBounds = useCallback(() => {
    const h = typeof window !== 'undefined' ? window.innerHeight : 800;
    return {
      min: Math.round(h * 0.3),
      collapsed: Math.round(h * 0.56),
      max: Math.round(h * 0.9),
    };
  }, []);

  const completedIds = user?.completedSkillIds || [];
  const favoriteIds = user?.favorite || [];

  const handleChangeTab = useCallback((tab: TabId) => {
    // Re-tapping the active tab closes it back to the Skills map
    // (Skills is the base view, so tapping it again is a no-op).
    setActiveTab((prev) => (prev === tab && tab !== 'skills' ? 'skills' : tab));
    setSelectedSkill(null);
  }, []);

  // Dismiss the Path/Saved/Profile panel back to the Skills map.
  const handleCloseScreen = useCallback(() => {
    setActiveTab('skills');
  }, []);

  const handleSelectSkill = useCallback((skill: Skill) => {
    setSelectedSkill(skill);
    if (isMobile) setMobileSheetH(getSheetBounds().collapsed);
  }, [isMobile, getSheetBounds]);

  const handleCloseDetail = useCallback(() => {
    setSelectedSkill(null);
  }, []);

  const handleShowPathOnMap = useCallback((pathId: string) => {
    setSelectedPathId((prev) => (prev === pathId ? null : pathId));
    setActiveTab('skills');
    setSkillsView('map');
    setSelectedSkill(null);
  }, []);

  const handleShowCelebration = useCallback(() => {
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 2500);
  }, []);

  const handleShowToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
  }, []);

  const handleToastDone = useCallback(() => {
    setShowToast(false);
    setToastMessage('');
  }, []);

  const handleCompleteSkill = useCallback((skillId: string) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      handleShowToast('Sign in to save skill progress.');
      return false;
    }
    return completeSkill(skillId);
  }, [completeSkill, currentUser, handleShowToast]);

  const handleSheetPointerDown = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    sheetStartYRef.current = e.clientY;
    sheetStartHRef.current = mobileSheetH || getSheetBounds().collapsed;
    setSheetDragging(true);
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* ignore */ }
  }, [mobileSheetH, getSheetBounds]);

  const handleSheetPointerMove = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    if (!sheetDragging) return;
    const { min, max } = getSheetBounds();
    const dy = e.clientY - sheetStartYRef.current;
    setMobileSheetH(Math.max(min, Math.min(max, sheetStartHRef.current - dy)));
  }, [sheetDragging, getSheetBounds]);

  const handleSheetPointerUp = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    setSheetDragging(false);
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch { /* ignore */ }
    const { min, collapsed, max } = getSheetBounds();
    const dy = e.clientY - sheetStartYRef.current;
    const mid = (collapsed + max) / 2;

    // No real movement → treat as a tap that toggles collapsed/expanded.
    if (Math.abs(dy) <= 6) {
      setMobileSheetH(mobileSheetH > mid ? collapsed : max);
      return;
    }
    // Dragged down near the floor → dismiss.
    if (mobileSheetH <= min + 28 && dy > 0) {
      handleCloseDetail();
      return;
    }
    // Otherwise snap to the nearer detent.
    setMobileSheetH(mobileSheetH > mid ? max : collapsed);
  }, [getSheetBounds, handleCloseDetail, mobileSheetH]);

  if (!loaded) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-void">
        <div className="animate-pulse font-display text-2xl text-ink-muted">Loading...</div>
      </div>
    );
  }

  const { collapsed: sheetCollapsedH, max: sheetMaxH } = getSheetBounds();
  const sheetExpanded = mobileSheetH > (sheetCollapsedH + sheetMaxH) / 2;
  const detailPanelClass = isMobile
    ? `absolute inset-x-0 bottom-0 z-[70] rounded-t-2xl overflow-hidden border-t-2 border-glow-gold/35 shadow-[0_-18px_34px_rgba(0,0,0,0.65)] ${sheetDragging ? '' : 'transition-[height] duration-200'}`
    : 'absolute right-3 top-3 bottom-[72px] w-[420px] max-w-[40vw] z-[55] rounded-2xl overflow-hidden shadow-2xl border border-border';

  return (
    <div className="fixed inset-0 overflow-hidden bg-void">
      <StarfieldBackground />

      {/* Skills map — base layer. Stays mounted on desktop so the
          Path/Saved/Profile panel can float over it. */}
      {(!isMobile || activeTab === 'skills') && (
        <div className="absolute inset-0 z-[1]">
          <SkillsScreen
            skillsView={skillsView}
            onChangeSkillsView={setSkillsView}
            completedIds={completedIds}
            favoriteIds={favoriteIds}
            onSelectSkill={handleSelectSkill}
            selectedSkillId={selectedSkill?.id || null}
            activeCategories={ALL_CATEGORIES}
            selectedPathId={selectedPathId}
          />
        </div>
      )}

      {/* Path / Saved / Profile.
          Desktop: a dismissible panel docked to the left, over the map.
          Mobile: a full-screen view. */}
      {activeTab !== 'skills' && (
        <div
          className={
            isMobile
              ? 'absolute inset-0 z-[1]'
              : 'absolute left-3 top-3 bottom-[72px] w-[420px] max-w-[40vw] z-[55] rounded-2xl overflow-hidden border border-border bg-surface shadow-2xl'
          }
        >
          {!isMobile && (
            <button
              onClick={handleCloseScreen}
              className="absolute right-3 top-3 z-30 flex h-7 w-7 items-center justify-center rounded-md border border-border bg-surface-raised/90 text-ink-dim transition-colors hover:text-ink"
              title="Close"
              aria-label="Close"
            >
              <X size={15} />
            </button>
          )}
          {activeTab === 'paths' && (
            <PathsScreen
              completedIds={completedIds}
              activePathId={selectedPathId}
              onShowOnMap={handleShowPathOnMap}
              onSelectSkill={handleSelectSkill}
              isMobile={isMobile}
            />
          )}
          {activeTab === 'saved' && (
            <SavedScreen
              favoriteIds={favoriteIds}
              completedIds={completedIds}
              onSelectSkill={handleSelectSkill}
              onBrowseSkills={() => handleChangeTab('skills')}
            />
          )}
          {activeTab === 'profile' && (
            <ProfileScreen
              user={user}
              currentUser={currentUser}
              completedIds={completedIds}
              favoriteIds={favoriteIds}
              onSignIn={() => setIsAuthOpen(true)}
              onSignOut={() => void signOutUser()}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onOpenBadges={() => setIsBadgesOpen(true)}
            />
          )}
        </div>
      )}

      {/* Skill detail (right panel on desktop, bottom sheet on mobile) */}
      {selectedSkill && (
        <div
          className={detailPanelClass}
          style={isMobile ? { height: mobileSheetH || sheetCollapsedH } : undefined}
        >
          {isMobile && (
            <button
              onPointerDown={handleSheetPointerDown}
              onPointerMove={handleSheetPointerMove}
              onPointerUp={handleSheetPointerUp}
              onPointerCancel={handleSheetPointerUp}
              className="absolute left-1/2 top-0 z-40 flex h-9 w-24 -translate-x-1/2 cursor-grab touch-none items-center justify-center active:cursor-grabbing"
              title={sheetExpanded ? 'Collapse details' : 'Expand details'}
              aria-label={sheetExpanded ? 'Collapse details' : 'Expand details'}
            >
              <span className="block h-1.5 w-11 rounded-full bg-ink-dim/60" />
            </button>
          )}
          <button
            onClick={handleCloseDetail}
            className="absolute right-3 top-3 z-30 flex h-7 w-7 items-center justify-center rounded-md border border-border bg-surface-raised/90 text-ink-dim transition-colors hover:text-ink"
            title="Close details"
            aria-label="Close details"
          >
            <X size={15} />
          </button>
          <SkillDetailPanel
            skill={selectedSkill}
            completedIds={completedIds}
            onComplete={handleCompleteSkill}
            onShowCelebration={handleShowCelebration}
            onShowToast={handleShowToast}
            favoriteIds={favoriteIds}
            onToggleFavorite={toggleFavorite}
            isMobile={isMobile}
          />
        </div>
      )}

      <BottomTabBar
        active={activeTab}
        onChange={handleChangeTab}
        savedCount={favoriteIds.length}
      />

      <SettingsSheet
        open={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentUser={currentUser}
        onSignIn={() => setIsAuthOpen(true)}
        onSignOut={() => void signOutUser()}
      />

      <BadgesView
        user={user}
        open={isBadgesOpen}
        onClose={() => setIsBadgesOpen(false)}
      />

      <AuthModal
        open={isAuthOpen || Boolean(authError)}
        onClose={() => {
          setIsAuthOpen(false);
          clearAuthError();
        }}
      />

      {syncError && (
        <div className="absolute bottom-20 left-1/2 z-[80] max-w-md -translate-x-1/2 rounded-lg border border-destructive/40 bg-surface px-4 py-3 text-xs text-ink-muted shadow-modal">
          Firestore sync failed: {syncError}
        </div>
      )}

      <CelebrationOverlay visible={showCelebration} />
      <Toast message={toastMessage} visible={showToast} onDone={handleToastDone} />
    </div>
  );
}
