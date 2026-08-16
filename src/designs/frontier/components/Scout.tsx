import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { useFrontier } from '../context';
import { FR_BASE, SCOUT_HINTS, domainName, scoutSkills, standingOf, standingWord } from '../expedition';
import { StandingMark } from './atoms';

/**
 * Scout — the small escape hatch to ANY skill by name, wherever it stands.
 * Deliberately not the hero: the frontier is how this design wants to be used.
 */
export default function Scout({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { completedIds } = useFrontier();
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const done = useMemo(() => new Set(completedIds), [completedIds]);
  const results = useMemo(() => scoutSkills(query), [query]);

  useEffect(() => {
    if (open) {
      // Reset + focus once the panel has mounted.
      const t = window.setTimeout(() => {
        setQuery('');
        inputRef.current?.focus();
      }, 30);
      return () => window.clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      // Keep Tab focus inside the dialog.
      if (e.key === 'Tab' && panelRef.current) {
        const focusables = panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])',
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;
        if (e.shiftKey && (active === first || !panelRef.current.contains(active))) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && (active === last || !panelRef.current.contains(active))) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const go = (skillId: string) => {
    onClose();
    navigate(`${FR_BASE}/skill/${skillId}`);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.15 }}
          className="fixed inset-0 z-[60] flex items-start justify-center bg-[#050812]/80 p-4 pt-[12vh] backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: -14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            ref={panelRef}
            className="w-full max-w-xl overflow-hidden rounded-lg border border-[var(--fr-line)] bg-[var(--fr-deep)] shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Scout — find any skill"
          >
            <form
              className="flex items-center gap-2.5 border-b border-[var(--fr-line)] px-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (results.length > 0) go(results[0].id);
              }}
            >
              <Search size={16} aria-hidden className="shrink-0 text-[var(--fr-dawn)]" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Scout any skill by name…"
                aria-label="Scout any skill by name"
                className="fr-body h-[52px] min-w-0 flex-1 bg-transparent text-[15px] text-[var(--fr-ink)] outline-none placeholder:text-[var(--fr-faint)]"
              />
              <button
                type="button"
                onClick={onClose}
                aria-label="Close scout"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-[var(--fr-faint)] hover:text-[var(--fr-ink)]"
              >
                <X size={16} aria-hidden />
              </button>
            </form>

            <div className="max-h-[52vh] overflow-y-auto p-2">
              {query.trim() === '' ? (
                <div className="px-2.5 py-3">
                  <p className="fr-mono text-[10px] uppercase tracking-[0.2em] text-[var(--fr-faint)]">
                    Anything on the map, wherever it stands. Try:
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {SCOUT_HINTS.map((hint) => (
                      <button
                        key={hint}
                        onClick={() => setQuery(hint)}
                        className="fr-body min-h-[36px] rounded-full border border-[var(--fr-line)] px-3 text-[12.5px] text-[var(--fr-dim)] transition-colors hover:border-[var(--fr-dawn)] hover:text-[var(--fr-ink)]"
                      >
                        {hint}
                      </button>
                    ))}
                  </div>
                </div>
              ) : results.length === 0 ? (
                <div className="px-2.5 py-3">
                  <p className="fr-body text-[13.5px] text-[var(--fr-dim)]">
                    Nothing on the map by that name.
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {SCOUT_HINTS.map((hint) => (
                      <button
                        key={hint}
                        onClick={() => setQuery(hint)}
                        className="fr-body min-h-[36px] rounded-full border border-[var(--fr-line)] px-3 text-[12.5px] text-[var(--fr-dim)] transition-colors hover:border-[var(--fr-dawn)] hover:text-[var(--fr-ink)]"
                      >
                        {hint}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                results.map((skill) => {
                  const standing = standingOf(skill, done);
                  return (
                    <button
                      key={skill.id}
                      onClick={() => go(skill.id)}
                      className="flex min-h-[52px] w-full items-center gap-3 rounded-md px-2.5 py-2 text-left transition-colors hover:bg-[var(--fr-card)]"
                    >
                      <StandingMark standing={standing} />
                      <span className="min-w-0 flex-1">
                        <span className="fr-body block truncate text-[14px] font-semibold text-[var(--fr-ink)]">
                          {skill.title}
                        </span>
                        <span className="fr-mono block truncate text-[9.5px] uppercase tracking-[0.14em] text-[var(--fr-faint)]">
                          {standingWord(standing)} · {domainName(skill.domain)} · {skill.estimatedMinutes}m
                        </span>
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
