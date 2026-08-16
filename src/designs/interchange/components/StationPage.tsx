import { useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { ArrowRight, Check, ChevronLeft, ChevronRight, Flag, X } from 'lucide-react';
import { LEARNING_PATHS } from '@/data/paths';
import type { Skill } from '@/lib/types';
import { useInterchange } from '../context';
import {
  IC_BASE,
  STATIONS,
  onwardStations,
  prereqStations,
  prevNextStop,
  zoneLabel,
  type StationInfo,
} from '../lineMeta';
import { BoardLabel, LineBullet, StationTick } from './atoms';

function stampDate(iso: string | undefined): string {
  if (!iso) return '';
  try {
    return format(parseISO(iso), 'd MMM yyyy').toUpperCase();
  } catch {
    return '';
  }
}

/** The tilted green ink date stamp — the whole celebration. */
function VisitStamp({ date, animate }: { date: string; animate: boolean }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={animate && !reduceMotion ? { scale: 2.4, opacity: 0, rotate: -14 } : false}
      animate={{ scale: 1, opacity: 1, rotate: -4 }}
      transition={{ type: 'spring', stiffness: 500, damping: 26 }}
      className="ic-mono pointer-events-none select-none rounded-md border-[3px] border-[var(--ic-green)] px-3 py-1.5 text-center leading-tight text-[var(--ic-green)]"
      style={{ boxShadow: 'inset 0 0 0 1.5px var(--ic-green)' }}
      aria-label={`Visited${date ? ` on ${date}` : ''}`}
    >
      <span className="block text-[13px] font-bold tracking-[0.18em]">VISITED</span>
      {date && <span className="block text-[10px] tracking-[0.12em]">{date}</span>}
    </motion.div>
  );
}

/** A tappable chip for a connected station (prerequisite or onward). */
function ConnectionChip({ info }: { info: StationInfo }) {
  const { completedIds } = useInterchange();
  const visited = completedIds.includes(info.skill.id);
  return (
    <Link
      to={`${IC_BASE}/station/${info.skill.id}`}
      className="flex items-center gap-2 rounded-md border border-[var(--ic-rule)] bg-[var(--ic-card)] px-2.5 py-2 transition-colors hover:border-[var(--ic-ink2)]"
    >
      <LineBullet line={info.line} size="sm" />
      <span className="min-w-0">
        <span className={`block truncate text-[12.5px] font-bold leading-tight ${visited ? 'text-[var(--ic-ink2)]' : ''}`}>
          {info.skill.title}
        </span>
        <span className="ic-mono block text-[9.5px] uppercase tracking-wider text-[var(--ic-ink2)]">
          {info.line.name} · {info.code}
        </span>
      </span>
      {visited && <Check size={13} strokeWidth={3} className="ml-auto shrink-0 text-[var(--ic-green)]" />}
    </Link>
  );
}

