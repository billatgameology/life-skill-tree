import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useReducedMotion } from 'framer-motion';
import { ArrowDown, Flag } from 'lucide-react';
import { CATEGORIES } from '@/data/skills';
import { useTrail } from '../context';
import {
  LEGS,
  LEG_HEADER_H,
  TOTAL_LEGS,
  TOTAL_STOPS,
  TR_BASE,
  TRAIL_TINTS,
  clearedLegCount,
  firstUnvisited,
  formatMinutes,
  furthestStop,
  legBlazedCount,
  legPathD,
  legPixelHeight,
  minutesTraveled,
  stopY,
  traveledCount,
  type Leg,
  type TrailStop,
} from '../derive';
import { BlazeMark } from './atoms';

/** One waypoint marker + its label, absolutely positioned on the leg block. */
function WaypointMarker({ stop, localIndex, isFurthest }: { stop: TrailStop; localIndex: number; isFurthest: boolean }) {
  const { completedIds, favoriteIds } = useTrail();
  const done = completedIds.includes(stop.skill.id);
  const flagged = favoriteIds.includes(stop.skill.id);
  const labelRight = stop.x <= 50;
  const tint = TRAIL_TINTS[stop.skill.domain];

  return (
    <Link
      id={`wp-${stop.skill.id}`}
      to={`${TR_BASE}/skill/${stop.skill.id}`}
      className="group absolute z-10 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
      style={{ left: `${stop.x}%`, top: stopY(localIndex) }}
      aria-label={`Waypoint ${stop.num}: ${stop.skill.title}${done ? ', blazed' : ''}${flagged ? ', flagged' : ''}`}
    >
      {/* The marker disc */}
      <span
        aria-hidden="true"
        className="tr-mono relative flex h-9 w-9 items-center justify-center rounded-full border-[2.5px] text-[10px] font-bold transition-transform group-hover:scale-110"
        style={{
          backgroundColor: done ? 'var(--tr-berry)' : 'var(--tr-panel)',
          borderColor: done ? 'var(--tr-berry)' : tint,
          color: 'var(--tr-ink2)',
          boxShadow: isFurthest
            ? '0 0 0 3px var(--tr-ground), 0 0 0 5px var(--tr-berry)'
            : '0 1px 2px rgba(46, 49, 32, 0.18)',
        }}
      >
        {done ? <BlazeMark /> : stop.num}
        {flagged && (
          <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-[var(--tr-ground)] bg-[var(--tr-gold)]" />
        )}
      </span>

      {/* The label, on the inland side of the meander */}
      <span
        aria-hidden="true"
        className={`absolute top-1/2 w-max max-w-[40vw] -translate-y-1/2 sm:max-w-[280px] ${
          labelRight ? 'left-[calc(100%+4px)] text-left' : 'right-[calc(100%+4px)] text-right'
        }`}
      >
        <span
          className={`block text-[13.5px] font-bold leading-tight group-hover:underline ${
            done ? 'text-[var(--tr-ink2)]' : 'text-[var(--tr-ink)]'
          }`}
        >
          {stop.skill.title}
        </span>
        <span className="tr-mono block text-[9.5px] uppercase tracking-wider text-[var(--tr-ink2)]">
          {stop.numLabel} · {CATEGORIES[stop.skill.domain].name}
          {done && <span className="font-bold text-[var(--tr-berry)]"> · blazed</span>}
          {isFurthest && ' · furthest point'}
        </span>
      </span>
    </Link>
  );
}

