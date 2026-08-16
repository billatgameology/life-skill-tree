import { useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Check, Shuffle, X } from 'lucide-react';
import { SKILL_MAP } from '@/data/skills';
import type { Skill } from '@/lib/types';
import { useFrontier } from '../context';
import {
  FR_BASE,
  TOTAL,
  dealHand,
  oneStepAway,
  surveyTerritory,
  trailOf,
  type TrailMark,
} from '../expedition';
import { BandLabel, FrontierCard, HorizonBar, SkillRow, StandingMark } from './atoms';

const HAND_SIZE = 8;
const TRAIL_CAP = 14;
const RIDGE_ROWS = 6;

/** One cairn on the trail of covered ground. */
function TrailCairn({ mark, newest }: { mark: TrailMark; newest: boolean }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={newest && !reduceMotion ? { opacity: 0, y: 18 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 26 }}
      className="w-[124px] shrink-0"
    >
      <Link to={`${FR_BASE}/skill/${mark.skill.id}`} className="group flex flex-col">
        <span className="flex items-center" aria-hidden>
          <span className="h-px flex-1 bg-[var(--fr-line)]" />
          <span
            className={`flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[var(--fr-ember)] ${
              newest ? 'fr-ember-pulse' : ''
            }`}
          >
            <Check size={12} strokeWidth={3.5} className="text-[#2A1606]" />
          </span>
          <span className="h-px flex-1 bg-[var(--fr-line)]" />
        </span>
        <span className="fr-body mt-2 line-clamp-2 px-1 text-center text-[12.5px] font-semibold leading-snug text-[var(--fr-ink)] group-hover:text-[var(--fr-ember)]">
          {mark.skill.title}
        </span>
        <span className="fr-mono mt-1 text-center text-[9px] uppercase tracking-[0.16em] text-[var(--fr-faint)]">
          {mark.dateLabel}
        </span>
      </Link>
    </motion.div>
  );
}

/**
 * Base camp — the whole app reorganized around where THIS user stands:
 * the trail behind, the dawn-lit frontier, and the ridges further out.
 */
