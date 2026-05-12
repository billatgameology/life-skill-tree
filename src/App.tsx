import { useState, useCallback, useEffect } from 'react';
import { Award, Info, LogIn, LogOut, Menu, User, X } from 'lucide-react';
import StarfieldBackground from '@/components/StarfieldBackground';
import TrellisView from '@/components/TrellisView';
import MosaicView from '@/components/MosaicView';
import RegistryView from '@/components/RegistryView';
import TreeSidebar from '@/components/TreeSidebar';

import SkillDetailPanel from '@/components/SkillDetailPanel';
import PathDetailPanel from '@/components/PathDetailPanel';
import ProfileModal from '@/components/ProfileModal';
import BadgesView from '@/components/BadgesView';
import AuthModal from '@/components/AuthModal';
import CelebrationOverlay from '@/components/CelebrationOverlay';
import XPToast from '@/components/XPToast';
import { useAuth } from '@/hooks/useAuth';
import { useUserData } from '@/hooks/useUserData';
import { PATH_MAP } from '@/data/paths';
import { ALL_SKILLS, CATEGORY_KEYS } from '@/data/skills';
import type { View, Skill, DomainKey } from '@/lib/types';
import { useIsMobile } from '@/hooks/use-mobile';

type VizMode = 'mosaic' | 'trellis' | 'registry';

