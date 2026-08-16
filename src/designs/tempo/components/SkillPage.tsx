import { useCallback } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { ArrowLeft, Bookmark, Check, ChevronRight, SkipForward } from 'lucide-react';
import { SKILL_MAP, getChildren } from '@/data/skills';
import type { Skill } from '@/lib/types';
import { useTempo } from '../context';
import { TP_BASE, formatDay } from '../time';
import { DiffTag, DomainChip, LoggedCheck } from './bits';

function celebrate() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  confetti({
    particleCount: 24,
    spread: 60,
    startVelocity: 24,
    gravity: 1.1,
    scalar: 0.8,
    ticks: 90,
    zIndex: 200,
    colors: ['#C81E14', '#121316', '#FAFAF7', '#C9C9C1'],
  });
}

/** Spec-sheet section: small mono label over content, hairline above. */
function Spec({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="mt-8 border-t border-[var(--tp-hairline)] pt-4">
      <h2 className="tp-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--tp-ink2)]">
        {label}
      </h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="tp-sans flex gap-2.5 text-[14.5px] leading-relaxed text-[var(--tp-ink)]">
          <span aria-hidden className="mt-[9px] h-[3px] w-[3px] shrink-0 rounded-full bg-[var(--tp-ink2)]" />
          {item}
        </li>
      ))}
    </ul>
  );
}

/** Related skill link (builds on / leads to) with its minute cost. */
function RelatedRow({ skill }: { skill: Skill }) {
  const { completedIds } = useTempo();
  const done = completedIds.includes(skill.id);
  return (
    <Link
      to={`${TP_BASE}/skill/${skill.id}`}
      className="group flex min-h-[44px] items-center gap-3 border-b border-[var(--tp-hairline)] py-2 last:border-b-0"
    >
      <span className="tp-mono w-8 shrink-0 text-right text-[14px] font-bold text-[var(--tp-ink)]">
        {skill.estimatedMinutes}
      </span>
      <span aria-hidden className="tp-mono text-[9px] uppercase text-[var(--tp-ink2)]">min</span>
      <span className="tp-display min-w-0 flex-1 truncate text-[14px] font-semibold text-[var(--tp-ink)]">
        {skill.title}
      </span>
      {done && <LoggedCheck />}
      <ChevronRight size={14} aria-hidden className="text-[var(--tp-tick)] group-hover:text-[var(--tp-ink2)]" />
    </Link>
  );
}

