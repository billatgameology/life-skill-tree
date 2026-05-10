import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock } from 'lucide-react';
import type { UserData } from '@/lib/types';
import { CATEGORIES, CATEGORY_KEYS } from '@/data/skills';

interface BadgesViewProps {
  user: UserData | null;
  open: boolean;
  onClose: () => void;
}

export default function BadgesView({ user, open, onClose }: BadgesViewProps) {
  if (!open || !user) return null;

  const badgeList = CATEGORY_KEYS.map((cat) => {
    const catData = CATEGORIES[cat];
    const earned = user.badges.includes(cat);
    return {
      key: cat,
      name: catData.name,
      color: catData.color,
      image: `/badge-${cat}.png`,
      earned,
    };
  });

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

            <div className="pt-8 pb-6 px-6">
              <h2 className="font-display text-xl text-ink text-center mb-1">
                Badges
              </h2>
              <p className="text-sm text-ink-muted font-body text-center mb-6">
                Complete all skills in a category to earn a badge
              </p>

              <div className="grid grid-cols-2 gap-3">
                {badgeList.map((badge, i) => (
                  <motion.div
                    key={badge.key}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: i * 0.1, type: 'spring', stiffness: 300, damping: 25 }}
                    className={`relative flex flex-col items-center p-4 rounded-xl border transition-all ${
                      badge.earned
                        ? 'border-glow-gold/40 bg-glow-gold/5'
                        : 'border-border bg-surface-raised'
                    }`}
                  >
                    {!badge.earned && (
                      <div className="absolute inset-0 flex items-center justify-center z-10 rounded-xl bg-surface/60">
                        <Lock size={20} className="text-ink-dim" />
                      </div>
                    )}
                    <img
                      src={badge.image}
                      alt={badge.name}
                      className={`w-20 h-20 object-contain ${badge.earned ? '' : 'grayscale opacity-30'}`}
                    />
                    <p className="text-xs font-heading font-bold text-ink mt-2 text-center">
                      {badge.name}
                    </p>
                    {badge.earned && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.1 + 0.2, type: 'spring', stiffness: 500, damping: 15 }}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-glow-green rounded-full flex items-center justify-center text-void text-xs font-bold shadow-node-completed"
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