export default function App() {
  const { authError, clearAuthError, currentUser, signOutUser } = useAuth();
  const { user, loaded, syncError, completeSkill, toggleFavorite } = useUserData();
  const isMobile = useIsMobile();

  const [activeView, setActiveView] = useState<View>('home');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [vizMode, setVizMode] = useState<VizMode>('mosaic');
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [selectedPathId, setSelectedPathId] = useState<string | null>(null);
  const [activeCategories, setActiveCategories] = useState<Set<DomainKey>>(new Set(CATEGORY_KEYS));
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
      setIsDetailPanelOpen(false);
    }
  }, [isMobile]);

  const handleSelectSkill = useCallback((skill: Skill) => {
    setSelectedSkill(skill);
    setSelectedPathId(null);
    if (isMobile && !isSidebarOpen && !isDetailPanelOpen) {
      setIsDetailPanelOpen(true);
    }
  }, [isDetailPanelOpen, isMobile, isSidebarOpen]);

  const handleSelectPath = useCallback((pathId: string | null) => {
    setSelectedPathId(pathId);
    setSelectedSkill(null);
  }, []);

  const handleToggleCategory = useCallback((cat: DomainKey) => {
    setActiveCategories(prev =>
      prev.size === 1 && prev.has(cat) ? new Set(CATEGORY_KEYS) : new Set([cat])
    );
  }, []);

  const handleShowAllCategories = useCallback(() => {
    setActiveCategories(new Set(CATEGORY_KEYS));
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

  const handleCompleteSkill = useCallback((skillId: string, xp: number) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      handleShowToast('Sign in to save skill progress.');
      return false;
    }

    return completeSkill(skillId, xp);
  }, [completeSkill, currentUser, handleShowToast]);

  const favoriteSkills = (user?.favorite || [])
    .map((id) => ALL_SKILLS.find((skill) => skill.id === id))
    .filter(Boolean) as Skill[];
  const topChromeHeight = isMobile ? '3.5rem' : '4.5rem';
  const openSheetHeight = isMobile ? (isSidebarOpen ? '48dvh' : isDetailPanelOpen ? '50dvh' : '0px') : '0px';

  if (!loaded) {
    return (
      <div className="fixed inset-0 bg-void flex items-center justify-center">
        <div className="text-ink-muted font-display text-2xl animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex overflow-hidden bg-void">
      <StarfieldBackground />

      {/* Main layout: sidebar | tree canvas | detail panel */}
      <div className="flex w-full h-full relative z-[1]">
        <div className={`absolute left-1/2 -translate-x-1/2 z-[70] flex items-center rounded-xl border border-border bg-surface-raised/85 backdrop-blur ${isMobile ? 'top-2 gap-1.5 px-1.5 py-1' : 'top-3 gap-2 px-2 py-1.5'}`}>
          <button
            onClick={() => {
              setIsSidebarOpen((v) => {
                const next = !v;
                if (isMobile && next) setIsDetailPanelOpen(false);
                return next;
              });
            }}
            className={`${isMobile ? 'h-8 px-2.5 text-[11px]' : 'h-8 px-3 text-xs'} rounded-lg border border-border text-ink-muted hover:text-ink hover:bg-surface-high transition-colors flex items-center gap-1.5`}
            title="Toggle menu"
          >
            <Menu size={isMobile ? 13 : 14} />
            Menu
          </button>
          <button
            onClick={() => {
              setIsDetailPanelOpen((v) => {
                const next = !v;
                if (isMobile && next) setIsSidebarOpen(false);
                return next;
              });
            }}
            className={`${isMobile ? 'h-8 px-2.5 text-[11px]' : 'h-8 px-3 text-xs'} rounded-lg border border-border text-ink-muted hover:text-ink hover:bg-surface-high transition-colors flex items-center gap-1.5`}
            title="Toggle details"
          >
            <Info size={isMobile ? 13 : 14} />
            Details
          </button>
          <button
            onClick={() => setActiveView('profile')}
            className={`${currentUser ? 'h-8 max-w-[96px] px-2' : 'h-8 w-8'} rounded-lg border border-border text-ink-muted hover:text-ink hover:bg-surface-high transition-colors flex items-center justify-center gap-1.5`}
            title="Profile"
            aria-label="Profile"
          >
            <User size={isMobile ? 13 : 14} className={`flex-shrink-0 ${activeView === 'profile' ? 'text-glow-gold' : ''}`} />
            {currentUser && (
              <span className="min-w-0 truncate text-[10px] font-heading font-semibold">
                {currentUser.displayName || currentUser.email?.split('@')[0] || 'User'}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveView('badges')}
            className={`${isMobile ? 'h-8 w-8' : 'h-8 w-8'} rounded-lg border border-border text-ink-muted hover:text-ink hover:bg-surface-high transition-colors flex items-center justify-center`}
            title="Badges"
            aria-label="Badges"
          >
            <Award size={isMobile ? 13 : 14} className={activeView === 'badges' ? 'text-glow-gold' : ''} />
          </button>
          {currentUser ? (
            <button
              onClick={() => void signOutUser()}
              className="h-8 w-8 rounded-lg border border-border text-ink-muted hover:text-ink hover:bg-surface-high transition-colors flex items-center justify-center"
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut size={isMobile ? 13 : 14} />
            </button>
          ) : (
            <button
              onClick={() => setIsAuthOpen(true)}
              className="h-8 w-8 rounded-lg border border-glow-gold/40 bg-glow-gold/10 text-glow-gold hover:bg-glow-gold/15 transition-colors flex items-center justify-center"
              title="Sign in"
              aria-label="Sign in"
            >
              <LogIn size={isMobile ? 13 : 14} />
            </button>
          )}
        </div>

        {/* Left sidebar: filters + paths + nav */}
        {isSidebarOpen ? (
          <div className={isMobile ? 'absolute inset-x-0 top-14 h-[48dvh] z-40 rounded-b-2xl overflow-hidden border-b-2 border-glow-gold/35 shadow-[0_18px_34px_rgba(0,0,0,0.65)]' : 'absolute left-3 top-[4.75rem] h-[70dvh] z-40 rounded-2xl overflow-hidden shadow-2xl border border-border'}>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="absolute right-3 top-3 z-30 flex h-7 w-7 items-center justify-center rounded-md border border-border bg-surface-raised/90 text-ink-dim transition-colors hover:bg-surface-high hover:text-ink"
              title="Close menu"
              aria-label="Close menu"
            >
              <X size={15} />
            </button>
            <TreeSidebar
              activeCategories={activeCategories}
              onToggleCategory={handleToggleCategory}
              onShowAllCategories={handleShowAllCategories}
              selectedPathId={selectedPathId}
              onSelectPath={handleSelectPath}
              vizMode={vizMode}
              onChangeVizMode={setVizMode}
              favoriteSkills={favoriteSkills}
              onSelectFavoriteSkill={handleSelectSkill}
              isMobile={isMobile}
            />
          </div>
        ) : null}

        {/* Main visualization area */}
        <div
          className="flex-1 h-full min-w-0 transition-[padding] duration-200"
          style={{
            paddingTop: isMobile && (isSidebarOpen || isDetailPanelOpen)
              ? `calc(${topChromeHeight} + ${openSheetHeight})`
              : topChromeHeight,
          }}
        >
          {vizMode === 'mosaic' && (
            <MosaicView
              completedIds={user?.completedSkillIds || []}
              onSelectSkill={handleSelectSkill}
              selectedSkillId={selectedSkill?.id || null}
              activeCategories={activeCategories}
              selectedPathId={selectedPathId}
            />
          )}
          {vizMode === 'trellis' && (
            <TrellisView
              completedIds={user?.completedSkillIds || []}
              onSelectSkill={handleSelectSkill}
              selectedSkillId={selectedSkill?.id || null}
              activeCategories={activeCategories}
              selectedPathId={selectedPathId}
            />
          )}
          {vizMode === 'registry' && (
            <RegistryView
              completedIds={user?.completedSkillIds || []}
              onSelectSkill={handleSelectSkill}
              selectedSkillId={selectedSkill?.id || null}
              activeCategories={activeCategories}
            />
          )}
        </div>

        {/* Detail panel: skill or path */}
        {isDetailPanelOpen ? (
          selectedPathId ? (
            <div className={isMobile ? 'absolute inset-x-0 top-14 h-[50dvh] z-50 rounded-b-2xl overflow-hidden border-b-2 border-glow-gold/35 shadow-[0_18px_34px_rgba(0,0,0,0.65)]' : 'absolute right-3 top-[4.75rem] h-[70dvh] z-50 rounded-2xl overflow-hidden shadow-2xl border border-border'}>
              <button
                onClick={() => setIsDetailPanelOpen(false)}
                className="absolute right-3 top-3 z-30 flex h-7 w-7 items-center justify-center rounded-md border border-border bg-surface-raised/90 text-ink-dim transition-colors hover:bg-surface-high hover:text-ink"
                title="Close details"
                aria-label="Close details"
              >
                <X size={15} />
              </button>
              <PathDetailPanel
                path={PATH_MAP[selectedPathId] || null}
                completedIds={user?.completedSkillIds || []}
                onSelectSkill={handleSelectSkill}
                isMobile={isMobile}
              />
            </div>
          ) : (
            <div className={isMobile ? 'absolute inset-x-0 top-14 h-[50dvh] z-50 rounded-b-2xl overflow-hidden border-b-2 border-glow-gold/35 shadow-[0_18px_34px_rgba(0,0,0,0.65)]' : 'absolute right-3 top-[4.75rem] h-[70dvh] z-50 rounded-2xl overflow-hidden shadow-2xl border border-border'}>
              <button
                onClick={() => setIsDetailPanelOpen(false)}
                className="absolute right-3 top-3 z-30 flex h-7 w-7 items-center justify-center rounded-md border border-border bg-surface-raised/90 text-ink-dim transition-colors hover:bg-surface-high hover:text-ink"
                title="Close details"
                aria-label="Close details"
              >
                <X size={15} />
              </button>
              <SkillDetailPanel
                skill={selectedSkill}
                completedIds={user?.completedSkillIds || []}
                onComplete={handleCompleteSkill}
                onShowCelebration={handleShowCelebration}
                onShowToast={handleShowToast}
                favoriteIds={user?.favorite || []}
                onToggleFavorite={toggleFavorite}
                isMobile={isMobile}
              />
            </div>
          )
        ) : null}
      </div>

      {/* Profile modal */}
      <ProfileModal
        user={user}
        open={activeView === 'profile'}
        onClose={() => setActiveView('home')}
      />

      {/* Badges modal */}
      <BadgesView
        user={user}
        open={activeView === 'badges'}
        onClose={() => setActiveView('home')}
      />

      <AuthModal
        open={isAuthOpen || Boolean(authError)}
        onClose={() => {
          setIsAuthOpen(false);
          clearAuthError();
        }}
      />

      {syncError && (
        <div className="absolute bottom-4 left-1/2 z-[80] max-w-md -translate-x-1/2 rounded-lg border border-destructive/40 bg-surface px-4 py-3 text-xs text-ink-muted shadow-modal">
          Firestore sync failed: {syncError}
        </div>
      )}

      {/* Celebration overlay */}
      <CelebrationOverlay visible={showCelebration} />

      {/* XP Toast */}
      <XPToast
        message={toastMessage}
        visible={showToast}
        onDone={handleToastDone}
      />
    </div>
  );
}