/** One leg: header card, dashed path behind it, waypoint markers on it. */
function LegSection({ leg, entryX, isLast, furthestId }: { leg: Leg; entryX: number | null; isLast: boolean; furthestId: string | null }) {
  const { completedIds } = useTrail();
  const height = legPixelHeight(leg);
  const blazed = legBlazedCount(leg, completedIds);
  const cleared = blazed === leg.stops.length;

  return (
    <section
      id={`leg-${leg.index}`}
      aria-label={`Leg ${leg.roman}: ${leg.name}`}
      className="tr-leg relative"
      style={{ height, containIntrinsicSize: `auto ${height}px` }}
    >
      {/* The trail line — drawn first, everything else sits on top */}
      <svg
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
        viewBox={`0 0 1000 ${height}`}
        preserveAspectRatio="none"
      >
        <path
          d={legPathD(leg, entryX, !isLast)}
          fill="none"
          stroke="var(--tr-pine)"
          strokeWidth={3}
          strokeDasharray="2 9"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          opacity={0.85}
        />
      </svg>

      {/* Leg header card — the path passes behind it, like a map label */}
      <div className="relative z-10 mx-auto flex max-w-[480px] items-center px-4" style={{ height: LEG_HEADER_H }}>
        <div className="w-full rounded-lg border border-[var(--tr-rule)] bg-[var(--tr-panel)]/95 px-4 py-2.5 shadow-sm">
          <div className="flex items-center gap-2.5">
            <span
              className="tr-mono flex h-6 min-w-6 shrink-0 items-center justify-center rounded px-1 text-[10px] font-bold text-white"
              style={{ backgroundColor: leg.tint }}
            >
              {leg.roman}
            </span>
            <h2 className="tr-serif min-w-0 truncate text-[19px] font-semibold italic leading-tight">{leg.name}</h2>
            {cleared ? (
              <span className="tr-mono ml-auto shrink-0 rounded border-[1.5px] border-[var(--tr-berry)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--tr-berry)]">
                Cleared
              </span>
            ) : (
              <span className="tr-mono ml-auto shrink-0 text-[10px] tracking-wider text-[var(--tr-ink2)]">
                {blazed}/{leg.stops.length}
              </span>
            )}
          </div>
          <p className="mt-1 text-[11.5px] leading-snug text-[var(--tr-ink2)]">
            {leg.pairing} · waypoints {leg.startNum}–{leg.endNum}
          </p>
          <div className="mt-1.5 h-[3px] overflow-hidden rounded-full bg-[var(--tr-rule)]" aria-hidden="true">
            <div
              className="h-full rounded-full"
              style={{ width: `${(blazed / leg.stops.length) * 100}%`, backgroundColor: cleared ? 'var(--tr-berry)' : leg.tint }}
            />
          </div>
        </div>
      </div>

      {leg.stops.map((stop, i) => (
        <WaypointMarker key={stop.skill.id} stop={stop} localIndex={i} isFurthest={stop.skill.id === furthestId} />
      ))}
    </section>
  );
}

/** The trailhead board: headline progress in the trail's own terms. */
function TrailheadHero() {
  const { completedIds, requestJump } = useTrail();
  const traveled = traveledCount(completedIds);
  const pct = Math.round((traveled / TOTAL_STOPS) * 100);
  const furthest = furthestStop(completedIds);
  const next = firstUnvisited(completedIds);
  const cleared = clearedLegCount(completedIds);
  const minutes = minutesTraveled(completedIds);

  return (
    <div id="trailhead" className="relative z-10 mx-auto max-w-[640px] px-4 pb-2 pt-8 text-center">
      <p className="tr-mono text-[10px] uppercase tracking-[0.3em] text-[var(--tr-ink2)]">· Trailhead ·</p>
      <h1 className="tr-serif mt-2 text-[34px] font-semibold italic leading-tight sm:text-[40px]">The Long Trail</h1>
      <p className="mx-auto mt-2 max-w-[42ch] text-[14px] leading-relaxed text-[var(--tr-ink2)]">
        All {TOTAL_STOPS} skills as one continuous path, easy meadows to steep summits.
        Walk it in order — or wander; every waypoint is open.
      </p>

      <dl className="mx-auto mt-6 grid max-w-[560px] grid-cols-2 gap-2 text-left sm:grid-cols-4">
        {[
          { dt: 'Traveled', dd: `${traveled} of ${TOTAL_STOPS}`, sub: `${pct}% of the trail` },
          {
            dt: 'Furthest point',
            dd: furthest ? `#${furthest.num}` : '—',
            sub: furthest ? furthest.skill.title : 'not yet on the trail',
          },
          { dt: 'Legs cleared', dd: `${cleared} of ${TOTAL_LEGS}`, sub: 'end to end' },
          { dt: 'Time on trail', dd: formatMinutes(minutes), sub: 'of learning behind you' },
        ].map((s) => (
          <div key={s.dt} className="rounded-lg border border-[var(--tr-rule)] bg-[var(--tr-panel)]/90 px-3 py-2.5">
            <dt className="tr-mono text-[9px] uppercase tracking-[0.14em] text-[var(--tr-ink2)]">{s.dt}</dt>
            <dd className="mt-0.5 text-[15px] font-bold leading-tight">{s.dd}</dd>
            <dd className="truncate text-[10.5px] text-[var(--tr-ink2)]">{s.sub}</dd>
          </div>
        ))}
      </dl>

      {next ? (
        <button
          onClick={() => requestJump(`wp-${next.skill.id}`)}
          className="mt-5 inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[var(--tr-berry)] px-5 py-2.5 text-[13.5px] font-bold text-white shadow-sm transition-transform hover:scale-[1.02]"
        >
          <ArrowDown size={15} aria-hidden="true" />
          Continue the trail — #{next.num} {next.skill.title}
        </button>
      ) : (
        <p className="tr-mono mt-5 inline-block rounded-full border-2 border-[var(--tr-berry)] px-5 py-2.5 text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--tr-berry)]">
          Trail complete — every waypoint blazed
        </p>
      )}

      <p className="tr-mono mt-4 hidden text-[10px] uppercase tracking-[0.18em] text-[var(--tr-ink2)] sm:block">
        Press &ldquo;/&rdquo; to find any waypoint
      </p>
    </div>
  );
}

