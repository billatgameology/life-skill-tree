import { Link } from 'react-router-dom';
import { useInterchange } from '../context';
import { IC_BASE, LINES, TOTAL_STATIONS, nextStops, visitedCount, STATIONS } from '../lineMeta';
import { LineBullet, LineStrip, LineFraction } from './atoms';

/**
 * The desktop home canvas: all 15 lines as departure-board cards.
 * (Mobile home is the LineIndex screen instead.)
 */
export default function NetworkBoard() {
  const { completedIds } = useInterchange();

  return (
    <div className="mx-auto max-w-[880px] px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight">Network board</h1>
        <p className="mt-1 max-w-lg text-[13px] leading-relaxed text-[var(--ic-ink2)]">
          {TOTAL_STATIONS} stations across 15 lines — every stop is one practical life skill.
          Pick a line to see its platform diagram, or press{' '}
          <kbd className="ic-mono rounded border border-[var(--ic-rule)] bg-[var(--ic-card)] px-1 py-0.5 text-[10px]">/</kbd>{' '}
          to search.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
        {LINES.map((line) => {
          const upcoming = nextStops(line, completedIds, 2);
          const complete = visitedCount(line, completedIds) === line.stations.length;
          return (
            <Link
              key={line.domain}
              to={`${IC_BASE}/line/${line.domain}`}
              className="group rounded-lg border border-[var(--ic-rule)] bg-[var(--ic-card)] p-4 transition-colors hover:border-[var(--ic-ink2)]"
            >
              <div className="flex items-center gap-2.5">
                <LineBullet line={line} complete={complete} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-extrabold leading-tight">
                    {line.name}
                  </span>
                  <span className="ic-mono text-[10px] uppercase tracking-wider text-[var(--ic-ink2)]">
                    {line.stations.length} stops
                  </span>
                </span>
                <LineFraction line={line} completedIds={completedIds} />
              </div>

              <div className="mt-3">
                <LineStrip line={line} completedIds={completedIds} />
              </div>

              {/* Departure rows: the next unvisited stops. */}
              <div className="mt-3 space-y-1 border-t border-[var(--ic-rule)] pt-2.5">
                {complete ? (
                  <p className="text-[11px] font-semibold text-[var(--ic-green)]">
                    All stops visited on this line.
                  </p>
                ) : (
                  upcoming.map((s) => (
                    <p key={s.id} className="flex items-baseline gap-2 text-[11.5px] leading-snug">
                      <span className="ic-mono shrink-0 text-[10px] text-[var(--ic-ink2)]">
                        {STATIONS[s.id].code}
                      </span>
                      <span className="min-w-0 truncate font-semibold">{s.title}</span>
                      <span className="ic-mono ml-auto shrink-0 text-[10px] text-[var(--ic-ink2)]">
                        {s.estimatedMinutes}min
                      </span>
                    </p>
                  ))
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
