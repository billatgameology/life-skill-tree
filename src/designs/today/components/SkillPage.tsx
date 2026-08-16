import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { CSSProperties, ReactNode } from 'react';
import confetti from 'canvas-confetti';
import { format } from 'date-fns';
import { ArrowLeft, Bookmark, BookmarkCheck, Check, CircleCheck } from 'lucide-react';
import type { Skill } from '@/lib/types';
import { CATEGORIES, SKILL_MAP, getChildren } from '@/data/skills';
import { useToday } from '../context';
import {
  CARD_COLOR,
  CARD_INK,
  CARD_INK_SOFT,
  DIFFICULTY_LABEL,
  TODAY_BASE,
  parseDateKey,
  tomorrowHint,
} from '../deal';

function fireConfetti(color: string) {
  const base = {
    spread: 75,
    ticks: 220,
    gravity: 0.9,
    scalar: 1.05,
    colors: [color, '#EFECF5', '#FFC94B'],
    disableForReducedMotion: true,
  };
  confetti({ ...base, particleCount: 90, angle: 90, startVelocity: 46, origin: { x: 0.5, y: 0.7 } });
  window.setTimeout(
    () => confetti({ ...base, particleCount: 45, angle: 60, origin: { x: 0.12, y: 0.85 } }),
    150,
  );
  window.setTimeout(
    () => confetti({ ...base, particleCount: 45, angle: 120, origin: { x: 0.88, y: 0.85 } }),
    280,
  );
}

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="td-display text-[12px] font-bold uppercase tracking-[0.24em] text-[var(--td-card)]">
        {label}
      </h2>
      <div className="mt-3.5">{children}</div>
    </section>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 text-[15.5px] leading-relaxed text-[var(--td-text)]">
          <span aria-hidden="true" className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--td-card)]" />
          {item}
        </li>
      ))}
    </ul>
  );
}

function RelatedPills({ skills, completedSet }: { skills: Skill[]; completedSet: ReadonlySet<string> }) {
  return (
    <div className="flex flex-wrap gap-2">
      {skills.map((s) => (
        <Link
          key={s.id}
          to={`${TODAY_BASE}/skill/${s.id}`}
          className="td-btn td-link inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[var(--td-line)] px-4 text-[13.5px] text-[var(--td-text)]"
        >
          <span
            aria-hidden="true"
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: CARD_COLOR[s.domain] }}
          />
          {s.title}
          {completedSet.has(s.id) && (
            <>
              <Check size={14} aria-hidden="true" className="text-[var(--td-text-2)]" />
              <span className="sr-only">(done)</span>
            </>
          )}
        </Link>
      ))}
    </div>
  );
}