/** The wooden board at the far end of the path. */
function TrailsEnd() {
  const { requestJump } = useTrail();
  return (
    <div className="relative z-10 mx-auto max-w-[480px] px-4 pb-16 pt-6 text-center">
      <div className="rounded-lg border-2 border-[var(--tr-pine)] bg-[var(--tr-panel)]/95 px-6 py-5">
        <p className="tr-mono text-[11px] font-bold uppercase tracking-[0.3em] text-[var(--tr-pine)]">
          Trail&rsquo;s End
        </p>
        <p className="tr-serif mt-1.5 text-[15px] italic text-[var(--tr-ink2)]">
          {TOTAL_STOPS} waypoints, {TOTAL_LEGS} legs — however far you walked today, the trail keeps.
        </p>
        <button
          onClick={() => requestJump('trailhead')}
          className="tr-mono mt-3 min-h-[44px] rounded-md px-3 py-2 text-[10.5px] font-bold uppercase tracking-[0.16em] text-[var(--tr-ink2)] transition-colors hover:text-[var(--tr-ink)]"
        >
          ↑ Back to the trailhead
        </button>
      </div>
      <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-[var(--tr-ink2)]">
        <Flag size={11} aria-hidden="true" className="text-[var(--tr-gold)]" />
        Gold dots are waypoints you flagged for later.
      </p>
    </div>
  );
}

/** The one continuous path — every skill a waypoint, legs stacked end to end. */
export default function TrailPage() {
  const { completedIds, jumpTarget, clearJump } = useTrail();
  const reduceMotion = useReducedMotion();
  const furthest = furthestStop(completedIds);
  const furthestId = furthest ? furthest.skill.id : null;

  // Consume pending jumps (continue button, leg index, cross-page requests).
  useEffect(() => {
    if (!jumpTarget) return;
    const el = document.getElementById(jumpTarget);
    if (el) {
      el.scrollIntoView({
        behavior: reduceMotion ? 'auto' : 'smooth',
        block: jumpTarget.startsWith('wp-') ? 'center' : 'start',
      });
    }
    clearJump();
  }, [jumpTarget, clearJump, reduceMotion]);

  return (
    <div className="relative mx-auto w-full max-w-[820px]">
      <TrailheadHero />
      {LEGS.map((leg, i) => (
        <LegSection
          key={leg.index}
          leg={leg}
          entryX={i === 0 ? null : LEGS[i - 1].stops[LEGS[i - 1].stops.length - 1].x}
          isLast={i === LEGS.length - 1}
          furthestId={furthestId}
        />
      ))}
      <TrailsEnd />
    </div>
  );
}