function SkillDetail({ skill }: { skill: Skill }) {
  const navigate = useNavigate();
  const {
    completedIds,
    completionDates,
    favoriteIds,
    logSkill,
    togglePin,
    session,
    completeCurrentSlot,
    skipCurrentSlot,
  } = useTempo();

  const done = completedIds.includes(skill.id);
  const pinned = favoriteIds.includes(skill.id);
  const loggedOn = completionDates[skill.id];
  const inSession = session?.stage === 'run' && session.slots[session.current] === skill.id;

  const prereqs = skill.suggestedPrerequisites
    .map((id) => SKILL_MAP[id])
    .filter((s): s is (typeof SKILL_MAP)[string] => Boolean(s));
  const leadsTo = getChildren(skill.id);

  const handleDone = useCallback(() => {
    if (inSession) {
      const { ok, nextId } = completeCurrentSlot();
      if (!ok) return;
      celebrate();
      if (nextId) navigate(`${TP_BASE}/skill/${nextId}`);
      else navigate(`${TP_BASE}/session`);
      return;
    }
    if (logSkill(skill.id)) celebrate();
  }, [inSession, completeCurrentSlot, logSkill, navigate, skill.id]);

  const handleSkip = useCallback(() => {
    const nextId = skipCurrentSlot();
    if (nextId) navigate(`${TP_BASE}/skill/${nextId}`);
    else navigate(`${TP_BASE}/session`);
  }, [skipCurrentSlot, navigate]);

  const showPromise = skill.learnerPromise && skill.learnerPromise !== skill.summary;

  return (
    <div className="mx-auto max-w-2xl px-4 pb-24 pt-5">
      <Link
        to={TP_BASE}
        className="tp-mono inline-flex min-h-[44px] items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-[var(--tp-ink2)] transition-colors hover:text-[var(--tp-ink)]"
      >
        <ArrowLeft size={13} aria-hidden />
        All durations
      </Link>

      {/* Chrono header — the minute cost leads, always. */}
      <div className="mt-3 flex items-end gap-4 border-b-2 border-[var(--tp-ink)] pb-4">
        <div className="shrink-0 text-center">
          <span className="tp-mono block text-[56px] font-bold leading-none text-[var(--tp-ink)]">
            {skill.estimatedMinutes}
          </span>
          <span className="tp-mono mt-1 block text-[9px] uppercase tracking-[0.24em] text-[var(--tp-red)]">
            minutes
          </span>
        </div>
        <div className="min-w-0 pb-0.5">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <DomainChip domain={skill.domain} />
            <DiffTag difficulty={skill.difficulty} />
          </div>
          <h1 className="tp-display mt-1 text-[24px] font-bold leading-tight text-[var(--tp-ink)] sm:text-[28px]">
            {skill.title}
          </h1>
        </div>
      </div>

      <p className="tp-sans mt-4 text-[16px] leading-relaxed text-[var(--tp-ink)]">{skill.summary}</p>
      {showPromise && (
        <p className="tp-sans mt-2 text-[14px] leading-relaxed text-[var(--tp-ink2)]">
          {skill.learnerPromise}
        </p>
      )}

      {/* Actions */}
      <div className="mt-5 flex flex-wrap items-center gap-2.5">
        {done ? (
          <span className="tp-mono inline-flex h-12 items-center gap-2 rounded-md border border-[var(--tp-red)] px-4 text-[12px] font-bold uppercase tracking-[0.1em] text-[var(--tp-red)]">
            <Check size={15} strokeWidth={3} aria-hidden />
            Logged{loggedOn ? ` · ${formatDay(loggedOn)}` : ''}
          </span>
        ) : (
          <button
            onClick={handleDone}
            className="tp-display inline-flex h-12 items-center gap-2 rounded-md bg-[var(--tp-ink)] px-5 text-[14px] font-bold text-[var(--tp-dial)] transition-opacity hover:opacity-85"
          >
            <Check size={16} strokeWidth={3} aria-hidden />
            {inSession ? `Done — log ${skill.estimatedMinutes} min & next` : `Done — log ${skill.estimatedMinutes} min`}
          </button>
        )}

        {inSession && done && (
          <button
            onClick={handleSkip}
            className="tp-display inline-flex h-12 items-center gap-2 rounded-md bg-[var(--tp-ink)] px-5 text-[14px] font-bold text-[var(--tp-dial)] transition-opacity hover:opacity-85"
          >
            Next in session
            <ChevronRight size={16} aria-hidden />
          </button>
        )}

        {inSession && !done && (
          <button
            onClick={handleSkip}
            className="tp-mono inline-flex h-12 items-center gap-1.5 rounded-md border border-[var(--tp-hairline)] px-4 text-[11px] uppercase tracking-[0.1em] text-[var(--tp-ink2)] transition-colors hover:border-[var(--tp-ink2)] hover:text-[var(--tp-ink)]"
          >
            <SkipForward size={13} aria-hidden />
            Skip
          </button>
        )}

        <button
          onClick={() => togglePin(skill.id)}
          aria-label={pinned ? 'Unpin this skill' : 'Pin this skill for later'}
          aria-pressed={pinned}
          className={`inline-flex h-12 w-12 items-center justify-center rounded-md border transition-colors ${
            pinned
              ? 'border-[var(--tp-red)] text-[var(--tp-red)]'
              : 'border-[var(--tp-hairline)] text-[var(--tp-ink2)] hover:border-[var(--tp-ink2)] hover:text-[var(--tp-ink)]'
          }`}
        >
          <Bookmark size={18} className={pinned ? 'fill-[var(--tp-red)]' : ''} aria-hidden />
        </button>
      </div>

      <Spec label="Why it matters">
        <p className="tp-sans text-[14.5px] leading-relaxed text-[var(--tp-ink)]">{skill.whyItMatters}</p>
      </Spec>

      {skill.realLifeUses.length > 0 && (
        <Spec label="Real-life uses">
          <Bullets items={skill.realLifeUses} />
        </Spec>
      )}

      {skill.youWillLearn.length > 0 && (
        <Spec label="You will learn">
          <Bullets items={skill.youWillLearn} />
        </Spec>
      )}

      {skill.steps.length > 0 && (
        <Spec label="Steps">
          <ol className="space-y-3">
            {skill.steps.map((step, i) => (
              <li key={step} className="flex gap-3">
                <span className="tp-mono mt-0.5 shrink-0 text-[13px] font-bold text-[var(--tp-red)]">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="tp-sans text-[14.5px] leading-relaxed text-[var(--tp-ink)]">{step}</span>
              </li>
            ))}
          </ol>
        </Spec>
      )}

      {skill.completionCriteria.length > 0 && (
        <Spec label="Done when">
          <ul className="space-y-2">
            {skill.completionCriteria.map((c) => (
              <li key={c} className="tp-sans flex gap-2.5 text-[14.5px] leading-relaxed text-[var(--tp-ink)]">
                <span
                  aria-hidden
                  className="mt-[5px] h-3 w-3 shrink-0 rounded-[2px] border-[1.5px] border-[var(--tp-ink2)]"
                />
                {c}
              </li>
            ))}
          </ul>
        </Spec>
      )}

      <Spec label="Mini challenge">
        <div className="rounded-md border-l-[3px] border-[var(--tp-red)] bg-[var(--tp-card)] px-4 py-3">
          <p className="tp-sans text-[14.5px] leading-relaxed text-[var(--tp-ink)]">{skill.miniChallenge}</p>
        </div>
      </Spec>

      {skill.tips && skill.tips.length > 0 && (
        <Spec label="Tips">
          <Bullets items={skill.tips} />
        </Spec>
      )}

      {skill.commonProblems && skill.commonProblems.length > 0 && (
        <Spec label="Common problems">
          <Bullets items={skill.commonProblems} />
        </Spec>
      )}

      {prereqs.length > 0 && (
        <Spec label="Builds on">
          <div>
            {prereqs.map((p) => (
              <RelatedRow key={p.id} skill={p} />
            ))}
          </div>
        </Spec>
      )}

      {leadsTo.length > 0 && (
        <Spec label="Leads to">
          <div>
            {leadsTo.map((c) => (
              <RelatedRow key={c.id} skill={c} />
            ))}
          </div>
        </Spec>
      )}

      <p className="tp-mono mt-10 border-t border-[var(--tp-hairline)] pt-3 text-[10px] uppercase tracking-[0.18em] text-[var(--tp-ink2)]">
        Est. {skill.estimatedMinutes} min · {skill.difficulty}
      </p>
    </div>
  );
}

export default function SkillPage() {
  const { skillId } = useParams();
  const skill = skillId ? SKILL_MAP[skillId] : undefined;
  if (!skill) return <Navigate to={TP_BASE} replace />;
  return <SkillDetail skill={skill} />;
}
