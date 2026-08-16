import { Link } from 'react-router-dom';
import { Search, LayoutGrid } from 'lucide-react';
import { useInterchange } from '../context';
import { IC_BASE, TOTAL_STATIONS } from '../lineMeta';

/** The classic roundel: ring + name bar. */
function Roundel() {
  return (
    <svg viewBox="0 0 44 44" className="h-7 w-7 shrink-0" aria-hidden="true">
      <circle cx="22" cy="22" r="15" fill="none" stroke="var(--ic-ink)" strokeWidth="7" />
      <rect x="2" y="18" width="40" height="8" rx="1.5" fill="#B03A2E" />
    </svg>
  );
}

export default function SystemHeader() {
  const { completedIds, openFinder } = useInterchange();

  return (
    <header className="relative z-30 flex h-14 shrink-0 items-center gap-3 border-b border-[var(--ic-rule)] bg-[var(--ic-paper)] px-3 sm:px-4">
      <Link to={IC_BASE} className="flex min-w-0 items-center gap-2.5" title="Network board">
        <Roundel />
        <span className="min-w-0">
          <span className="block truncate text-[15px] font-extrabold leading-tight tracking-tight">
            Life Skill Tree
          </span>
          <span className="ic-mono block text-[9px] uppercase tracking-[0.22em] text-[var(--ic-ink2)]">
            Interchange
          </span>
        </span>
      </Link>

      {/* Desktop: a "Where to?" field. Mobile: an icon. */}
      <button
        onClick={openFinder}
        className="mx-auto hidden h-9 w-full max-w-sm items-center gap-2 rounded-md border border-[var(--ic-rule)] bg-[var(--ic-card)] px-3 text-left text-[13px] text-[var(--ic-ink2)] transition-colors hover:border-[var(--ic-ink2)] md:flex"
      >
        <Search size={14} />
        <span className="flex-1">Where to?</span>
        <kbd className="ic-mono rounded border border-[var(--ic-rule)] px-1.5 py-0.5 text-[10px]">/</kbd>
      </button>

      <div className="ml-auto flex items-center gap-2 md:ml-0">
        <button
          onClick={openFinder}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-[var(--ic-rule)] bg-[var(--ic-card)] text-[var(--ic-ink2)] transition-colors hover:text-[var(--ic-ink)] md:hidden"
          title="Find a station"
          aria-label="Find a station"
        >
          <Search size={15} />
        </button>
        <span className="ic-mono hidden text-[12px] text-[var(--ic-ink2)] sm:block" title="Stations visited">
          <span className="font-bold text-[var(--ic-ink)]">{completedIds.length}</span>
          {' / '}
          {TOTAL_STATIONS}
        </span>
        <Link
          to="/"
          className="flex h-9 w-9 items-center justify-center rounded-md border border-[var(--ic-rule)] bg-[var(--ic-card)] text-[var(--ic-ink2)] transition-colors hover:text-[var(--ic-ink)]"
          title="All designs"
          aria-label="Back to the design gallery"
        >
          <LayoutGrid size={15} />
        </Link>
      </div>
    </header>
  );
}