export default function CampPage() {
  const {
    completedIds,
    lastAdvance,
    clearLastAdvance,
    handSeed,
    reshuffleHand,
    completionDates,
    signedIn,
    openAuth,
  } = useFrontier();
  const reduceMotion = useReducedMotion();

  const { behind, frontier, beyond } = useMemo(() => surveyTerritory(completedIds), [completedIds]);

  const pinnedIds = useMemo(() => lastAdvance?.unlockedIds ?? [], [lastAdvance]);
  const hand = useMemo(
    () => dealHand(frontier, handSeed, HAND_SIZE, pinnedIds),
    [frontier, handSeed, pinnedIds],
  );
  const pinnedSet = useMemo(() => new Set(pinnedIds), [pinnedIds]);

  const trail = useMemo(() => trailOf(completedIds, completionDates), [completedIds, completionDates]);
  const shownTrail = trail.slice(-TRAIL_CAP);
  const earlierCount = trail.length - shownTrail.length;

  const ridge = useMemo(() => oneStepAway(beyond, completedIds), [beyond, completedIds]);

  const advancedSkill: Skill | undefined = lastAdvance ? SKILL_MAP[lastAdvance.skillId] : undefined;

  // The trail always arrives at "now": keep the newest cairn in view.
  const trailRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = trailRef.current;
    if (el) el.scrollTo({ left: el.scrollWidth, behavior: reduceMotion ? 'auto' : 'smooth' });
  }, [shownTrail.length, reduceMotion]);

  return (
    <div className="pb-10">
      {/* ── Expedition status ── */}
      <section className="mx-auto max-w-[1160px] px-4 pb-7 pt-7 sm:px-6">
        <p className="fr-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--fr-faint)]">
          Expedition status
        </p>
        <h1 className="fr-display mt-2 max-w-[26ch] text-[26px] font-extrabold leading-[1.08] tracking-tight text-[var(--fr-ink)] sm:text-[34px]">
          {behind.length === 0 ? (
            <>Day one. The whole territory is ahead of you.</>
          ) : behind.length === TOTAL ? (
            <>You have covered the entire map. Extraordinary.</>
          ) : (
            <>
              {behind.length} {behind.length === 1 ? 'skill' : 'skills'} behind you.{' '}
              <span className="text-[var(--fr-dawn)]">The frontier is {frontier.length} wide.</span>
            </>
          )}
        </h1>
        <div className="mt-5 max-w-[560px]">
          <HorizonBar value={behind.length} max={TOTAL} label="Ground covered" />
          <p className="fr-mono mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[10px] uppercase tracking-[0.16em] text-[var(--fr-dim)]">
            <span>
              <span className="text-[var(--fr-ember)]">{behind.length}</span> behind
            </span>
            <span>
              <span className="text-[var(--fr-dawn)]">{frontier.length}</span> within reach
            </span>
            <span>
              <span className="text-[var(--fr-ink)]">{beyond.length}</span> further out
            </span>
            <span className="text-[var(--fr-faint)]">{TOTAL} in all</span>
          </p>
        </div>
      </section>

      {/* ── Advance banner: the migration, narrated ── */}
      {lastAdvance && advancedSkill && (
        <div className="mx-auto max-w-[1160px] px-4 sm:px-6">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-start gap-3 rounded-lg border border-[var(--fr-ember)]/50 bg-[var(--fr-card)] px-4 py-3"
          >
            <span className="mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-[var(--fr-ember)]" aria-hidden>
              <Check size={12} strokeWidth={3.5} className="text-[#2A1606]" />
            </span>
            <p className="fr-body min-w-0 flex-1 text-[13.5px] leading-snug text-[var(--fr-ink)]">
              <span className="font-bold">Camp advanced.</span> “{advancedSkill.title}” is behind you now
              {pinnedIds.length > 0 ? (
                <>
                  {' '}
                  — and{' '}
                  <span className="font-bold text-[var(--fr-dawn)]">
                    {pinnedIds.length} new {pinnedIds.length === 1 ? 'skill' : 'skills'}
                  </span>{' '}
                  slid into your frontier.
                </>
              ) : (
                '.'
              )}
            </p>
            <button
              onClick={clearLastAdvance}
              aria-label="Dismiss"
              className="-m-1.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-[var(--fr-faint)] hover:text-[var(--fr-ink)]"
            >
              <X size={15} aria-hidden />
            </button>
          </motion.div>
        </div>
      )}

      {/* ── Behind you ── */}
      <section className="border-y border-[var(--fr-line)] bg-[#0D1228]">
        <div className="mx-auto max-w-[1160px] px-4 py-6 sm:px-6">
          <div className="flex items-baseline justify-between gap-3">
            <BandLabel tone="ember">Behind you</BandLabel>
            {behind.length > 0 && (
              <Link
                to={`${FR_BASE}/logbook`}
                className="fr-mono flex min-h-[32px] items-center gap-1 text-[10.5px] font-bold uppercase tracking-[0.16em] text-[var(--fr-dim)] hover:text-[var(--fr-ink)]"
              >
                Full logbook <ArrowRight size={12} aria-hidden />
              </Link>
            )}
          </div>

          {behind.length === 0 ? (
            <div className="mt-4 rounded-lg border border-dashed border-[var(--fr-line)] px-4 py-6 text-center">
              <p className="fr-display text-[15px] font-bold text-[var(--fr-ink)]">
                No ground behind you yet.
              </p>
              <p className="fr-body mx-auto mt-1 max-w-[44ch] text-[13px] leading-snug text-[var(--fr-dim)]">
                Every expedition starts at first light. Pick anything on the frontier below — when you
                cover it, it moves back here and new ground opens ahead.
              </p>
              {!signedIn && (
                <button
                  onClick={openAuth}
                  className="fr-mono mt-4 min-h-[44px] rounded-md border border-[var(--fr-line)] px-4 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--fr-dim)] transition-colors hover:border-[var(--fr-ember)] hover:text-[var(--fr-ember)]"
                >
                  Sign in to keep your record
                </button>
              )}
            </div>
          ) : (
            <div ref={trailRef} className="mt-4 flex gap-3 overflow-x-auto pb-2">
              {earlierCount > 0 && (
                <Link
                  to={`${FR_BASE}/logbook`}
                  className="fr-mono flex w-[92px] shrink-0 flex-col items-center justify-center rounded-md border border-dashed border-[var(--fr-line)] px-2 py-3 text-center text-[10px] uppercase tracking-[0.14em] text-[var(--fr-faint)] hover:text-[var(--fr-ink)]"
                >
                  {earlierCount} earlier
                </Link>
              )}
              {shownTrail.map((mark) => (
                <TrailCairn
                  key={mark.skill.id}
                  mark={mark}
                  newest={lastAdvance?.skillId === mark.skill.id}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── The frontier ── */}
      <section className="fr-dawnband relative">
        <div className="fr-horizon absolute inset-x-0 top-0" aria-hidden />
        <div className="mx-auto max-w-[1160px] px-4 pb-8 pt-7 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
            <div>
              <BandLabel tone="dawn">The frontier</BandLabel>
              <p className="fr-display mt-1.5 text-[20px] font-extrabold leading-tight text-[var(--fr-ink)] sm:text-[24px]">
                {frontier.length === 0
                  ? 'Nothing left within reach — the map is yours.'
                  : `${frontier.length} skills within reach right now.`}
              </p>
              {frontier.length > 0 && (
                <p className="fr-body mt-1 text-[13px] text-[var(--fr-dim)]">
                  Every approach is clear — start anywhere. Here are a few, easy and short first.
                </p>
              )}
            </div>
            {frontier.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={reshuffleHand}
                  className="fr-mono flex min-h-[44px] items-center gap-2 rounded-md border border-[var(--fr-line)] bg-[var(--fr-card)] px-3.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--fr-ink)] transition-colors hover:border-[var(--fr-dawn)] hover:text-[var(--fr-dawn)]"
                >
                  <Shuffle size={14} aria-hidden />
                  Show me different ground
                </button>
                <Link
                  to={`${FR_BASE}/ahead`}
                  className="fr-mono flex min-h-[44px] items-center gap-1.5 rounded-md px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--fr-dim)] transition-colors hover:text-[var(--fr-ink)]"
                >
                  Survey all {frontier.length} <ArrowRight size={13} aria-hidden />
                </Link>
              </div>
            )}
          </div>

          <div
            key={`${handSeed}·${pinnedIds.join(',')}`}
            className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 xl:grid-cols-4"
          >
            {hand.map((skill, i) => (
              <FrontierCard
                key={skill.id}
                skill={skill}
                pinned={pinnedSet.has(skill.id)}
                animateIn
                delay={reduceMotion ? 0 : Math.min(i * 0.055, 0.5)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Further out ── */}
      {beyond.length > 0 && (
        <section className="fr-contour border-t border-[var(--fr-line)]">
          <div className="mx-auto max-w-[1160px] px-4 pb-4 pt-6 sm:px-6">
            <BandLabel>Further out</BandLabel>
            <p className="fr-body mt-1.5 max-w-[62ch] text-[13px] leading-snug text-[var(--fr-dim)]">
              {beyond.length} skills over the ridge. Nothing is locked — open any of them and it will
              show you what would help first.
            </p>

            <div className="mt-3 grid gap-x-6 md:grid-cols-2">
              {ridge.slice(0, RIDGE_ROWS).map(({ skill, missing }) => (
                <SkillRow
                  key={skill.id}
                  skill={skill}
                  lead={<StandingMark standing="beyond" />}
                  sub={`one step out — after “${missing.title}”`}
                />
              ))}
            </div>

            <Link
              to={`${FR_BASE}/ahead`}
              className="fr-mono mt-3 inline-flex min-h-[44px] items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--fr-dim)] transition-colors hover:text-[var(--fr-ink)]"
            >
              Survey everything ahead <ArrowRight size={13} aria-hidden />
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
