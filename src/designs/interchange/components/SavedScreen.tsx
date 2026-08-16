import { Link } from 'react-router-dom';
import { Flag } from 'lucide-react';
import { useInterchange } from '../context';
import { IC_BASE, LINES } from '../lineMeta';
import { LineBullet, StationTick } from './atoms';

/** Saved stops as a personal timetable, grouped by line. */
export default function SavedScreen() {
  const { completedIds, favoriteIds } = useInterchange();
  const savedSet = new Set(favoriteIds);
  const doneSet = new Set(completedIds);

  const groups = LINES.map((line) => ({
    line,
    stations: line.stations.filter((s) => savedSet.has(s.id)),
  })).filter((g) => g.stations.length > 0);

  return (
    <div className="mx-auto max-w-[680px] px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="text-2xl font-extrabold tracking-tight">Saved stops</h1>
      <p className="mt-1 text-[13px] leading-relaxed text-[var(--ic-ink2)]">
        Your personal timetable — stops you've flagged to visit later.
      </p>

      {groups.length === 0 ? (
        <div className="mt-14 flex flex-col items-center text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full border border-[var(--ic-rule)] bg-[var(--ic-card)]">
            <Flag size={20} className="text-[var(--ic-ink2)]" />
          </span>
          <p className="mt-4 text-[14px] font-bold">No saved stops yet</p>
          <p className="mt-1 max-w-xs text-[12.5px] leading-relaxed text-[var(--ic-ink2)]">
            Open any station and tap "Save this stop" to build your own timetable.
          </p>
          <Link
            to={IC_BASE}
            className="mt-4 rounded-md bg-[var(--ic-ink)] px-4 py-2 text-[12.5px] font-bold text-[var(--ic-paper)] hover:opacity-90"
          >
            Browse the lines
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {groups.map(({ line, stations }) => (
            <section key={line.domain}>
              <Link
                to={`${IC_BASE}/line/${line.domain}`}
                className="mb-1.5 flex items-center gap-2 hover:opacity-80"
              >
                <LineBullet line={line} size="sm" />
                <h2 className="text-[13px] font-extrabold">{line.name} line</h2>
              </Link>
              <ul className="overflow-hidden rounded-lg border border-[var(--ic-rule)] bg-[var(--ic-card)]">
                {stations.map((skill) => {
                  const visited = doneSet.has(skill.id);
                  return (
                    <li key={skill.id} className="border-b border-[var(--ic-rule)] last:border-b-0">
                      <Link
                        to={`${IC_BASE}/station/${skill.id}`}
                        className="flex items-center gap-3 px-3.5 py-2.5 transition-colors hover:bg-[var(--ic-band)]"
                      >
                        <StationTick color={line.color} visited={visited} size={14} />
                        <span className={`min-w-0 flex-1 truncate text-[13px] font-bold ${visited ? 'text-[var(--ic-ink2)]' : ''}`}>
                          {skill.title}
                        </span>
                        <span className="ic-mono shrink-0 text-[10.5px] text-[var(--ic-ink2)]">
                          {skill.estimatedMinutes} min
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
