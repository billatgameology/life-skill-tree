import { useState, useCallback } from 'react';
import StarfieldBackground from '@/components/StarfieldBackground';
import SkillTreeCanvas from '@/components/SkillTreeCanvas';
import Navbar from '@/components/Navbar';
import SkillDetailPanel from '@/components/SkillDetailPanel';
import ProfileModal from '@/components/ProfileModal';
import BadgesView from '@/components/BadgesView';
import CelebrationOverlay from '@/components/CelebrationOverlay';
import XPToast from '@/components/XPToast';
import { useUserData } from '@/hooks/useUserData';
import type { View, Skill } from '@/lib/types';

export default function App() {
  const { user, loaded, completeSkill } = useUserData();

  const [activeView, setActiveView] = useState<View>('home');
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const handleSelectSkill = useCallback((skill: Skill) => {
    setSelectedSkill(skill);
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

      {/* Main layout: tree canvas fills left, persistent panel on right */}
      <div className="flex w-full h-full relative z-[1]">
        {/* Tree canvas */}
        <div className="flex-1 h-full min-w-0">
          <SkillTreeCanvas
            completedIds={user?.completedSkillIds || []}
            onSelectSkill={handleSelectSkill}
            selectedSkillId={selectedSkill?.id || null}
          />
        </div>

        {/* Persistent skill detail panel */}
        <SkillDetailPanel
          skill={selectedSkill}
          completedIds={user?.completedSkillIds || []}
          onComplete={completeSkill}
          onShowCelebration={handleShowCelebration}
          onShowToast={handleShowToast}
        />
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

      {/* Navigation */}
      <Navbar activeView={activeView} onChange={handleNavChange} />
    </div>
  );
}