function SkillDetail({ skill }: { skill: Skill }) {
  const { completedSet, completionDates, favoriteIds, deal, dateKey, markDone, toggleKeep } = useToday();
  const reduce = useReducedMotion();
  const [celebrating, setCelebrating] = useState(false);

  const color = CARD_COLOR[skill.domain];
  const isDone = completedSet.has(skill.id);
  const isTodays = deal.skill.id === skill.id;
  const kept = favoriteIds.includes(skill.id);
  const doneDate = completionDates[skill.id];

  const buildsOn = skill.suggestedPrerequisites
    .map((id) => SKILL_MAP[id])
    .filter((s): s is (typeof SKILL_MAP)[string] => Boolean(s));
  const leadsTo = getChildren(skill.id);

  const handleComplete = () => {
    if (markDone(skill.id)) {
      setCelebrating(true);
      if (!reduce) fireConfetti(color);
    }
  };

  return (
    <div className="min-h-full" style={{ '--td-card': color } as CSSProperties}>
      {/* Full-bleed card-colored hero. */}
      <div style={{ backgroundColor: color, color: CARD_INK }}>
        <div className="mx-auto w-full max-w-[760px] px-5 pb-10 pt-4 sm:px-8">
          <Link
            to={TODAY_BASE}
            className="td-btn -ml-2 inline-flex min-h-[44px] items-center gap-1.5 rounded-xl px-2 text-[13.5px] font-semibold"
            style={{ color: CARD_INK }}
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Today
          </Link>

          <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.24em]" style={{ color: CARD_INK_SOFT }}>
            {CATEGORIES[skill.domain].name}
            {isTodays && (
              <>
                <span aria-hidden="true"> · </span>
                today&rsquo;s card
              </>
            )}
          </p>

          <h1 className="td-display mt-3 text-[clamp(2.1rem,6.5vw,3.8rem)] font-bold leading-[1.03] tracking-tight">
            {skill.title}
          </h1>

          <p className="mt-4 max-w-[52ch] text-[17px] leading-relaxed" style={{ color: CARD_INK_SOFT }}>
            {skill.learnerPromise}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2">
            <p className="text-[12.5px] font-semibold uppercase tracking-[0.16em]" style={{ color: CARD_INK_SOFT }}>
              {skill.estimatedMinutes} min
              <span aria-hidden="true"> · </span>
              {DIFFICULTY_LABEL[skill.difficulty]}
              <span aria-hidden="true"> · </span>
              level {skill.level}
            </p>
            <button
              type="button"
              onClick={() => toggleKeep(skill.id)}
              aria-pressed={kept}
              className="td-btn inline-flex min-h-[44px] items-center gap-1.5 rounded-xl px-2 text-[13.5px] font-semibold"
              style={{ color: CARD_INK }}
            >
              {kept ? <BookmarkCheck size={17} aria-hidden="true" /> : <Bookmark size={17} aria-hidden="true" />}
              {kept ? 'Kept' : 'Keep this one'}
            </button>
          </div>
        </div>
      </div>

      {/* Long-form content on the dark stage. */}
      <div className="mx-auto w-full max-w-[760px] px-5 pb-20 pt-2 sm:px-8">
        <Section label="Why it matters">
          <p className="text-[15.5px] leading-relaxed text-[var(--td-text)]">{skill.whyItMatters}</p>
        </Section>

        {skill.realLifeUses.length > 0 && (
          <Section label="Where it shows up">
            <Bullets items={skill.realLifeUses} />
          </Section>
        )}

        {skill.youWillLearn.length > 0 && (
          <Section label="You'll learn">
            <Bullets items={skill.youWillLearn} />
          </Section>
        )}

        <Section label="Mini challenge">
          <p
            className="rounded-2xl border p-5 text-[15.5px] leading-relaxed text-[var(--td-text)]"
            style={{
              borderColor: 'color-mix(in srgb, var(--td-card) 40%, transparent)',
              backgroundColor: 'color-mix(in srgb, var(--td-card) 10%, transparent)',
            }}
          >
            {skill.miniChallenge}
          </p>
        </Section>

        {skill.steps.length > 0 && (
          <Section label="Steps">
            <ol className="space-y-4">
              {skill.steps.map((step, i) => (
                <li key={i} className="flex gap-4">
                  <span className="td-display w-7 shrink-0 pt-px text-[17px] font-bold text-[var(--td-card)]">
                    {i + 1}
                  </span>
                  <span className="text-[15.5px] leading-relaxed text-[var(--td-text)]">{step}</span>
                </li>
              ))}
            </ol>
          </Section>
        )}

        {skill.completionCriteria.length > 0 && (
          <Section label="You'll know you've got it when">
            <ul className="space-y-2.5">
              {skill.completionCriteria.map((c, i) => (
                <li key={i} className="flex gap-3 text-[15.5px] leading-relaxed text-[var(--td-text)]">
                  <Check size={17} aria-hidden="true" className="mt-[3px] shrink-0 text-[var(--td-card)]" />
                  {c}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {skill.commonProblems && skill.commonProblems.length > 0 && (
          <Section label="If it goes sideways">
            <Bullets items={skill.commonProblems} />
          </Section>
        )}

        {skill.tips && skill.tips.length > 0 && (
          <Section label="Tips">
            <Bullets items={skill.tips} />
          </Section>
        )}

        {buildsOn.length > 0 && (
          <Section label="Builds on">
            <RelatedPills skills={buildsOn} completedSet={completedSet} />
          </Section>
        )}

        {leadsTo.length > 0 && (
          <Section label="Leads to">
            <RelatedPills skills={leadsTo} completedSet={completedSet} />
          </Section>
        )}

        <div className="mt-14">
          {isDone ? (
            <p className="inline-flex min-h-[56px] items-center gap-2.5 rounded-2xl border border-[var(--td-line)] px-6 text-[15px] font-semibold text-[var(--td-text)]">
              <CircleCheck size={19} aria-hidden="true" className="text-[var(--td-card)]" />
              Done{doneDate ? ` on ${format(parseDateKey(doneDate), 'd MMMM yyyy')}` : ''}.
            </p>
          ) : (
            <button
              type="button"
              onClick={handleComplete}
              className="td-display td-btn inline-flex min-h-[60px] w-full items-center justify-center rounded-2xl px-8 text-[18px] font-bold sm:w-auto"
              style={{ backgroundColor: color, color: CARD_INK }}
            >
              I did this
            </button>
          )}
        </div>
      </div>

      {/* Celebration — full-bleed in the card's color. */}
      <AnimatePresence>
        {celebrating && (
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0.15 : 0.3 }}
            className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto p-6"
            style={{ backgroundColor: color, color: CARD_INK }}
          >
            <div className="w-full max-w-[460px] text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em]" style={{ color: CARD_INK_SOFT }}>
                {isTodays ? "Today's card" : 'One more for your days'}
              </p>
              <h2 className="td-display mt-4 text-[clamp(3rem,10vw,4.8rem)] font-bold leading-none tracking-tight">
                Done.
              </h2>
              <p className="mt-5 text-[19px] font-semibold">{skill.title}</p>
              <p className="mt-3 text-[15.5px] leading-relaxed" style={{ color: CARD_INK_SOFT }}>
                {isTodays ? (
                  <>
                    That was today&rsquo;s. Come back tomorrow — the deck leans toward{' '}
                    <strong style={{ color: CARD_INK }}>
                      {tomorrowHint(dateKey, new Set([...completedSet, skill.id]))}
                    </strong>
                    .
                  </>
                ) : (
                  <>Quietly written into your days. No scores, no streaks — it just counts.</>
                )}
              </p>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                <Link
                  to={TODAY_BASE}
                  className="td-display td-btn inline-flex min-h-[52px] items-center justify-center rounded-2xl px-7 text-[15.5px] font-bold"
                  style={{ backgroundColor: CARD_INK, color }}
                >
                  Back to today
                </Link>
                <button
                  type="button"
                  onClick={() => setCelebrating(false)}
                  className="td-btn inline-flex min-h-[52px] items-center rounded-2xl px-4 text-[14.5px] font-semibold"
                  style={{ color: CARD_INK }}
                >
                  Stay here
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Full skill detail — every content field, designed for a long scroll. */
export default function SkillPage() {
  const { skillId } = useParams();
  const skill = skillId ? SKILL_MAP[skillId] : undefined;
  if (!skill) return <Navigate to={TODAY_BASE} replace />;
  return <SkillDetail key={skill.id} skill={skill} />;
}
