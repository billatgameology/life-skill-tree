import { Link } from 'react-router-dom';
import { Compass, Search, Signpost } from 'lucide-react';
import { useTrail } from '../context';
import { TOTAL_STOPS, TR_BASE, traveledCount } from '../derive';

/**
 * The persistent top bar: gallery escape hatch, wordmark, distance-traveled
 * strip, and the two ways to jump anywhere (leg index + finder).
 */
export default function TrailBar() {
  const { completedIds, openFinder, openLegIndex } = useTrail();
  const traveled = traveledCount(completedIds);
  const pct = Math.round((traveled / TOTAL_STOPS) * 100);

  return (
    <header className="relative z-20 border-b border-[var(--tr-rule)] bg-[var(--tr-panel)]/90 backdrop-blur-sm">
      <div className="mx-auto flex h-[52px] max-w-[960px] items-center gap-1.5 px-2 sm:gap-2 sm:px-4">
        <Link
          to="/"
          className="flex h-11 items-center gap-1.5 rounded-md px-2 text-[12px] font-bold text-[var(--tr-ink2)] transition-colors hover:bg-[var(--tr-ground)] hover:text-[var(--tr-ink)]"
          title="Back to the design gallery"
        >
          <Compass size={16} aria-hidden="true" />
          <span className="hidden sm:inline">Gallery</span>
        </Link>

        <Link to={TR_BASE} className="tr-serif ml-1 text-[17px] font-semibold italic tracking-tight text-[var(--tr-ink)]">
          The Long Trail
        </Link>

        {/* Distance strip */}
        <div className="ml-2 hidden min-w-0 flex-1 items-center gap-2 md:flex" aria-hidden="true">
          <div className="h-[5px] min-w-0 flex-1 overflow-hidden rounded-full bg-[var(--tr-rule)]">
            <div
              className="h-full rounded-full bg-[var(--tr-pine)]"
              style={{ width: `${Math.max(pct, traveled > 0 ? 2 : 0)}%` }}
            />
          </div>
        </div>
        <span className="tr-mono ml-auto shrink-0 text-[10.5px] tracking-wider text-[var(--tr-ink2)] md:ml-0">
          {traveled}/{TOTAL_STOPS} · {pct}%
        </span>

        <button
          onClick={openLegIndex}
          className="flex h-11 w-11 items-center justify-center rounded-md text-[var(--tr-ink2)] transition-colors hover:bg-[var(--tr-ground)] hover:text-[var(--tr-ink)]"
          aria-label="Open the leg index"
          title="Legs of the trail"
        >
          <Signpost size={17} aria-hidden="true" />
        </button>
        <button
          onClick={openFinder}
          className="flex h-11 w-11 items-center justify-center rounded-md text-[var(--tr-ink2)] transition-colors hover:bg-[var(--tr-ground)] hover:text-[var(--tr-ink)]"
          aria-label="Find a waypoint"
          title='Find a waypoint ("/")'
        >
          <Search size={17} aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
