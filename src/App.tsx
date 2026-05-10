import { useState, useCallback } from 'react';
import StarfieldBackground from '@/components/StarfieldBackground';
import SkillTreeCanvas from '@/components/SkillTreeCanvas';
import TreeSidebar from '@/components/TreeSidebar';

import SkillDetailPanel from '@/components/SkillDetailPanel';
import PathDetailPanel from '@/components/PathDetailPanel';
import ProfileModal from '@/components/ProfileModal';
import BadgesView from '@/components/BadgesView';
import CelebrationOverlay from '@/components/CelebrationOverlay';
import XPToast from '@/components/XPToast';
import { useUserData } from '@/hooks/useUserData';
import { PATH_MAP } from '@/data/paths';
import { CATEGORY_KEYS } from '@/data/skills';
import type { View, Skill, DomainKey } from '@/lib/types';

export default function App() {
  const { user, loaded, completeSkill } = useUserData();

  const [activeView, setActiveView] = useState<View>('home');
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [selectedPathId, setSelectedPathId] = useState<string | null>(null);
  const [activeCategories, setActiveCategories] = useState<Set<DomainKey>>(new Set(CATEGORY_KEYS));
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
    setActiveCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) { if (next.size > 1) next.delete(cat); }
      else next.add(cat);
      return next;
    });
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
        <TreeSidebar
          activeCategories={activeCategories}
          onToggleCategory={handleToggleCategory}
          selectedPathId={selectedPathId}
          onSelectPath={handleSelectPath}
          activeView={activeView}
          onChangeView={handleNavChange}
        />

        {/* Tree canvas */}
        <div className="flex-1 h-full min-w-0">
          <SkillTreeCanvas
            completedIds={user?.completedSkillIds || []}
            onSelectSkill={handleSelectSkill}
            selectedSkillId={selectedSkill?.id || null}
            selectedPathId={selectedPathId}
            activeCategories={activeCategories}
          />
        </div>

        {/* Detail panel: skill or path */}
        {selectedPathId ? (
          <PathDetailPanel
            path={PATH_MAP[selectedPathId] || null}
            completedIds={user?.completedSkillIds || []}
            onSelectSkill={handleSelectSkill}
          />
        ) : (
          <SkillDetailPanel
            skill={selectedSkill}
            completedIds={user?.completedSkillIds || []}
            onComplete={completeSkill}
            onShowCelebration={handleShowCelebration}
            onShowToast={handleShowToast}
          />
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
