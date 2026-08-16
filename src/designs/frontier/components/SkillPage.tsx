import { useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { ArrowLeft, ArrowRight, Check, Flag } from 'lucide-react';
import { SKILL_MAP } from '@/data/skills';
import type { Skill } from '@/lib/types';
import { useFrontier } from '../context';
import {
  DIFF_LABEL,
  FR_BASE,
  fmtDay,
  leadsTo,
  prereqsOf,
  stageLabel,
  standingOf,
  standingWord,
  unmetPrereqs,
  wouldUnlock,
} from '../expedition';
import { DomainTag, StandingMark } from './atoms';

/** Tappable chip for a connected skill (approach or onward ground). */
function ConnectionChip({ skill, note }: { skill: Skill; note?: string }) {
  const { completedIds } = useFrontier();
  const done = useMemo(() => new Set(completedIds), [completedIds]);
  const standing = standingOf(skill, done);
  return (
    <Link
      to={`${FR_BASE}/skill/${skill.id}`}
      className="flex min-h-[52px] items-center gap-2.5 rounded-md border border-[var(--fr-line)] bg-[var(--fr-card)] px-3 py-2 transition-colors hover:border-[var(--fr-faint)]"
    >
      <StandingMark standing={standing} />
      <span className="min-w-0 flex-1">
        <span className="fr-body block truncate text-[13px] font-bold leading-tight text-[var(--fr-ink)]">
          {skill.title}
        </span>
        <span className="fr-mono block truncate text-[9.5px] uppercase tracking-[0.14em] text-[var(--fr-faint)]">
          {standingWord(standing)} · {skill.estimatedMinutes}m
          {note ? <span className="text-[var(--fr-dawn)]"> · {note}</span> : null}
        </span>
      </span>
    </Link>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <h2 className="fr-mono mb-2.5 text-[10.5px] font-bold uppercase tracking-[0.26em] text-[var(--fr-dawn)]">
      {children}
    </h2>
  );
}

function SkillPageInner({ skill }: { skill: Skill }) {
  const { completedIds, favoriteIds, completionDates, advance, toggleWaypoint } = useFrontier();
  const reduceMotion = useReducedMotion();

  const done = useMemo(() => new Set(completedIds), [completedIds]);
  const standing = standingOf(skill, done);
  const covered = standing === 'behind';
  const flagged = favoriteIds.includes(skill.id);

  const approaches = prereqsOf(skill);
  const unmet = useMemo(() => unmetPrereqs(skill, completedIds), [skill, completedIds]);
  const onward = leadsTo(skill);
  const wouldOpen = useMemo(
    () => (covered ? [] : wouldUnlock(skill.id, completedIds)),
    [skill, completedIds, covered],
  );
  const wouldOpenIds = useMemo(() => new Set(wouldOpen.map((s) => s.id)), [wouldOpen]);

  const [justAdvanced, setJustAdvanced] = useState(false);
  const [opened, setOpened] = useState<Skill[]>([]);
  const [checks, setChecks] = useState<boolean[]>(() => skill.completionCriteria.map(() => false));
  const allChecked = checks.length > 0 && checks.every(Boolean);

  const handleAdvance = () => {
    if (covered) return;
    const opening = wouldUnlock(skill.id, completedIds);
    if (advance(skill.id)) {
      setJustAdvanced(true);
      setOpened(opening);
      confetti({
        particleCount: 90,
        spread: 75,
        startVelocity: 34,
        origin: { y: 0.7 },
        colors: ['#FF8A5C', '#FFB454', '#F4F1E8', '#8FB6DE'],
        disableForReducedMotion: true,
      });
    }
  };

  const coveredDate = completionDates[skill.id];

  return (
    <div className="pb-16">
      {/* Slim survey strip */}
      <div className="sticky top-0 z-20 border-b border-[var(--fr-line)] bg-[var(--fr-deep)]/95 backdrop-blur-sm">
        <div className="mx-auto flex h-11 max-w-[880px] items-center gap-2 px-3 sm:px-5">
          <Link
            to={FR_BASE}
            className="fr-mono flex h-9 items-center gap-1.5 rounded-md px-2 text-[10.5px] font-bold uppercase tracking-[0.16em] text-[var(--fr-dim)] transition-colors hover:text-[var(--fr-ink)]"
          >
            <ArrowLeft size={14} aria-hidden />
            Base camp
          </Link>
          <span className="fr-mono ml-auto flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em]">
            {covered ? (
              <span className="text-[var(--fr-ember)]">Covered{coveredDate ? ` · ${fmtDay(coveredDate)}` : ''}</span>
            ) : standing === 'frontier' ? (
              <span className="text-[var(--fr-dawn)]">Within reach</span>
            ) : (
              <span className="text-[var(--fr-dim)]">Further out</span>
            )}
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-[880px] px-4 sm:px-6">
        {/* Hero */}
        <div className="fr-dawnband mt-6 rounded-lg border border-[var(--fr-line)] p-5 sm:p-7">
          <DomainTag domain={skill.domain} />
          <h1 className="fr-display mt-2.5 text-[28px] font-extrabold leading-[1.05] tracking-tight text-[var(--fr-ink)] sm:text-[36px]">
            {skill.title}
          </h1>
          <p className="fr-mono mt-2.5 text-[10.5px] uppercase tracking-[0.18em] text-[var(--fr-dim)]">
            {skill.estimatedMinutes} min · {DIFF_LABEL[skill.difficulty]} · stage {skill.level} —{' '}
            {stageLabel(skill.level)}
          </p>
          <p className="fr-body mt-3.5 max-w-[58ch] text-[16px] leading-relaxed text-[var(--fr-ink)]">
            {skill.summary}
          </p>
          {skill.learnerPromise && skill.learnerPromise !== skill.summary && (
            <p className="fr-body mt-2 max-w-[58ch] text-[14px] italic leading-relaxed text-[var(--fr-dim)]">
              {skill.learnerPromise}
            </p>
          )}

          {/* Standing panel */}
          <div className="mt-5 rounded-md border border-[var(--fr-line)] bg-[var(--fr-night)]/60 p-3.5">
            {covered ? (
              <p className="fr-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--fr-ember)]">
                Ground covered{coveredDate ? ` on ${fmtDay(coveredDate)}` : ''} — it counts, always.
              </p>
            ) : standing === 'frontier' ? (
              <>
                <p className="fr-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--fr-dawn)]">
                  Every approach is clear
                </p>
                <p className="fr-body mt-1 text-[13px] leading-snug text-[var(--fr-dim)]">
                  {approaches.length === 0
                    ? 'No groundwork suggested — you can start this cold.'
                    : 'You have already covered the suggested groundwork. Nothing stands between you and this.'}
                </p>
              </>
            ) : (
              <>
                <p className="fr-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--fr-dim)]">
                  Further out — but never locked
                </p>
                <p className="fr-body mt-1 text-[13px] leading-snug text-[var(--fr-dim)]">
                  You can take this head-on right now. If you want easier footing first, this would help:
                </p>
                <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
                  {unmet.map((p) => (
                    <ConnectionChip key={p.id} skill={p} />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            {!covered && (
              <button
                onClick={handleAdvance}
                className={`fr-display min-h-[48px] rounded-md px-5 text-[14px] font-extrabold uppercase tracking-[0.06em] text-[#2A1606] transition-all hover:brightness-110 ${
                  allChecked ? 'shadow-[0_0_0_3px_var(--fr-night),0_0_0_5px_var(--fr-ember)]' : ''
                }`}
                style={{ background: 'linear-gradient(to right, #FF8A5C, #FFB454)' }}
              >
                Advance — mark it covered
              </button>
            )}
            <button
              onClick={() => toggleWaypoint(skill.id)}
              aria-pressed={flagged}
              className={`fr-mono flex min-h-[48px] items-center gap-2 rounded-md border px-4 text-[11px] font-bold uppercase tracking-[0.14em] transition-colors ${
                flagged
                  ? 'border-[var(--fr-dawn)] text-[var(--fr-dawn)]'
                  : 'border-[var(--fr-line)] text-[var(--fr-dim)] hover:text-[var(--fr-ink)]'
              }`}
            >
              <Flag size={14} aria-hidden className={flagged ? 'fill-[var(--fr-dawn)]' : ''} />
              {flagged ? 'Waypoint marked' : 'Mark waypoint'}
            </button>
          </div>

          {/* The migration, right here */}
          {justAdvanced && (
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 rounded-md border border-[var(--fr-dawn)]/60 bg-[var(--fr-night)]/70 p-4"
            >
              <p className="fr-mono text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--fr-dawn)]">
                {opened.length > 0 ? 'New ground ahead' : 'The trail continues'}
              </p>
              {opened.length > 0 ? (
                <>
                  <p className="fr-body mt-1 text-[13px] leading-snug text-[var(--fr-dim)]">
                    Covering this just brought{' '}
                    {opened.length === 1 ? 'one skill' : `${opened.length} skills`} within reach:
                  </p>
                  <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
                    {opened.map((s, i) => (
                      <motion.div
                        key={s.id}
                        initial={reduceMotion ? false : { opacity: 0, x: 18 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: reduceMotion ? 0 : 0.15 + i * 0.09 }}
                      >
                        <ConnectionChip skill={s} note="just opened" />
                      </motion.div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="fr-body mt-1 text-[13px] leading-snug text-[var(--fr-dim)]">
                  This ground is behind you now — the frontier has reshaped around it.
                </p>
              )}
              <Link
                to={FR_BASE}
                className="fr-mono mt-3.5 inline-flex min-h-[44px] items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--fr-ember)] hover:brightness-110"
              >
                Return to camp — watch the frontier move <ArrowRight size={13} aria-hidden />
              </Link>
            </motion.div>
          )}
        </div>

        {/* Survey body */}
        <div className="mx-auto mt-9 max-w-[68ch] space-y-9">
          <section>
            <SectionLabel>Why this ground matters</SectionLabel>
            <p className="fr-body text-[15px] leading-relaxed text-[var(--fr-ink)]">{skill.whyItMatters}</p>
          </section>

          {skill.realLifeUses.length > 0 && (
            <section>
              <SectionLabel>Where you will use it</SectionLabel>
              <ul className="space-y-2">
                {skill.realLifeUses.map((use, i) => (
                  <li key={i} className="fr-body flex items-start gap-2.5 text-[14px] leading-relaxed text-[var(--fr-dim)]">
                    <span aria-hidden className="mt-[9px] h-[5px] w-[5px] shrink-0 rounded-full bg-[var(--fr-dawn)]" />
                    {use}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {skill.youWillLearn.length > 0 && (
            <section>
              <SectionLabel>What you will pick up</SectionLabel>
              <ul className="space-y-2">
                {skill.youWillLearn.map((item, i) => (
                  <li key={i} className="fr-body flex items-start gap-2.5 text-[14px] leading-relaxed text-[var(--fr-ink)]">
                    <Check size={15} strokeWidth={3} aria-hidden className="mt-[3px] shrink-0 text-[var(--fr-ember)]" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {skill.steps.length > 0 && (
            <section>
              <SectionLabel>The route, step by step</SectionLabel>
              <ol className="space-y-3.5">
                {skill.steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3.5">
                    <span
                      aria-hidden
                      className="fr-mono mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--fr-dawn)] text-[12px] font-bold text-[var(--fr-dawn)]"
                    >
                      {i + 1}
                    </span>
                    <p className="fr-body pt-0.5 text-[15px] leading-relaxed text-[var(--fr-ink)]">{step}</p>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {skill.miniChallenge && (
            <section className="rounded-lg border-2 border-dashed border-[var(--fr-dawn)]/50 p-4 sm:p-5">
              <h2 className="fr-mono mb-2 text-[10.5px] font-bold uppercase tracking-[0.26em] text-[var(--fr-dawn)]">
                Field test
              </h2>
              <p className="fr-body text-[15px] leading-relaxed text-[var(--fr-ink)]">{skill.miniChallenge}</p>
              {skill.completionCriteria.length > 0 && (
                <div className="mt-4 space-y-2.5 border-t border-[var(--fr-line)] pt-3.5">
                  <p className="fr-body text-[12.5px] font-semibold text-[var(--fr-dim)]">
                    You have covered it when: {!covered && '(tick these off — just for you)'}
                  </p>
                  {skill.completionCriteria.map((criterion, i) => (
                    <label
                      key={i}
                      className="fr-body flex cursor-pointer items-start gap-2.5 text-[14px] leading-relaxed text-[var(--fr-ink)]"
                    >
                      <input
                        type="checkbox"
                        checked={covered || checks[i]}
                        disabled={covered}
                        onChange={() => setChecks((prev) => prev.map((c, ci) => (ci === i ? !c : c)))}
                        className="mt-1 h-4 w-4 shrink-0 accent-[#FF8A5C]"
                      />
                      {criterion}
                    </label>
                  ))}
                </div>
              )}
            </section>
          )}

          {skill.commonProblems && skill.commonProblems.length > 0 && (
            <section>
              <SectionLabel>If it goes sideways</SectionLabel>
              <ul className="space-y-2.5">
                {skill.commonProblems.map((problem, i) => (
                  <li
                    key={i}
                    className="fr-body border-l-[3px] border-[var(--fr-ember)] pl-3 text-[14px] leading-relaxed text-[var(--fr-dim)]"
                  >
                    {problem}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {skill.tips && skill.tips.length > 0 && (
            <section>
              <SectionLabel>Field notes</SectionLabel>
              <ul className="space-y-2">
                {skill.tips.map((tip, i) => (
                  <li key={i} className="fr-body flex items-start gap-2.5 text-[14px] leading-relaxed text-[var(--fr-dim)]">
                    <span aria-hidden className="fr-mono mt-px shrink-0 text-[11px] font-bold text-[var(--fr-dawn)]">
                      {i + 1}.
                    </span>
                    {tip}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {(approaches.length > 0 || onward.length > 0) && (
            <section>
              <SectionLabel>Connections</SectionLabel>
              {approaches.length > 0 && (
                <>
                  <p className="fr-body mb-2 text-[12.5px] font-semibold text-[var(--fr-dim)]">
                    Builds on — suggested groundwork, never required:
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {approaches.map((p) => (
                      <ConnectionChip key={p.id} skill={p} />
                    ))}
                  </div>
                </>
              )}
              {onward.length > 0 && (
                <>
                  <p className={`fr-body mb-2 text-[12.5px] font-semibold text-[var(--fr-dim)] ${approaches.length > 0 ? 'mt-4' : ''}`}>
                    Opens onto:
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {onward.map((s) => (
                      <ConnectionChip
                        key={s.id}
                        skill={s}
                        note={wouldOpenIds.has(s.id) ? 'would come within reach' : undefined}
                      />
                    ))}
                  </div>
                </>
              )}
            </section>
          )}

          <div className="border-t border-[var(--fr-line)] pt-5">
            <Link
              to={FR_BASE}
              className="fr-mono inline-flex min-h-[44px] items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--fr-dim)] transition-colors hover:text-[var(--fr-ink)]"
            >
              <ArrowLeft size={13} aria-hidden /> Back to base camp
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SkillPage() {
  const { skillId } = useParams();
  const skill = skillId ? SKILL_MAP[skillId] : undefined;
  if (!skill) return <Navigate to={FR_BASE} replace />;
  // Keyed so per-skill local state (checklist, advance panel) resets on navigation.
  return <SkillPageInner key={skill.id} skill={skill} />;
}
