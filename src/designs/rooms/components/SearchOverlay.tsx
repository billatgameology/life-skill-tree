import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Search, X } from 'lucide-react';
import { useRooms } from '../context';
import { RM_BASE, SEARCH_SUGGESTIONS, placeOf, searchSkills } from '../places';

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

/** The escape hatch: find any of the 233 skills, wherever it lives. */
export default function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { completedIds } = useRooms();
  const panelRef = useRef<HTMLDivElement>(null);

  // Escape works wherever focus sits, and Tab stays inside the dialog.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setQuery('');
        onClose();
        return;
      }
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

  if (!open) return null;

  const close = () => {
    setQuery('');
    onClose();
  };

  const results = searchSkills(query).slice(0, 40);
  const doneSet = new Set(completedIds);

  const goTo = (skillId: string) => {
    close();
    navigate(`${RM_BASE}/skill/${skillId}`);
  };

  return (
    <div
      className="fixed inset-0 z-[70] bg-black/60 p-4"
      onClick={close}
      onKeyDown={(e) => {
        if (e.key === 'Escape') close();
      }}
      role="presentation"
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Search skills"
        className="mx-auto mt-[8vh] w-full max-w-[560px] overflow-hidden rounded-2xl border border-[var(--rm-rule)] bg-[var(--rm-wall)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-[var(--rm-rule)] px-4">
          <Search size={17} className="shrink-0 text-[var(--rm-muted)]" aria-hidden="true" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && results[0]) goTo(results[0].id);
            }}
            aria-label="Search all skills"
            placeholder="Find a skill anywhere in the house…"
            className="min-h-12 flex-1 bg-transparent text-[15px] text-[var(--rm-ink)] placeholder:text-[var(--rm-muted)] focus:outline-none"
          />
          <button
            type="button"
            onClick={close}
            aria-label="Close search"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-[var(--rm-muted)] hover:text-[var(--rm-ink)]"
          >
            <X size={17} />
          </button>
        </div>

        <div className="max-h-[55vh] overflow-y-auto p-2">
          {query.trim() === '' && (
            <Suggestions onPick={setQuery} label="Try looking for" />
          )}
          {query.trim() !== '' && results.length === 0 && (
            <div className="px-3 py-4">
              <p className="text-[14px] text-[var(--rm-muted)]">
                Nothing on the shelves for that.
              </p>
              <Suggestions onPick={setQuery} label="Maybe one of these" />
            </div>
          )}
          {results.map((skill) => {
            const place = placeOf(skill.id);
            return (
              <button
                key={skill.id}
                type="button"
                onClick={() => goTo(skill.id)}
                className="flex min-h-11 w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left hover:bg-[var(--rm-card)]"
              >
                {doneSet.has(skill.id) && (
                  <Check size={14} className="shrink-0 text-[var(--rm-amber)]" aria-label="Done" />
                )}
                <span className="min-w-0 flex-1 truncate text-[14px] text-[var(--rm-ink)]">
                  {skill.title}
                </span>
                <span className="flex shrink-0 items-center gap-1.5 text-[11.5px] text-[var(--rm-muted)]">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: place.tint }} aria-hidden="true" />
                  {place.short}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Suggestions({ onPick, label }: { onPick: (q: string) => void; label: string }) {
  return (
    <div className="px-3 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--rm-muted)]">
        {label}
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {SEARCH_SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onPick(s)}
            className="min-h-11 rounded-full border border-[var(--rm-rule)] px-3.5 py-1 text-[13px] text-[var(--rm-ink)] hover:border-[var(--rm-amber)]"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
