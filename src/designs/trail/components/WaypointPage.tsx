import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { ArrowRight, Check, ChevronLeft, ChevronRight, Flag } from 'lucide-react';
import { CATEGORIES } from '@/data/skills';
import type { Skill } from '@/lib/types';
import { useTrail } from '../context';
import {
  LEGS,
  STOP_MAP,
  TOTAL_STOPS,
  TR_BASE,
  TRAIL_TINTS,
  earlierJunctions,
  laterJunctions,
  prevNextStop,
} from '../derive';
import { BlazeMark, SectionLabel, StopChip } from './atoms';

function blazeDate(iso: string | undefined): string {
  if (!iso) return '';
  try {
    return format(parseISO(iso), 'd MMM yyyy').toUpperCase();
  } catch {
    return '';
  }
}

/** The berry paint-blaze stamp — the whole celebration. */
function BlazeStamp({ date, animate }: { date: string; animate: boolean }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={animate && !reduceMotion ? { scale: 2.2, opacity: 0, rotate: 10 } : false}
      animate={{ scale: 1, opacity: 1, rotate: -3 }}
      transition={{ type: 'spring', stiffness: 480, damping: 26 }}
      className="tr-mono pointer-events-none flex select-none items-center gap-2 rounded-md border-[3px] border-[var(--tr-berry)] px-3 py-1.5 text-[var(--tr-berry)]"
      aria-label={`Blazed${date ? ` on ${date}` : ''}`}
    >
      <span aria-hidden="true" className="inline-block h-[15px] w-[7px] rounded-[2px] bg-[var(--tr-berry)]" />
      <span className="leading-tight">
        <span className="block text-[13px] font-bold tracking-[0.18em]">BLAZED</span>
        {date && <span className="block text-[9.5px] tracking-[0.12em]">{date}</span>}
      </span>
    </motion.div>
  );
}

