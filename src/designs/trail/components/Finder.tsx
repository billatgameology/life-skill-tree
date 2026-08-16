import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Flag, Search, X } from 'lucide-react';
import { CATEGORIES } from '@/data/skills';
import { useTrail } from '../context';
import {
  FINDER_SUGGESTIONS,
  LEGS,
  STOP_MAP,
  TR_BASE,
  searchTrail,
  type TrailStop,
} from '../derive';

interface FinderProps {
  open: boolean;
  onClose: () => void;
}

/** One result row — tapping travels straight to the waypoint. */
function ResultRow({ stop, onPick }: { stop: TrailStop; onPick: (stop: TrailStop) => void }) {
  const { completedIds } = useTrail();
  const done = completedIds.includes(stop.skill.id);
  const leg = LEGS[stop.legIndex];
  return (
    <li>
      <button
        onClick={() => onPick(stop)}
        className="flex min-h-[48px] w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors hover:bg-[var(--tr-ground)]"
      >
        <span className="tr-mono w-9 shrink-0 text-right text-[11px] font-bold text-[var(--tr-ink2)]">
          {stop.numLabel}
        </span>
        <span className="min-w-0 flex-1">
          <span className={`block truncate text-[14px] font-bold leading-tight ${done ? 'text-[var(--tr-ink2)]' : ''}`}>
            {stop.skill.title}
          </span>
          <span className="tr-mono block truncate text-[9.5px] uppercase tracking-wider text-[var(--tr-ink2)]">
            Leg {leg.roman} — {leg.name} · {CATEGORIES[stop.skill.domain].name}
          </span>
        </span>
        {done && <Check size={14} strokeWidth={3} className="shrink-0 text-[var(--tr-berry)]" aria-label="Blazed" />}
      </button>
    </li>
  );
}

/**
 * The waypoint finder — the escape hatch to ANY skill, plus the list of
 * flagged (favorited) waypoints when the query is empty. The panel mounts
 * fresh on every open, so the query always starts empty.
 */
export default function Finder({ open, onClose }: FinderProps) {
  if (!open) return null;
  return <FinderPanel onClose={onClose} />;
}

function FinderPanel({ onClose }: { onClose: () => void }) {
  const { favoriteIds } = useTrail();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const results = searchTrail(query).slice(0, 40);
  const flagged = favoriteIds
    .map((id) => STOP_MAP[id])
    .filter((s): s is TrailStop => Boolean(s))
    .sort((a, b) => a.index - b.index);

  const pick = (stop: TrailStop) => {
    onClose();
    navigate(`${TR_BASE}/skill/${stop.skill.id}`);
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center bg-[#2E3120]/45 p-4 pt-[9vh] backdrop-blur-[2px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Find a waypoint"
    >
      <div
        className="flex max-h-[74vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-[var(--tr-rule)] bg-[var(--tr-panel)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2.5 border-b border-[var(--tr-rule)] px-4">
          <Search size={16} className="shrink-0 text-[var(--tr-ink2)]" aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && results.length > 0) pick(results[0]);
            }}
            placeholder="Find a waypoint on the trail…"
            className="h-[52px] min-w-0 flex-1 bg-transparent text-[15px] text-[var(--tr-ink)] outline-none placeholder:text-[var(--tr-ink2)]"
            aria-label="Search all 233 waypoints"
          />
          <button
            onClick={onClose}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-[var(--tr-ink2)] hover:bg-[var(--tr-ground)] hover:text-[var(--tr-ink)]"
            aria-label="Close the finder"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          {query.trim() === '' ? (
            <>
              {flagged.length > 0 && (
                <>
                  <p className="tr-mono flex items-center gap-1.5 px-3 pb-1 pt-2 text-[9.5px] font-bold uppercase tracking-[0.16em] text-[var(--tr-gold)]">
                    <Flag size={11} aria-hidden="true" /> Flagged for later
                  </p>
                  <ul>
                    {flagged.map((s) => (
                      <ResultRow key={s.skill.id} stop={s} onPick={pick} />
                    ))}
                  </ul>
                </>
              )}
              <p className="tr-mono px-3 pb-1 pt-3 text-[9.5px] font-bold uppercase tracking-[0.16em] text-[var(--tr-ink2)]">
                Try
              </p>
              <div className="flex flex-wrap gap-1.5 px-3 pb-3">
                {FINDER_SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setQuery(s)}
                    className="min-h-[44px] rounded-full border border-[var(--tr-rule)] px-3.5 py-1 text-[12px] font-semibold text-[var(--tr-ink2)] transition-colors hover:border-[var(--tr-ink2)] hover:text-[var(--tr-ink)]"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </>
          ) : results.length === 0 ? (
            <p className="px-4 py-8 text-center text-[13px] text-[var(--tr-ink2)]">
              Nothing on the trail matches &ldquo;{query}&rdquo; — try a shorter word.
            </p>
          ) : (
            <ul>
              {results.map((s) => (
                <ResultRow key={s.skill.id} stop={s} onPick={pick} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