function StationPageInner({ skill }: { skill: Skill }) {
  const {
    completedIds,
    favoriteIds,
    completionDates,
    markVisited,
    toggleSaved,
    activeJourneyId,
    clearJourney,
  } = useInterchange();

  const info = STATIONS[skill.id];
  const line = info.line;
  const visited = completedIds.includes(skill.id);
  const saved = favoriteIds.includes(skill.id);
  const [justStamped, setJustStamped] = useState(false);
  const [checks, setChecks] = useState<boolean[]>(() => skill.completionCriteria.map(() => false));
  const allChecked = checks.length > 0 && checks.every(Boolean);

  const { prev, next } = prevNextStop(skill.id);
  const prereqs = prereqStations(skill);
  const onward = onwardStations(skill);

  const journey = useMemo(
    () => (activeJourneyId ? LEARNING_PATHS.find((p) => p.id === activeJourneyId) ?? null : null),
    [activeJourneyId],
  );
  const journeyIdx = journey ? journey.skillIds.indexOf(skill.id) : -1;
  const journeyNext =
    journey && journeyIdx >= 0 && journeyIdx < journey.skillIds.length - 1
      ? STATIONS[journey.skillIds[journeyIdx + 1]]
      : null;

  const handleVisit = () => {
    if (visited) return;
    if (markVisited(skill.id)) setJustStamped(true);
  };

  return (
    <div className="pb-14">
      {/* Line ribbon */}
      <div className="sticky top-0 z-20 text-white" style={{ backgroundColor: line.dark }}>
        <div className="mx-auto flex h-11 max-w-[880px] items-center gap-2 px-2 sm:px-4">
          <Link
            to={`${IC_BASE}/line/${line.domain}`}
            className="flex h-8 items-center gap-1 rounded-md px-1.5 text-[12px] font-bold hover:bg-white/15"
            title={`Back to the ${line.name} line`}
          >
            <ChevronLeft size={16} />
            <span className="hidden sm:inline">{line.name} line</span>
            <span className="sm:hidden">{line.code}</span>
          </Link>
          <span className="ic-mono min-w-0 flex-1 truncate text-center text-[11px] tracking-wider">
            {info.code} · {skill.title}
          </span>
          <span className="flex items-center">
            {prev ? (
              <Link
                to={`${IC_BASE}/station/${prev.skill.id}`}
                className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-white/15"
                title={`Previous stop: ${prev.skill.title}`}
              >
                <ChevronLeft size={16} />
              </Link>
            ) : (
              <span className="flex h-8 w-8 items-center justify-center opacity-30">
                <ChevronLeft size={16} />
              </span>
            )}
            {next ? (
              <Link
                to={`${IC_BASE}/station/${next.skill.id}`}
                className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-white/15"
                title={`Next stop: ${next.skill.title}`}
              >
                <ChevronRight size={16} />
              </Link>
            ) : (
              <span className="flex h-8 w-8 items-center justify-center opacity-30">
                <ChevronRight size={16} />
              </span>
            )}
          </span>
        </div>

        {/* Journey ribbon */}
        {journey && journeyIdx >= 0 && (
          <div className="border-t border-white/25 bg-black/10">
            <div className="mx-auto flex h-9 max-w-[880px] items-center gap-2 px-3 text-[11px] sm:px-4">
              <span className="min-w-0 truncate font-semibold">
                Journey: {journey.title} · stop {journeyIdx + 1} of {journey.skillIds.length}
              </span>
              {journeyNext ? (
                <Link
                  to={`${IC_BASE}/station/${journeyNext.skill.id}`}
                  className="ml-auto flex shrink-0 items-center gap-1 rounded px-1.5 py-0.5 font-bold hover:bg-white/15"
                >
                  Next stop <ArrowRight size={11} />
                </Link>
              ) : (
                <span className="ml-auto shrink-0 font-bold">Final stop</span>
              )}
              <button
                onClick={clearJourney}
                className="ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded hover:bg-white/15"
                title="Leave journey"
                aria-label="Leave journey"
              >
                <X size={13} />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mx-auto max-w-[880px] px-4 sm:px-6">
        {/* Hero information board */}
        <div
          className="relative mt-6 rounded-lg border border-[var(--ic-rule)] bg-[var(--ic-card)] p-5 sm:p-7"
          style={{ borderTop: `6px solid ${line.color}` }}
        >
          {visited && (
            <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
              <VisitStamp date={stampDate(completionDates[skill.id])} animate={justStamped} />
            </div>
          )}

          <h1 className={`text-[26px] font-extrabold leading-tight tracking-tight sm:text-3xl ${visited ? 'pr-32' : ''}`}>
            {skill.title}
          </h1>
          <p className="ic-mono mt-2 text-[11px] uppercase tracking-[0.12em] text-[var(--ic-ink2)]">
            {info.code} · {zoneLabel(skill.level)} · {skill.estimatedMinutes} min · {skill.difficulty}
          </p>
          <p className="ic-serif mt-3 max-w-[60ch] text-[16px] leading-relaxed text-[var(--ic-ink)]">
            {skill.summary}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            {!visited && (
              <button
                onClick={handleVisit}
                className={`rounded-md bg-[var(--ic-ink)] px-4 py-2.5 text-[13px] font-bold text-[var(--ic-paper)] transition-shadow hover:opacity-90 ${
                  allChecked ? 'shadow-[0_0_0_3px_var(--ic-paper),0_0_0_5px_var(--ic-green)]' : ''
                }`}
              >
                Mark as visited
              </button>
            )}
            <button
              onClick={() => toggleSaved(skill.id)}
              className={`flex items-center gap-1.5 rounded-md border px-3 py-2.5 text-[12px] font-bold transition-colors ${
                saved
                  ? 'border-[var(--ic-amber)] text-[var(--ic-amber)]'
                  : 'border-[var(--ic-rule)] text-[var(--ic-ink2)] hover:text-[var(--ic-ink)]'
              }`}
            >
              <Flag size={13} className={saved ? 'fill-[var(--ic-amber)]' : ''} />
              {saved ? 'Saved stop' : 'Save this stop'}
            </button>
            {justStamped && next && (
              <Link
                to={`${IC_BASE}/station/${next.skill.id}`}
                className="flex items-center gap-1 text-[12.5px] font-semibold text-[var(--ic-ink2)] hover:text-[var(--ic-ink)]"
              >
                Next stop: {next.skill.title} <ArrowRight size={12} />
              </Link>
            )}
          </div>
        </div>

        {/* Body sections */}
        <div className="mx-auto mt-8 max-w-[68ch] space-y-8">
          <section>
            <BoardLabel>Why this stop matters</BoardLabel>
            <p className="ic-serif text-[15.5px] leading-relaxed">{skill.whyItMatters}</p>
            {skill.realLifeUses.length > 0 && (
              <ul className="mt-3 space-y-1.5">
                {skill.realLifeUses.map((use, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[13.5px] leading-relaxed text-[var(--ic-ink2)]">
                    <span className="mt-[7px] h-[5px] w-[5px] shrink-0 rounded-full" style={{ backgroundColor: line.color }} />
                    {use}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {skill.steps.length > 0 && (
            <section>
              <BoardLabel>The route — step by step</BoardLabel>
              <ol className="space-y-3.5">
                {skill.steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3.5">
                    <span
                      className="ic-mono mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-white"
                      style={{ backgroundColor: line.dark }}
                    >
                      {i + 1}
                    </span>
                    <p className="ic-serif pt-0.5 text-[15px] leading-relaxed">{step}</p>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {skill.youWillLearn.length > 0 && (
            <section>
              <BoardLabel>You will learn</BoardLabel>
              <ul className="space-y-1.5">
                {skill.youWillLearn.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[13.5px] leading-relaxed">
                    <Check size={14} strokeWidth={3} className="mt-0.5 shrink-0" style={{ color: line.color }} />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {(prereqs.length > 0 || onward.length > 0) && (
            <section>
              <BoardLabel>Connections</BoardLabel>
              {prereqs.length > 0 && (
                <>
                  <p className="mb-2 text-[12px] font-semibold text-[var(--ic-ink2)]">
                    See first — suggested, not required:
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {prereqs.map((p) => (
                      <ConnectionChip key={p.skill.id} info={p} />
                    ))}
                  </div>
                </>
              )}
              {onward.length > 0 && (
                <>
                  <p className={`mb-2 text-[12px] font-semibold text-[var(--ic-ink2)] ${prereqs.length > 0 ? 'mt-4' : ''}`}>
                    Continues to:
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {onward.map((o) => (
                      <ConnectionChip key={o.skill.id} info={o} />
                    ))}
                  </div>
                </>
              )}
            </section>
          )}

          {skill.miniChallenge && (
            <section
              className="rounded-lg border-2 border-dashed p-4 sm:p-5"
              style={{ borderColor: `${line.color}66` }}
            >
              <h3 className="ic-mono mb-2 text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: line.color }}>
                Try it
              </h3>
              <p className="ic-serif text-[15px] leading-relaxed">{skill.miniChallenge}</p>
              {skill.completionCriteria.length > 0 && (
                <div className="mt-4 space-y-2 border-t border-[var(--ic-rule)] pt-3.5">
                  <p className="text-[11.5px] font-semibold text-[var(--ic-ink2)]">
                    You'll know you've got it when: {!visited && '(tick them off — just for you, nothing is locked)'}
                  </p>
                  {skill.completionCriteria.map((criterion, i) => (
                    <label key={i} className="flex cursor-pointer items-start gap-2.5 text-[13.5px] leading-relaxed">
                      <input
                        type="checkbox"
                        checked={visited || checks[i]}
                        disabled={visited}
                        onChange={() =>
                          setChecks((prev) => prev.map((c, ci) => (ci === i ? !c : c)))
                        }
                        className="mt-0.5 h-4 w-4 shrink-0 accent-[#2E7D4F]"
                      />
                      {criterion}
                    </label>
                  ))}
                </div>
              )}
            </section>
          )}

          {skill.tips && skill.tips.length > 0 && (
            <section>
              <BoardLabel>Staff tips</BoardLabel>
              <ul className="space-y-1.5">
                {skill.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[13.5px] leading-relaxed text-[var(--ic-ink2)]">
                    <span className="ic-mono mt-px shrink-0 text-[11px] font-bold" style={{ color: line.color }}>
                      {i + 1}.
                    </span>
                    {tip}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {skill.commonProblems && skill.commonProblems.length > 0 && (
            <section>
              <BoardLabel>If something goes wrong</BoardLabel>
              <ul className="space-y-2.5">
                {skill.commonProblems.map((problem, i) => (
                  <li
                    key={i}
                    className="border-l-[3px] border-[var(--ic-amber)] pl-3 text-[13.5px] leading-relaxed"
                  >
                    {problem}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Onward travel */}
          <div className="border-t border-[var(--ic-rule)] pt-5">
            {next ? (
              <Link
                to={`${IC_BASE}/station/${next.skill.id}`}
                className="group flex items-center gap-3 text-[14px] font-bold"
              >
                <StationTick color={line.color} visited={completedIds.includes(next.skill.id)} />
                <span>
                  Next stop: {next.skill.title}
                  <span className="ic-mono ml-2 text-[10px] font-normal uppercase tracking-wider text-[var(--ic-ink2)]">
                    {next.code}
                  </span>
                </span>
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            ) : (
              <p className="ic-mono text-[11px] uppercase tracking-wider text-[var(--ic-ink2)]">
                End of the {line.name} line
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StationPage() {
  const { stationId } = useParams();
  const info = stationId ? STATIONS[stationId] : undefined;
  if (!info) return <Navigate to={IC_BASE} replace />;
  // Keyed so per-station local state (checklist, stamp animation) resets on navigation.
  return <StationPageInner key={info.skill.id} skill={info.skill} />;
}