function WaypointPageInner({ skill }: { skill: Skill }) {
  const { completedIds, favoriteIds, completionDates, blaze, toggleFlag } = useTrail();

  const stop = STOP_MAP[skill.id];
  const leg = LEGS[stop.legIndex];
  const tint = TRAIL_TINTS[skill.domain];
  const done = completedIds.includes(skill.id);
  const flagged = favoriteIds.includes(skill.id);
  const [justBlazed, setJustBlazed] = useState(false);
  const [checks, setChecks] = useState<boolean[]>(() => skill.completionCriteria.map(() => false));
  const allChecked = checks.length > 0 && checks.every(Boolean);

  const { prev, next } = prevNextStop(skill.id);
  const earlier = earlierJunctions(skill);
  const later = laterJunctions(skill);
  const promiseDiffers = skill.learnerPromise.trim() !== skill.summary.trim();

  const handleBlaze = () => {
    if (done) return;
    if (blaze(skill.id)) setJustBlazed(true);
  };

  return (
    <div className="relative pb-16">
      {/* Leg ribbon: where on the trail you are standing */}
      <div className="sticky top-0 z-20 bg-[var(--tr-pine)] text-white">
        <div className="mx-auto flex h-11 max-w-[880px] items-center gap-1.5 px-2 sm:px-4">
          <Link
            to={TR_BASE}
            className="flex h-11 items-center gap-1 rounded-md px-1.5 text-[12px] font-bold hover:bg-white/15"
            title="Back to the trail"
          >
            <ChevronLeft size={16} aria-hidden="true" />
            The trail
          </Link>
          <span className="tr-mono min-w-0 flex-1 truncate text-center text-[10.5px] uppercase tracking-wider">
            Waypoint {stop.numLabel}/{TOTAL_STOPS} · Leg {leg.roman} — {leg.name}
          </span>
          <span className="flex items-center">
            {prev ? (
              <Link
                to={`${TR_BASE}/skill/${prev.skill.id}`}
                className="flex h-11 w-11 items-center justify-center rounded-md hover:bg-white/15"
                title={`Back down the trail: ${prev.skill.title}`}
                aria-label={`Back down the trail: ${prev.skill.title}`}
              >
                <ChevronLeft size={16} aria-hidden="true" />
              </Link>
            ) : (
              <span className="flex h-11 w-11 items-center justify-center opacity-30" aria-hidden="true">
                <ChevronLeft size={16} />
              </span>
            )}
            {next ? (
              <Link
                to={`${TR_BASE}/skill/${next.skill.id}`}
                className="flex h-11 w-11 items-center justify-center rounded-md hover:bg-white/15"
                title={`Onward: ${next.skill.title}`}
                aria-label={`Onward: ${next.skill.title}`}
              >
                <ChevronRight size={16} aria-hidden="true" />
              </Link>
            ) : (
              <span className="flex h-11 w-11 items-center justify-center opacity-30" aria-hidden="true">
                <ChevronRight size={16} />
              </span>
            )}
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-[880px] px-4 sm:px-6">
        {/* Waypoint plaque */}
        <div
          className="relative mt-6 rounded-lg border border-[var(--tr-rule)] bg-[var(--tr-panel)] p-5 sm:p-7"
          style={{ borderTop: `6px solid ${tint}` }}
        >
          {done && (
            <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
              <BlazeStamp date={blazeDate(completionDates[skill.id])} animate={justBlazed} />
            </div>
          )}

          <h1 className={`text-[26px] font-extrabold leading-tight tracking-tight sm:text-3xl ${done ? 'pr-36' : ''}`}>
            {skill.title}
          </h1>
          <p className="tr-mono mt-2 text-[10.5px] uppercase tracking-[0.12em] text-[var(--tr-ink2)]">
            Waypoint {stop.numLabel} of {TOTAL_STOPS} · {CATEGORIES[skill.domain].name} · level {skill.level} ·{' '}
            {skill.difficulty} · ~{skill.estimatedMinutes} min
          </p>
          <p className="tr-serif mt-3 max-w-[60ch] text-[16px] leading-relaxed">{skill.summary}</p>
          {promiseDiffers && (
            <p className="tr-serif mt-1.5 max-w-[60ch] text-[14px] italic leading-relaxed text-[var(--tr-ink2)]">
              {skill.learnerPromise}
            </p>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            {!done && (
              <button
                onClick={handleBlaze}
                className={`flex min-h-[44px] items-center gap-2 rounded-md bg-[var(--tr-berry)] px-4 py-2.5 text-[13px] font-bold text-white transition-shadow hover:opacity-90 ${
                  allChecked ? 'shadow-[0_0_0_3px_var(--tr-panel),0_0_0_5px_var(--tr-pine)]' : ''
                }`}
              >
                <BlazeMark className="h-[13px] w-[6px]" />
                Blaze this waypoint
              </button>
            )}
            <button
              onClick={() => toggleFlag(skill.id)}
              className={`flex min-h-[44px] items-center gap-1.5 rounded-md border px-3 py-2.5 text-[12px] font-bold transition-colors ${
                flagged
                  ? 'border-[var(--tr-gold)] text-[var(--tr-gold)]'
                  : 'border-[var(--tr-rule)] text-[var(--tr-ink2)] hover:text-[var(--tr-ink)]'
              }`}
            >
              <Flag size={13} aria-hidden="true" className={flagged ? 'fill-[var(--tr-gold)]' : ''} />
              {flagged ? 'Flagged for later' : 'Flag for later'}
            </button>
            {justBlazed && next && (
              <Link
                to={`${TR_BASE}/skill/${next.skill.id}`}
                className="flex items-center gap-1 text-[12.5px] font-semibold text-[var(--tr-ink2)] hover:text-[var(--tr-ink)]"
              >
                Onward: {next.skill.title} <ArrowRight size={12} aria-hidden="true" />
              </Link>
            )}
          </div>
        </div>

        {/* Field notes */}
        <div className="mx-auto mt-8 max-w-[68ch] space-y-8">
          <section>
            <SectionLabel>Why it&rsquo;s on the trail</SectionLabel>
            <p className="tr-serif text-[15.5px] leading-relaxed">{skill.whyItMatters}</p>
            {skill.realLifeUses.length > 0 && (
              <ul className="mt-3 space-y-1.5">
                {skill.realLifeUses.map((use, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[13.5px] leading-relaxed text-[var(--tr-ink2)]">
                    <span
                      aria-hidden="true"
                      className="mt-[7px] h-[6px] w-[6px] shrink-0 rotate-45"
                      style={{ backgroundColor: tint }}
                    />
                    {use}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {skill.steps.length > 0 && (
            <section>
              <SectionLabel>The walk — step by step</SectionLabel>
              <ol className="space-y-3.5">
                {skill.steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3.5">
                    <span
                      className="tr-mono mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-white"
                      style={{ backgroundColor: tint }}
                    >
                      {i + 1}
                    </span>
                    <p className="tr-serif pt-0.5 text-[15px] leading-relaxed">{step}</p>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {skill.youWillLearn.length > 0 && (
            <section>
              <SectionLabel>You will learn</SectionLabel>
              <ul className="space-y-1.5">
                {skill.youWillLearn.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[13.5px] leading-relaxed">
                    <Check size={14} strokeWidth={3} className="mt-0.5 shrink-0 text-[var(--tr-pine)]" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {skill.miniChallenge && (
            <section className="rounded-lg border-2 border-dashed p-4 sm:p-5" style={{ borderColor: `${tint}88` }}>
              <h2 className="tr-mono mb-2 text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: tint }}>
                Try it at this waypoint
              </h2>
              <p className="tr-serif text-[15px] leading-relaxed">{skill.miniChallenge}</p>
              {skill.completionCriteria.length > 0 && (
                <div className="mt-4 space-y-2 border-t border-[var(--tr-rule)] pt-3.5">
                  <p className="text-[11.5px] font-semibold text-[var(--tr-ink2)]">
                    You&rsquo;ll know you&rsquo;ve got it when:{' '}
                    {!done && '(tick them off — just for you, nothing is locked)'}
                  </p>
                  {skill.completionCriteria.map((criterion, i) => (
                    <label key={i} className="flex cursor-pointer items-start gap-2.5 text-[13.5px] leading-relaxed">
                      <input
                        type="checkbox"
                        checked={done || checks[i]}
                        disabled={done}
                        onChange={() => setChecks((prevChecks) => prevChecks.map((c, ci) => (ci === i ? !c : c)))}
                        className="mt-0.5 h-4 w-4 shrink-0 accent-[#8F3B45]"
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
              <SectionLabel>Trail notes</SectionLabel>
              <ul className="space-y-1.5">
                {skill.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[13.5px] leading-relaxed text-[var(--tr-ink2)]">
                    <span className="tr-mono mt-px shrink-0 text-[11px] font-bold" style={{ color: tint }}>
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
              <SectionLabel>Rough ground</SectionLabel>
              <ul className="space-y-2.5">
                {skill.commonProblems.map((problem, i) => (
                  <li key={i} className="border-l-[3px] border-[var(--tr-berry)] pl-3 text-[13.5px] leading-relaxed">
                    {problem}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {(earlier.length > 0 || later.length > 0) && (
            <section>
              <SectionLabel>Junctions</SectionLabel>
              {earlier.length > 0 && (
                <>
                  <p className="mb-2 text-[12px] font-semibold text-[var(--tr-ink2)]">
                    Builds on — earlier on the trail (suggested, never required):
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {earlier.map((j) => (
                      <StopChip key={j.skill.id} stop={j} />
                    ))}
                  </div>
                </>
              )}
              {later.length > 0 && (
                <>
                  <p className={`mb-2 text-[12px] font-semibold text-[var(--tr-ink2)] ${earlier.length > 0 ? 'mt-4' : ''}`}>
                    Leads to — further along:
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {later.map((j) => (
                      <StopChip key={j.skill.id} stop={j} />
                    ))}
                  </div>
                </>
              )}
            </section>
          )}

          {/* Onward travel */}
          <div className="border-t border-[var(--tr-rule)] pt-5">
            {next ? (
              <Link to={`${TR_BASE}/skill/${next.skill.id}`} className="group flex min-h-11 items-center gap-3 py-1.5 text-[14px] font-bold">
                <span
                  aria-hidden="true"
                  className="tr-mono flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 bg-[var(--tr-panel)] text-[9px] font-bold text-[var(--tr-ink2)]"
                  style={{ borderColor: TRAIL_TINTS[next.skill.domain] }}
                >
                  {next.num}
                </span>
                <span>
                  Onward: {next.skill.title}
                  <span className="tr-mono ml-2 text-[10px] font-normal uppercase tracking-wider text-[var(--tr-ink2)]">
                    Leg {LEGS[next.legIndex].roman}
                  </span>
                </span>
                <ArrowRight size={15} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            ) : (
              <p className="tr-mono text-[11px] uppercase tracking-wider text-[var(--tr-ink2)]">
                Trail&rsquo;s end — waypoint {TOTAL_STOPS} of {TOTAL_STOPS}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WaypointPage() {
  const { skillId } = useParams();
  const stop = skillId ? STOP_MAP[skillId] : undefined;
  if (!stop) return <Navigate to={TR_BASE} replace />;
  // Keyed so per-waypoint local state (criteria ticks, stamp animation) resets on travel.
  return <WaypointPageInner key={stop.skill.id} skill={stop.skill} />;
}
