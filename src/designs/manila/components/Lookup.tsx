import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { useManila } from '../context';
import { LOOKUP_SUGGESTIONS, MA_BASE, lookupCards, type CardInfo } from '../derive';
import { FiledMark } from './bits';
import { paperGrain } from '../surfaces';

const MAX_RESULTS = 30;

function ResultLine({ info, onPick }: { info: CardInfo; onPick?: () => void }) {
  const { completedIds } = useManila();
  const { skill, drawer, callNumber } = info;
  const filed = completedIds.includes(skill.id);
  return (
    <Link
      to={`${MA_BASE}/drawer/${drawer.domain}/card/${skill.id}`}
      onClick={onPick}
      className="flex items-baseline gap-2.5 rounded px-2 py-2 hover:bg-[var(--ma-manila)]/60"
    >
      <span className="ma-type w-11 shrink-0 text-[9.5px] uppercase tracking-wider text-[var(--ma-graphite)]">
        {callNumber}
      </span>
      <span className="min-w-0 flex-1">
        <span className={`ma-type block truncate text-[13px] font-bold leading-tight ${filed ? 'text-[var(--ma-graphite)]' : 'text-[var(--ma-ink)]'}`}>
          {skill.title}
        </span>
        <span className="ma-type block truncate text-[9.5px] uppercase tracking-wide text-[var(--ma-graphite)]">
          Drawer {drawer.num} — {drawer.name} · {skill.estimatedMinutes} min
        </span>
      </span>
      {filed && <FiledMark />}
    </Link>
  );
}

/** The Lookup request card — shared by the desktop overlay and the mobile screen. */
export function LookupCard({ onPick }: { onPick?: () => void }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const results = useMemo(() => lookupCards(query), [query]);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 30);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="rounded-sm border border-black/30 bg-[var(--ma-card)] shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
      style={paperGrain()}
    >
      <div className="h-[3px] w-full bg-[var(--ma-redrule)]" />
      <div className="border-b border-[var(--ma-rule)] px-4 py-3">
        <p className="ma-type mb-1.5 text-[9px] uppercase tracking-[0.2em] text-[var(--ma-graphite)]">
          Catalog request — what are you looking for?
        </p>
        <div className="flex items-center gap-2">
          <Search size={14} className="shrink-0 text-[var(--ma-graphite)]" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a skill, e.g. laundry"
            className="ma-type min-w-0 flex-1 bg-transparent text-[15px] text-[var(--ma-ink)] outline-none placeholder:text-[var(--ma-graphite)]/60"
          />
        </div>
      </div>

      <div className="max-h-[52vh] overflow-y-auto px-2 py-2">
        {query.trim() === '' ? (
          <div className="px-2 py-3">
            <p className="ma-type mb-2 text-[9.5px] uppercase tracking-[0.16em] text-[var(--ma-graphite)]">
              Common requests
            </p>
            <div className="flex flex-wrap gap-1.5">
              {LOOKUP_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setQuery(s)}
                  className="ma-type rounded-sm border border-[var(--ma-rule)] px-2.5 py-1 text-[11.5px] text-[var(--ma-graphite)] hover:text-[var(--ma-ink)]"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : results.length === 0 ? (
          <p className="ma-type px-2 py-6 text-center text-[12px] uppercase tracking-wide text-[var(--ma-graphite)]">
            No cards on file — try fewer words, or browse the drawer labels.
          </p>
        ) : (
          <>
            {results.slice(0, MAX_RESULTS).map((r) => (
              <ResultLine key={r.skill.id} info={r} onPick={onPick} />
            ))}
            {results.length > MAX_RESULTS && (
              <p className="ma-type px-2 py-2 text-center text-[10.5px] uppercase tracking-wide text-[var(--ma-graphite)]">
                {results.length - MAX_RESULTS} more on file — narrow the request.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/** Desktop overlay ("/" anywhere): a request card centered on dimmed walnut. */
export function LookupOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) {
      openerRef.current = document.activeElement as HTMLElement | null;
    } else if (openerRef.current) {
      openerRef.current.focus();
      openerRef.current = null;
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
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

  return (
    <div className="fixed inset-0 z-50 bg-black/55 p-4 pt-[10vh]" onClick={onClose}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Lookup a card"
        className="relative mx-auto max-w-[560px]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -right-2 -top-9 flex h-8 w-8 items-center justify-center rounded text-[var(--ma-manila)]/80 hover:text-[var(--ma-manila)]"
          aria-label="Close lookup"
        >
          <X size={16} />
        </button>
        <LookupCard onPick={onClose} />
      </div>
    </div>
  );
}

/** Mobile Lookup tab: the same request card as a full screen. */
export function LookupScreen() {
  return (
    <div className="mx-auto max-w-[560px] px-4 pb-10 pt-6">
      <h1 className="ma-chrome mb-3 text-xl font-bold text-[var(--ma-manila)]">Lookup</h1>
      <LookupCard />
    </div>
  );
}
