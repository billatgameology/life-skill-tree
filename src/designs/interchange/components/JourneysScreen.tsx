import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { LEARNING_PATHS, type LearningPath } from '@/data/paths';
import { useInterchange } from '../context';
import { IC_BASE, STATIONS, zoneLabel } from '../lineMeta';
import { BoardLabel, StationTick } from './atoms';

/** Multi-color strip showing a journey's legs, colored by each stop's line. */
function JourneyLegStrip({ path, completedIds }: { path: LearningPath; completedIds: string[] }) {
  const done = new Set(completedIds);
  return (
    <div className="flex h-1.5 w-full gap-px overflow-hidden rounded-full" aria-hidden="true">
      {path.skillIds.map((id) => {
        const info = STATIONS[id];
        if (!info) return null;
        return (
          <span
            key={id}
            className="min-w-0 flex-1"
            style={{ backgroundColor: info.line.color, opacity: done.has(id) ? 1 : 0.28 }}
          />
        );
      })}
    </div>
  );
}

function visitedInPath(path: LearningPath, completedIds: string[]): number {
  const done = new Set(completedIds);
  return path.skillIds.reduce((n, id) => n + (done.has(id) ? 1 : 0), 0);
}

/** The journeys board: every learning path as a planned itinerary card. */
export function JourneysScreen() {
  const { completedIds } = useInterchange();

  return (
    <div className="mx-auto max-w-[880px] px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="text-2xl font-extrabold tracking-tight">Journeys</h1>
      <p className="mt-1 max-w-lg text-[13px] leading-relaxed text-[var(--ic-ink2)]">
        Planned routes across several lines, each built around one real goal. Ride them stop
        by stop — no transfers required, we've planned them for you.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {LEARNING_PATHS.map((path) => {
          const visited = visitedInPath(path, completedIds);
          const firstStops = path.skillIds.slice(0, 3);
          return (
            <Link
              key={path.id}
              to={`${IC_BASE}/journey/${path.id}`}
              className="group rounded-lg border border-[var(--ic-rule)] bg-[var(--ic-card)] p-4 transition-colors hover:border-[var(--ic-ink2)] sm:p-5"
            >
              <p className="ic-mono text-[9.5px] uppercase tracking-[0.16em] text-[var(--ic-ink2)]">
                {path.pathType} journey · {path.difficulty}
              </p>
              <h2 className="mt-1 text-[16px] font-extrabold leading-tight">{path.title}</h2>
              <p className="ic-serif mt-1 text-[13.5px] italic leading-relaxed text-[var(--ic-ink2)]">
                "{path.learnerGoal}"
              </p>

              <div className="mt-3.5">
                <JourneyLegStrip path={path} completedIds={completedIds} />
              </div>
              <p className="ic-mono mt-2 text-[10.5px] uppercase tracking-wider text-[var(--ic-ink2)]">
                {path.skillIds.length} stops · ~{path.estimatedTotalMinutes} min · {visited} visited
              </p>

              {/* First stops with dotted leaders, timetable style */}
              <ul className="mt-3 space-y-1 border-t border-[var(--ic-rule)] pt-2.5">
                {firstStops.map((id, i) => {
                  const info = STATIONS[id];
                  if (!info) return null;
                  return (
                    <li key={id} className="flex items-baseline gap-2 text-[11.5px]">
                      <span className="ic-mono shrink-0 text-[10px] text-[var(--ic-ink2)]">{i + 1}.</span>
                      <span className="shrink-0 font-semibold">{info.skill.title}</span>
                      <span className="min-w-4 flex-1 border-b border-dotted border-[var(--ic-rule)]" />
                      <span className="ic-mono shrink-0 text-[10px] text-[var(--ic-ink2)]">{info.code}</span>
                    </li>
                  );
                })}
                {path.skillIds.length > 3 && (
                  <li className="text-[11px] text-[var(--ic-ink2)]">
                    + {path.skillIds.length - 3} more stops
                  </li>
                )}
              </ul>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/** One journey's full itinerary. */
export function JourneyItinerary() {
  const { journeyId } = useParams();
  const { completedIds, startJourney } = useInterchange();
  const navigate = useNavigate();

  const path = LEARNING_PATHS.find((p) => p.id === journeyId);
  if (!path) return <Navigate to={`${IC_BASE}/journeys`} replace />;

  const done = new Set(completedIds);
  const visited = visitedInPath(path, completedIds);
  const firstUnvisited = path.skillIds.find((id) => !done.has(id)) ?? null;
  const isComplete = visited === path.skillIds.length;

  const handleStart = () => {
    if (!firstUnvisited) return;
    startJourney(path.id);
    navigate(`${IC_BASE}/station/${firstUnvisited}`);
  };

  return (
    <div className="mx-auto max-w-[680px] px-4 py-6 sm:px-6 sm:py-8">
      <Link to={`${IC_BASE}/journeys`} className="text-[12px] font-semibold text-[var(--ic-ink2)] hover:text-[var(--ic-ink)]">
        ← All journeys
      </Link>

      <div className="mt-3 rounded-lg border border-[var(--ic-rule)] bg-[var(--ic-card)] p-5 sm:p-6">
        <p className="ic-mono text-[10px] uppercase tracking-[0.16em] text-[var(--ic-ink2)]">
          {path.pathType} journey · {path.difficulty} · ~{path.estimatedTotalMinutes} min
        </p>
        <h1 className="mt-1 text-2xl font-extrabold leading-tight tracking-tight">{path.title}</h1>
        <p className="ic-serif mt-2 text-[15px] leading-relaxed">{path.summary}</p>

        <div className="mt-4">
          <JourneyLegStrip path={path} completedIds={completedIds} />
          <p className="ic-mono mt-2 text-[10.5px] uppercase tracking-wider text-[var(--ic-ink2)]">
            {visited} of {path.skillIds.length} stops visited
          </p>
        </div>

        {isComplete ? (
          <p className="mt-4 flex items-center gap-2 text-[13.5px] font-bold text-[var(--ic-green)]">
            <Check size={16} strokeWidth={3} /> Journey complete — every stop visited.
          </p>
        ) : (
          <button
            onClick={handleStart}
            className="mt-4 flex items-center gap-2 rounded-md bg-[var(--ic-ink)] px-4 py-2.5 text-[13px] font-bold text-[var(--ic-paper)] hover:opacity-90"
          >
            {visited > 0 ? 'Continue journey' : 'Start journey'} <ArrowRight size={14} />
          </button>
        )}
      </div>

      {/* Itinerary */}
      <div className="mt-7">
        <BoardLabel>Itinerary</BoardLabel>
        <ol>
          {path.skillIds.map((id, i) => {
            const info = STATIONS[id];
            if (!info) return null;
            const v = done.has(id);
            const isLast = i === path.skillIds.length - 1;
            return (
              <li key={id} className="relative">
                {!isLast && (
                  <span
                    className="absolute bottom-0 left-[11px] top-7 w-[3px] rounded-full"
                    style={{ backgroundColor: info.line.color, opacity: v ? 0.9 : 0.25 }}
                  />
                )}
                <Link
                  to={`${IC_BASE}/station/${id}`}
                  className="group flex items-center gap-3 rounded-md py-2 pr-2 transition-colors hover:bg-[var(--ic-band)]"
                >
                  <span className="flex w-6 justify-center">
                    <StationTick color={info.line.color} visited={v} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={`block truncate text-[13.5px] font-bold leading-tight ${v ? 'text-[var(--ic-ink2)]' : ''}`}>
                      {info.skill.title}
                    </span>
                    <span className="ic-mono text-[10px] uppercase tracking-wider text-[var(--ic-ink2)]">
                      {info.line.name} · {zoneLabel(info.skill.level)}
                    </span>
                  </span>
                  <span className="ic-mono shrink-0 text-[10.5px] text-[var(--ic-ink2)]">
                    {info.skill.estimatedMinutes} min
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Outcome */}
      <div className="mt-7">
        <BoardLabel>Where this journey takes you</BoardLabel>
        <p className="ic-serif text-[14.5px] leading-relaxed">{path.realLifeOutcome}</p>
        {path.whenThisHelps.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {path.whenThisHelps.map((w, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[13px] leading-relaxed text-[var(--ic-ink2)]">
                <span className="mt-[7px] h-[5px] w-[5px] shrink-0 rounded-full bg-[var(--ic-ink2)]" />
                {w}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
