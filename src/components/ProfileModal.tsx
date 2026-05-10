import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Award, Zap, TrendingUp } from 'lucide-react';
import type { UserData } from '@/lib/types';
import { CATEGORIES, CATEGORY_KEYS, ALL_SKILLS } from '@/data/skills';

interface ProfileModalProps {
  user: UserData | null;
  open: boolean;
  onClose: () => void;
}

const LEVELS = [
  { level: 1, min: 0,   max: 30,  title: 'Seedling' },
  { level: 2, min: 30,  max: 75,  title: 'Sprout' },
  { level: 3, min: 75,  max: 135, title: 'Explorer' },
  { level: 4, min: 135, max: 210, title: 'Adventurer' },
  { level: 5, min: 210, max: 300, title: 'Champion' },
  { level: 6, min: 300, max: 999, title: 'Master' },
];

function getLevelInfo(xp: number) {
  return LEVELS.find((l) => xp >= l.min && xp < l.max) || LEVELS[LEVELS.length - 1];
}

export default function ProfileModal({ user, open, onClose }: ProfileModalProps) {
  if (!open || !user) return null;

  const level = getLevelInfo(user.xp);
  const progress = ((user.xp - level.min) / (level.max - level.min)) * 100;
  const completedCount = user.completedSkillIds.length;

  // Calculate per-category completion counts
  const categoryStats = useMemo(() => {
    return CATEGORY_KEYS.map((cat) => {
      const catSkills = ALL_SKILLS.filter(s => s.domain === cat && s.id !== 'root');
      const completed = catSkills.filter(s => user.completedSkillIds.includes(s.id)).length;
      return { cat, catData: CATEGORIES[cat], completed, total: catSkills.length };
    });
  }, [user.completedSkillIds]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-void/60 backdrop-blur-sm" />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-surface rounded-2xl shadow-modal overflow-hidden max-h-[85vh] overflow-y-auto border border-border"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center rounded-lg bg-surface-high border border-border hover:bg-surface-raised transition-colors cursor-pointer"
            >
              <X size={16} className="text-ink-muted" />
            </button>

            {/* Title */}
            <div className="pt-8 pb-4 px-6 text-center">
              <h2 className="font-display text-xl text-ink">
                Your Progress
              </h2>
              <p className="text-ink-muted font-body text-sm mt-1">
                Level {level.level} &middot; {level.title}
              </p>

              {/* XP bar */}
              <div className="mt-4 mx-auto max-w-[280px]">
                <div className="h-2.5 bg-surface-raised rounded-full overflow-hidden border border-border">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-glow-gold to-glow-gold/60"
                  />
                </div>
                <p className="text-[10px] text-ink-dim font-heading font-semibold mt-1">
                  {user.xp} / {level.max} XP
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="px-6 pb-4">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: Zap, label: 'Total XP', value: user.xp, color: 'text-glow-gold', bg: 'bg-glow-gold/10' },
                  { icon: Star, label: 'Skills Done', value: completedCount, color: 'text-glow-green', bg: 'bg-glow-green/10' },
                  { icon: TrendingUp, label: 'Level', value: level.level, color: 'text-ink', bg: 'bg-surface-high' },
                ].map((stat) => (
                  <div key={stat.label} className="text-center p-3 rounded-xl bg-surface-raised border border-border">
                    <div className={`w-8 h-8 mx-auto rounded-full ${stat.bg} flex items-center justify-center mb-1`}>
                      <stat.icon size={16} className={stat.color} />
                    </div>
                    <p className="font-display text-lg text-ink">{stat.value}</p>
                    <p className="text-[10px] text-ink-dim font-heading font-semibold uppercase tracking-wider">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Category progress */}
            <div className="px-6 pb-6">
              <h3 className="font-heading font-bold text-ink text-xs mb-3 flex items-center gap-2 uppercase tracking-wider">
                <Award size={14} className="text-glow-gold" />
                Category Progress
              </h3>
              <div className="space-y-2">
                {categoryStats.map(({ cat, catData, completed, total }) => (
                  <div key={cat} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full flex-shrink-0 border" style={{ borderColor: catData.color, backgroundColor: `${catData.color}20` }} />
                    <span className="text-xs font-heading text-ink-muted w-28 flex-shrink-0 truncate">{catData.name}</span>
                    <div className="flex-1 h-2 bg-surface-raised rounded-full overflow-hidden border border-border">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%`, backgroundColor: catData.color }}
                      />
                    </div>
                    <span className="text-[10px] font-heading text-ink-dim w-8 text-right">{completed}/{total}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
