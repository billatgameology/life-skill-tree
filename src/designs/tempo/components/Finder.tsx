import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { useTempo } from '../context';
import { TP_BASE, searchSkills } from '../time';
import { DomainChip, LoggedCheck } from './bits';

/** The escape hatch: reach any of the 233 skills by name, regardless of budget. */
export default function Finder({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const { completedIds } = useTempo();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => searchSkills(query), [query]);

  // All close paths run through this so the query is fresh next time.
  const close = useCallback(() => {
    setQuery('');
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close]);

  if (!open) return null;

  const go = (skillId: string) => {
    close();
    navigate(`${TP_BASE}/skill/${skillId}`);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center p-3 pt-16 sm:pt-24">
      <button aria-label="Close finder" onClick={close} className="absolute inset-0 bg-[#121316]/35" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Find a skill"
        className="relative w-full max-w-lg overflow-hidden rounded-lg border border-[var(--tp-hairline)] bg-[var(--tp-card)] shadow-2xl"
      >
        <form
          className="flex items-center gap-2 border-b border-[var(--tp-hairline)] px-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (results[0]) go(results[0].id);
          }}
        >
          <Search size={16} aria-hidden className="shrink-0 text-[var(--tp-ink2)]" />
          <input
            ref={inputRef}
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find any skill…"
            aria-label="Search skills"
            className="tp-sans min-h-[52px] w-full bg-transparent text-[15px] text-[var(--tp-ink)] outline-none placeholder:text-[var(--tp-ink2)]"
          />
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded text-[var(--tp-ink2)] hover:text-[var(--tp-ink)]"
          >
            <X size={16} />
          </button>
        </form>

        <div className="max-h-[55vh] overflow-y-auto">
          {query.trim() === '' ? (
            <p className="tp-sans px-4 py-5 text-[13px] text-[var(--tp-ink2)]">
              Type a skill name — every skill is reachable here, whatever the dial says.
            </p>
          ) : results.length === 0 ? (
            <p className="tp-sans px-4 py-5 text-[13px] text-[var(--tp-ink2)]">
              Nothing matches &ldquo;{query}&rdquo;.
            </p>
          ) : (
            results.map((s) => (
              <button
                key={s.id}
                onClick={() => go(s.id)}
                className="flex min-h-[52px] w-full items-center gap-3 border-b border-[var(--tp-hairline)] px-4 py-2 text-left transition-colors last:border-b-0 hover:bg-[var(--tp-dial)]"
              >
                <span className="tp-mono w-8 shrink-0 text-right text-[15px] font-bold text-[var(--tp-ink)]">
                  {s.estimatedMinutes}
                </span>
                <span aria-hidden className="tp-mono text-[9px] uppercase text-[var(--tp-ink2)]">min</span>
                <span className="min-w-0 flex-1">
                  <span className="tp-display block truncate text-[14px] font-semibold text-[var(--tp-ink)]">
                    {s.title}
                  </span>
                  <DomainChip domain={s.domain} />
                </span>
                {completedIds.includes(s.id) && <LoggedCheck />}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
