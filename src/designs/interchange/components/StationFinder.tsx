import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { ALL_SKILLS } from '@/data/skills';
import type { DomainKey, Difficulty, Skill } from '@/lib/types';
import { useInterchange } from '../context';
import { IC_BASE, LINES, LINE_MAP, STATIONS } from '../lineMeta';
import { LineBullet, StationTick } from './atoms';

const SUGGESTIONS = ['cook rice', 'make a budget', 'email a teacher', 'do laundry', 'plan a trip', 'calm down'];
const MAX_RESULTS = 30;

type VisitedFilter = 'visited' | 'unvisited';

function matches(skill: Skill, tokens: string[]): boolean {
  if (tokens.length === 0) return true;
  const haystack = `${skill.title} ${skill.summary} ${(skill.tags ?? []).join(' ')}`.toLowerCase();
  return tokens.every((t) => haystack.includes(t));
}

function rank(skill: Skill, query: string): number {
  const title = skill.title.toLowerCase();
  if (title.startsWith(query)) return 0;
  if (title.includes(query)) return 1;
  return 2;
}

/** The Station Finder — the one surface that spans all 233 stations. */
export default function StationFinder({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { completedIds } = useInterchange();
  const [query, setQuery] = useState('');
  const [lineFilter, setLineFilter] = useState<DomainKey | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | null>(null);
  const [visitedFilter, setVisitedFilter] = useState<VisitedFilter | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) {
      openerRef.current = document.activeElement as HTMLElement | null;
      setQuery('');
      setLineFilter(null);
      setDifficultyFilter(null);
      setVisitedFilter(null);
      // Focus after the overlay mounts
      setTimeout(() => inputRef.current?.focus(), 30);
    } else if (openerRef.current) {
      // Return focus to whatever opened the finder.
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

  const done = useMemo(() => new Set(completedIds), [completedIds]);
  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);

  // A skill passes `except` lets each chip row compute counts against the OTHER filters.
  const passes = (skill: Skill, except?: 'line' | 'difficulty' | 'visited'): boolean => {
    if (!matches(skill, tokens)) return false;
    if (except !== 'line' && lineFilter && skill.domain !== lineFilter) return false;
    if (except !== 'difficulty' && difficultyFilter && skill.difficulty !== difficultyFilter) return false;
    if (except !== 'visited' && visitedFilter) {
      const v = done.has(skill.id);
      if (visitedFilter === 'visited' ? !v : v) return false;
    }
    return true;
  };

  const hasAnyFilter = tokens.length > 0 || lineFilter || difficultyFilter || visitedFilter;
  const results = useMemo(() => {
    if (!hasAnyFilter) return [];
    const q = query.toLowerCase().trim();
    return ALL_SKILLS.filter((s) => passes(s))
      .sort((a, b) => rank(a, q) - rank(b, q) || a.title.localeCompare(b.title));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, lineFilter, difficultyFilter, visitedFilter, done]);

  const countWith = (except: 'line' | 'difficulty' | 'visited', test: (s: Skill) => boolean) =>
    ALL_SKILLS.filter((s) => passes(s, except) && test(s)).length;

  if (!open) return null;

  const chip = (active: boolean) =>
    `rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors ${
      active
        ? 'border-[var(--ic-ink)] bg-[var(--ic-ink)] text-[var(--ic-paper)]'
        : 'border-[var(--ic-rule)] bg-[var(--ic-card)] text-[var(--ic-ink2)] hover:text-[var(--ic-ink)]'
    }`;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[var(--ic-paper)] sm:block sm:bg-black/25 sm:p-4 sm:pt-[8vh]" onClick={onClose}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Find a station"
        className="flex min-h-0 flex-1 flex-col sm:mx-auto sm:max-h-[76vh] sm:max-w-[640px] sm:rounded-xl sm:border sm:border-[var(--ic-rule)] sm:bg-[var(--ic-paper)] sm:shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input row */}
        <div className="flex items-center gap-2.5 border-b border-[var(--ic-rule)] px-4 py-3">
          <Search size={16} className="shrink-0 text-[var(--ic-ink2)]" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Where to? Search all 233 stations"
            className="ic-sans min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-[var(--ic-ink2)]"
          />
          <button
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[var(--ic-ink2)] hover:text-[var(--ic-ink)]"
            aria-label="Close search"
          >
            <X size={16} />
          </button>
        </div>

        {/* Filter chips */}
        <div className="space-y-2 border-b border-[var(--ic-rule)] px-4 py-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
              <button
                key={d}
                onClick={() => setDifficultyFilter((cur) => (cur === d ? null : d))}
                className={chip(difficultyFilter === d)}
              >
                {d} ({countWith('difficulty', (s) => s.difficulty === d)})
              </button>
            ))}
            <span className="mx-1 h-4 w-px bg-[var(--ic-rule)]" />
            {(['unvisited', 'visited'] as VisitedFilter[]).map((v) => (
              <button
                key={v}
                onClick={() => setVisitedFilter((cur) => (cur === v ? null : v))}
                className={chip(visitedFilter === v)}
              >
                {v === 'visited' ? 'visited' : 'not yet'} (
                {countWith('visited', (s) => (v === 'visited' ? done.has(s.id) : !done.has(s.id)))})
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {LINES.map((line) => (
              <button
                key={line.domain}
                onClick={() => setLineFilter((cur) => (cur === line.domain ? null : line.domain))}
                className={`rounded-full p-2.5 transition-shadow ${
                  lineFilter === line.domain ? 'shadow-[inset_0_0_0_2px_var(--ic-ink)]' : 'opacity-80 hover:opacity-100'
                }`}
                title={`${line.name} (${countWith('line', (s) => s.domain === line.domain)})`}
                aria-label={`Filter by ${line.name} line`}
                aria-pressed={lineFilter === line.domain}
              >
                <LineBullet line={line} size="sm" />
              </button>
            ))}
            {lineFilter && (
              <span className="ml-1 text-[11px] font-semibold text-[var(--ic-ink2)]">
                {LINE_MAP[lineFilter].name} line
              </span>
            )}
          </div>
        </div>

        {/* Results / idle state */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {!hasAnyFilter ? (
            <div className="px-4 py-5">
              <p className="ic-mono mb-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ic-ink2)]">
                Try searching for
              </p>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => setQuery(s)} className={chip(false)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length === 0 ? (
            <p className="px-4 py-8 text-center text-[13px] text-[var(--ic-ink2)]">
              No stations match. Try fewer words or clear a filter.
            </p>
          ) : (
            <ul className="py-1">
              {results.slice(0, MAX_RESULTS).map((skill) => {
                const sInfo = STATIONS[skill.id];
                const visited = done.has(skill.id);
                return (
                  <li key={skill.id}>
                    <Link
                      to={`${IC_BASE}/station/${skill.id}`}
                      onClick={onClose}
                      className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-[var(--ic-band)]"
                    >
                      <LineBullet line={sInfo.line} size="sm" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13.5px] font-bold leading-tight">
                          {skill.title}
                        </span>
                        <span className="ic-mono text-[10px] uppercase tracking-wider text-[var(--ic-ink2)]">
                          {sInfo.code} · Zone {skill.level} · {skill.estimatedMinutes} min
                        </span>
                      </span>
                      <StationTick color={sInfo.line.color} visited={visited} size={14} />
                    </Link>
                  </li>
                );
              })}
              {results.length > MAX_RESULTS && (
                <li className="px-4 py-3 text-center text-[12px] text-[var(--ic-ink2)]">
                  {results.length - MAX_RESULTS} more — refine your search to see them.
                </li>
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
