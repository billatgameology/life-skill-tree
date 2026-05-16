import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Check } from 'lucide-react';
import type { User as FirebaseUser } from 'firebase/auth';
import { useTheme } from '@/hooks/useTheme';
import type { ThemeId } from '@/context/theme';

interface SettingsSheetProps {
  open: boolean;
  onClose: () => void;
  currentUser: FirebaseUser | null;
  onSignIn: () => void;
  onSignOut: () => void;
}

function Toggle({ initial }: { initial: boolean }) {
  const [on, setOn] = useState(initial);
  return (
    <button
      onClick={() => setOn((v) => !v)}
      className="relative h-6 w-11 flex-shrink-0 rounded-full transition-colors"
      style={{ backgroundColor: on ? 'rgb(var(--accent-rgb))' : 'rgba(255,255,255,0.12)' }}
      role="switch"
      aria-checked={on}
    >
      <span
        className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all"
        style={{ left: on ? '22px' : '2px' }}
      />
    </button>
  );
}

export default function SettingsSheet({
  open,
  onClose,
  currentUser,
  onSignIn,
  onSignOut,
}: SettingsSheetProps) {
  const { theme, themes, setThemeId } = useTheme();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 z-[80] flex flex-col justify-end bg-void/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '40%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
            className="detail-scrollbar max-h-[88%] overflow-y-auto rounded-t-2xl border-t border-border bg-surface pb-8"
          >
            <div className="flex justify-center pb-1 pt-2.5">
              <span className="h-1 w-10 rounded-full bg-ink-dim/40" />
            </div>
            <div className="flex items-center justify-between px-5 pb-3 pt-1">
              <h2 className="font-display text-lg text-ink">Settings</h2>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface-raised text-ink-dim transition-colors hover:text-ink"
                aria-label="Close settings"
              >
                <X size={15} />
              </button>
            </div>

            {/* Appearance */}
            <section className="px-5 pb-5">
              <p className="mb-2 text-[10px] font-heading font-bold uppercase tracking-wider text-ink-dim">
                Appearance
              </p>
              <p className="mb-3 text-xs text-ink-muted">
                Accent color used for progress, highlights, and selected items.
              </p>
              <div className="grid grid-cols-4 gap-2">
                {themes.map((t) => {
                  const isActive = t.id === theme.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setThemeId(t.id as ThemeId)}
                      className="flex flex-col items-center gap-2 rounded-xl border p-2.5 transition-colors"
                      style={{
                        backgroundColor: isActive ? `${t.accent}1f` : 'rgba(255,255,255,0.025)',
                        borderColor: isActive ? t.accent : '#2A2A3A',
                      }}
                    >
                      <span
                        className="flex h-8 w-8 items-center justify-center rounded-full"
                        style={{ background: `linear-gradient(135deg, ${t.accent}, ${t.accent2})` }}
                      >
                        {isActive && <Check size={14} strokeWidth={3} className="text-void" />}
                      </span>
                      <span className="text-[10px] font-heading font-semibold text-ink">{t.name}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Notifications (local-only placeholders) */}
            <section className="px-5 pb-5">
              <p className="mb-2.5 text-[10px] font-heading font-bold uppercase tracking-wider text-ink-dim">
                Notifications
              </p>
              {[
                { label: 'Daily reminder', sub: 'A nudge at the time you choose', on: true },
                { label: 'Path progress', sub: 'When you complete a path skill', on: true },
                { label: 'Streak reminders', sub: "Don't break the chain", on: false },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center gap-3 border-b border-border/60 py-3 last:border-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-heading font-semibold text-ink">{row.label}</p>
                    <p className="text-xs text-ink-muted">{row.sub}</p>
                  </div>
                  <Toggle initial={row.on} />
                </div>
              ))}
            </section>

            {/* Account */}
            <section className="px-5 pb-2">
              <p className="mb-2.5 text-[10px] font-heading font-bold uppercase tracking-wider text-ink-dim">
                Account
              </p>
              {currentUser ? (
                <>
                  <div className="border-b border-border/60 py-2">
                    <p className="text-sm font-heading font-semibold text-ink">
                      {currentUser.displayName || currentUser.email?.split('@')[0]}
                    </p>
                    <p className="text-xs text-ink-muted">{currentUser.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onSignOut();
                    }}
                    className="mt-3 w-full rounded-xl border border-destructive/40 bg-destructive/10 py-2.5 font-heading text-sm font-bold text-destructive transition-colors hover:bg-destructive/20"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    onClose();
                    onSignIn();
                  }}
                  className="w-full rounded-xl bg-glow-gold py-2.5 font-heading text-sm font-bold text-void transition-all hover:brightness-110"
                >
                  Sign in or create account
                </button>
              )}
            </section>

            <p className="px-5 pt-4 text-center text-[11px] text-ink-dim">Life Skill Atlas · v1.0</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
