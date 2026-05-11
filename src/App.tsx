import { useState, useCallback } from 'react';
import { PanelLeftOpen, PanelRightOpen } from 'lucide-react';
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
import { CATEGORY_KEYS } from '@/data/skills';
import type { View, Skill, DomainKey } from '@/lib/types';

type VizMode = 'mosaic' | 'trellis' | 'registry';

export default function App() {
  const { authError, clearAuthError, currentUser, signOutUser } = useAuth();
  const { user, loaded, syncError, completeSkill } = useUserData();

  const [activeView, setActiveView] = useState<View>('home');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [vizMode, setVizMode] = useState<VizMode>('mosaic');
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [selectedPathId, setSelectedPathId] = useState<string | null>(null);
  const [activeCategories, setActiveCategories] = useState<Set<DomainKey>>(new Set(CATEGORY_KEYS));
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const handleSelectSkill = useCallback((skill: Skill) => {
    setSelectedSkill(skill);
    setSelectedPathId(null);
  }, []);

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

  const handleNavChange = useCallback((view: View) => {
    setActiveView(view);
  }, []);

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
        {/* Left sidebar: filters + paths + nav */}
        {isSidebarOpen ? (
          <TreeSidebar
            activeCategories={activeCategories}
            onToggleCategory={handleToggleCategory}
            onShowAllCategories={handleShowAllCategories}
            selectedPathId={selectedPathId}
            onSelectPath={handleSelectPath}
            activeView={activeView}
            onChangeView={handleNavChange}
            authUser={currentUser}
            onOpenAuth={() => setIsAuthOpen(true)}
            onSignOut={signOutUser}
            vizMode={vizMode}
            onChangeVizMode={setVizMode}
            onCollapse={() => setIsSidebarOpen(false)}
          />
        ) : (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="absolute left-3 top-4 z-20 w-9 h-9 rounded-lg bg-surface-raised/85 border border-border flex items-center justify-center text-ink-muted hover:text-ink hover:bg-surface-high transition-colors"
            title="Show sidebar"
          >
            <PanelLeftOpen size={17} />
          </button>
        )}

        {/* Main visualization area */}
        <div className="flex-1 h-full min-w-0">
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
            <PathDetailPanel
              path={PATH_MAP[selectedPathId] || null}
              completedIds={user?.completedSkillIds || []}
              onSelectSkill={handleSelectSkill}
              onCollapse={() => setIsDetailPanelOpen(false)}
            />
          ) : (
            <SkillDetailPanel
              skill={selectedSkill}
              completedIds={user?.completedSkillIds || []}
              onComplete={handleCompleteSkill}
              onShowCelebration={handleShowCelebration}
              onShowToast={handleShowToast}
              onCollapse={() => setIsDetailPanelOpen(false)}
            />
          )
        ) : (
          <button
            onClick={() => setIsDetailPanelOpen(true)}
            className="absolute right-3 top-4 z-20 w-9 h-9 rounded-lg bg-surface-raised/85 border border-border flex items-center justify-center text-ink-muted hover:text-ink hover:bg-surface-high transition-colors"
            title="Show detail panel"
          >
            <PanelRightOpen size={17} />
          </button>
        )}
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
