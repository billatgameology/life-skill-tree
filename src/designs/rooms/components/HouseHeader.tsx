import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useRooms } from '../context';
import { RM_BASE, overallProgress } from '../places';

/** Slim top chrome: wordmark, lamps-lit count, search, and the way out. */
export default function HouseHeader() {
  const { completedIds, openSearch } = useRooms();
  const { done, total } = overallProgress(completedIds);

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-[var(--rm-rule)] bg-[var(--rm-deep)] px-4 sm:px-6">
      <Link to={RM_BASE} className="flex items-baseline gap-2 no-underline">
        <span className="rm-serif text-xl font-semibold italic text-[var(--rm-ink)]">Rooms</span>
        <span className="hidden text-[11px] tracking-wide text-[var(--rm-muted)] sm:inline">
          every skill lives somewhere
        </span>
      </Link>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <span className="text-[12px] tabular-nums text-[var(--rm-muted)]" aria-label={`${done} of ${total} skills done`}>
          <span aria-hidden="true" className="mr-1 inline-block h-2 w-2 rounded-full bg-[var(--rm-amber)] align-middle" />
          {done}/{total} lit
        </span>
        <button
          type="button"
          onClick={openSearch}
          aria-label="Search all skills (press /)"
          className="flex h-11 w-11 items-center justify-center rounded-lg border border-[var(--rm-rule)] text-[var(--rm-muted)] hover:border-[var(--rm-amber)] hover:text-[var(--rm-ink)]"
        >
          <Search size={17} />
        </button>
        <Link
          to="/"
          className="text-[12px] text-[var(--rm-muted)] underline-offset-4 hover:text-[var(--rm-ink)] hover:underline"
        >
          All designs
        </Link>
      </div>
    </header>
  );
}
