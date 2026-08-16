import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ChevronRight, Search, X, Zap } from 'lucide-react';
import type { Skill } from '@/lib/types';
import { LAT_BASE, NET_OF, PROBE_SUGGESTIONS, REFDES, padState, searchSkills } from '../graph';
import { useLattice } from '../context';

interface ProbeProps {
  open: boolean;
  onClose: () => void;
}

function ResultRow({ skill, onClose }: { skill: Skill; onClose: () => void }) {
  const { completedSet } = useLattice();
  const state = padState(skill, completedSet);
  const net = NET_OF[skill.id];
  return (
    <li>
      <Link
        to={`${LAT_BASE}/skill/${skill.id}`}
        onClick={onClose}
        className="flex min-h-[56px] items-center gap-3 border-b border-[var(--lt-line)] px-4 py-2.5 transition-colors hover:bg-[var(--lt-panel)]"
      >
        {state === 'soldered' ? (
          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[var(--lt-gold)] text-[var(--lt-gold-ink)]">
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
        ) : state === 'live' ? (
          <Zap
            className="h-5 w-5 shrink-0 text-[var(--lt-gold)]"
            fill="currentColor"
            aria-hidden="true"
          />
        ) : (
          <span
            className="ml-1 mr-1 h-3 w-3 shrink-0 rounded-full border border-[#4A6B57]"
            aria-hidden="true"
          />
        )}
        <span className="min-w-0 flex-1">
          <span className="lt-mono block text-[8px] uppercase tracking-[0.16em] text-[var(--lt-dim)]">
            {REFDES[skill.id]} · {net ? `${net.label} ${net.signal}` : 'loose pin'}
          </span>
          <span className="block truncate text-[13.5px] font-semibold text-[var(--lt-silk)]">
            {skill.title}
          </span>
        </span>
        <span className="lt-mono hidden text-[10px] text-[var(--lt-dim)] sm:inline">
          {skill.estimatedMinutes} min
        </span>
        <ChevronRight className="h-4 w-4 shrink-0 text-[var(--lt-dim)]" aria-hidden="true" />
      </Link>
    </li>
  );
}

export default function Probe({ open, onClose }: ProbeProps) {
  const [query, setQuery] = useState('');

  // The input mounts fresh each time the overlay opens, so autoFocus applies;
  // clearing on close keeps the next open blank without effect-driven state.
  const handleClose = useCallback(() => {
    setQuery('');
    onClose();
  }, [onClose]);

  // Escape must close the dialog wherever focus sits (chips, close button,
  // or body after a focused element unmounts) — window-level, not input-level.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, handleClose]);

  if (!open) return null;

  const results = searchSkills(query);
  const shown = results.slice(0, 30);

  return (
    <div
      className="fixed inset-0 z-[60] bg-[#04120A]/80 p-0 backdrop-blur-sm sm:p-[6vh_16px_16px]"
      onClick={handleClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Probe — find any skill"
        className="mx-auto flex h-full w-full flex-col overflow-hidden border-[var(--lt-copper)] bg-[var(--lt-board)] sm:h-auto sm:max-h-[76vh] sm:w-[640px] sm:rounded-xl sm:border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-[var(--lt-line)] bg-[var(--lt-well)] px-4 py-3">
          <Search className="h-5 w-5 shrink-0 text-[var(--lt-copper)]" aria-hidden="true" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') handleClose();
            }}
            placeholder="Probe any pad — title or keyword…"
            className="h-11 min-w-0 flex-1 bg-transparent text-[15px] text-[var(--lt-silk)] outline-none placeholder:text-[var(--lt-dim)]"
            aria-label="Search skills"
          />
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close search"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-md text-[var(--lt-dim)] hover:text-[var(--lt-silk)]"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="lt-scroll min-h-0 flex-1 overflow-y-auto">
          {query.trim() === '' ? (
            <div className="p-5">
              <p className="lt-mono mb-3 text-[10px] uppercase tracking-[0.18em] text-[var(--lt-dim)]">
                Try probing for
              </p>
              <div className="flex flex-wrap gap-2">
                {PROBE_SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setQuery(s)}
                    className="min-h-11 rounded-full border border-[var(--lt-line)] bg-[var(--lt-panel)] px-4 text-[12.5px] font-semibold text-[var(--lt-silk)] hover:border-[var(--lt-copper)]"
                  >
                    {s}
                  </button>
                ))}
              </div>
              <p className="mt-5 text-[12px] leading-relaxed text-[var(--lt-dim)]">
                Every one of the 233 pads is reachable from here — the probe is the escape hatch
                when you don't feel like walking.
              </p>
            </div>
          ) : shown.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-[14px] font-semibold text-[var(--lt-silk)]">No contact.</p>
              <p className="mt-1 text-[12px] text-[var(--lt-dim)]">
                Nothing matched "{query}" — try a shorter word.
              </p>
            </div>
          ) : (
            <>
              <p className="lt-mono sticky top-0 border-b border-[var(--lt-line)] bg-[var(--lt-well)] px-4 py-2 text-[9px] uppercase tracking-[0.18em] text-[var(--lt-dim)]">
                {results.length} pad{results.length === 1 ? '' : 's'} found
                {results.length > shown.length ? ` · showing ${shown.length}` : ''}
              </p>
              <ul>
                {shown.map((s) => (
                  <ResultRow key={s.id} skill={s} onClose={handleClose} />
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
