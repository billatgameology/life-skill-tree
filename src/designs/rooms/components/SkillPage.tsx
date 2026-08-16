import { Link, Navigate, useParams } from 'react-router-dom';
import { Check, Flame, Pin, Square } from 'lucide-react';
import type { ReactNode } from 'react';
import { SKILL_MAP } from '@/data/skills';
import type { Skill } from '@/lib/types';
import { useRooms } from '../context';
import {
  DIFFICULTY_META,
  PLACE_MAP,
  RM_BASE,
  SECONDARY_PLACES,
  doneDate,
  domainName,
  leadsTo,
  levelLabel,
  minutesLabel,
  placeOf,
  prereqsOf,
} from '../places';

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="flex items-center gap-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--rm-amber)]">
        {label}
        <span className="h-px flex-1 bg-[var(--rm-rule)]" aria-hidden="true" />
      </h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function DotList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2.5 text-[14.5px] leading-relaxed text-[var(--rm-ink)]">
          <span
            className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--rm-amber)]"
            aria-hidden="true"
          />
          {item}
        </li>
      ))}
    </ul>
  );
}

function RelatedList({ skills, completedIds }: { skills: Skill[]; completedIds: string[] }) {
  const doneSet = new Set(completedIds);
  return (
    <ul className="flex flex-wrap gap-2">
      {skills.map((s) => (
        <li key={s.id}>
          <Link
            to={`${RM_BASE}/skill/${s.id}`}
            className="rm-lift inline-flex min-h-11 items-center gap-2 rounded-lg border border-[var(--rm-rule)] bg-[var(--rm-card)] px-3 py-2 text-[13px] text-[var(--rm-ink)]"
          >
            {doneSet.has(s.id) && <Check size={13} className="text-[var(--rm-amber)]" aria-label="Done" />}
            {s.title}
            <span className="text-[11px] text-[var(--rm-muted)]">{placeOf(s.id).short}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Full skill detail — every content field, designed for a long scroll. */
export default function SkillPage() {
  const { skillId } = useParams();
  const { completedIds, favoriteIds, completionDates, markDone, togglePin, celebrate } = useRooms();

  // Own-property check: bare indexing accepts prototype-chain keys like "constructor".
  const skill = skillId && Object.hasOwn(SKILL_MAP, skillId) ? SKILL_MAP[skillId] : undefined;
  if (!skill) return <Navigate to={RM_BASE} replace />;

  const place = placeOf(skill.id);
  const diff = DIFFICULTY_META[skill.difficulty];
  const done = completedIds.includes(skill.id);
  const pinned = favoriteIds.includes(skill.id);
  const dateLabel = doneDate(completionDates[skill.id]);
  const before = prereqsOf(skill);
  const after = leadsTo(skill);
  const alsoIn = (SECONDARY_PLACES[skill.id] ?? []).map((id) => PLACE_MAP[id]);
  const showPromise = skill.learnerPromise && skill.learnerPromise !== skill.summary;

  const handleDone = () => {
    if (markDone(skill.id)) {
      celebrate(`${place.name} just got a little brighter.`);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 pb-10 pt-6 sm:px-6">
      <Link
        to={`${RM_BASE}/room/${place.id}`}
        className="text-[13px] text-[var(--rm-muted)] hover:text-[var(--rm-ink)]"
      >
        ← {place.name}
      </Link>

      <header className="mt-4">
        <h1 className="rm-serif text-[30px] font-semibold leading-tight text-[var(--rm-ink)] sm:text-[34px]">
          {skill.title}
        </h1>
        <p className="rm-serif mt-2 text-[16.5px] italic leading-relaxed text-[var(--rm-muted)]">
          {skill.summary}
        </p>
        {showPromise && (
          <p className="mt-2 text-[14.5px] leading-relaxed text-[var(--rm-muted)]">{skill.learnerPromise}</p>
        )}

        <ul className="mt-4 flex flex-wrap items-center gap-2 text-[12px]" aria-label="About this skill">
          <li>
            <Link
              to={`${RM_BASE}/room/${place.id}`}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-[var(--rm-rule)] px-3.5 py-1 text-[var(--rm-ink)] hover:border-[var(--rm-amber)]"
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: place.tint }} aria-hidden="true" />
              {place.name}
            </Link>
          </li>
          <li className="inline-flex min-h-8 items-center rounded-full border border-[var(--rm-rule)] px-3 py-1 text-[var(--rm-muted)]">
            {domainName(skill.domain)}
          </li>
          <li className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-[var(--rm-rule)] px-3 py-1 text-[var(--rm-muted)]">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: diff.color }} aria-hidden="true" />
            {diff.label}
          </li>
          <li className="inline-flex min-h-8 items-center rounded-full border border-[var(--rm-rule)] px-3 py-1 text-[var(--rm-muted)]">
            {minutesLabel(skill.estimatedMinutes)}
          </li>
          <li className="inline-flex min-h-8 items-center rounded-full border border-[var(--rm-rule)] px-3 py-1 text-[var(--rm-muted)]">
            {levelLabel(skill.level)}
          </li>
        </ul>
      </header>

      {done && (
        <p className="mt-5 flex items-center gap-2 rounded-xl border border-[var(--rm-amber-dim)] bg-[var(--rm-card)] px-4 py-3 text-[13.5px] text-[var(--rm-ink)]">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--rm-amber)]" aria-hidden="true">
            <Check size={12} className="text-[#2A1F12]" />
          </span>
          This lamp is lit{dateLabel ? ` — done ${dateLabel}` : ''}.
        </p>
      )}

      <Section label="Why it matters">
        <p className="text-[14.5px] leading-relaxed text-[var(--rm-ink)]">{skill.whyItMatters}</p>
      </Section>

      <Section label="Where it shows up">
        <DotList items={skill.realLifeUses} />
      </Section>

      <Section label="You'll learn">
        <DotList items={skill.youWillLearn} />
      </Section>

      <Section label="The steps">
        <ol className="flex flex-col gap-3">
          {skill.steps.map((step, i) => (
            <li key={i} className="flex gap-3 text-[14.5px] leading-relaxed text-[var(--rm-ink)]">
              <span
                className="rm-serif mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--rm-amber)] text-[13px] text-[var(--rm-amber)]"
                aria-hidden="true"
              >
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </Section>

      <Section label="Give it a go">
        <div className="flex gap-3 rounded-xl border border-dashed border-[var(--rm-amber)] bg-[var(--rm-card)] p-4">
          <Flame size={18} className="mt-0.5 shrink-0 text-[var(--rm-amber)]" aria-hidden="true" />
          <p className="text-[14.5px] leading-relaxed text-[var(--rm-ink)]">{skill.miniChallenge}</p>
        </div>
      </Section>

      <Section label="You'll know it's done when">
        <ul className="flex flex-col gap-2">
          {skill.completionCriteria.map((c, i) => (
            <li key={i} className="flex gap-2.5 text-[14.5px] leading-relaxed text-[var(--rm-ink)]">
              <Square size={15} className="mt-[5px] shrink-0 text-[var(--rm-muted)]" aria-hidden="true" />
              {c}
            </li>
          ))}
        </ul>
      </Section>

      {skill.commonProblems && skill.commonProblems.length > 0 && (
        <Section label="If it goes sideways">
          <DotList items={skill.commonProblems} />
        </Section>
      )}

      {skill.tips && skill.tips.length > 0 && (
        <Section label="Notes from the house">
          <DotList items={skill.tips} />
        </Section>
      )}

      {before.length > 0 && (
        <Section label="Builds on">
          <RelatedList skills={before} completedIds={completedIds} />
        </Section>
      )}

      {after.length > 0 && (
        <Section label="Opens up">
          <RelatedList skills={after} completedIds={completedIds} />
        </Section>
      )}

      {alsoIn.length > 0 && (
        <Section label="Also found in">
          <ul className="flex flex-wrap gap-2">
            {alsoIn.map((p) => (
              <li key={p.id}>
                <Link
                  to={`${RM_BASE}/room/${p.id}`}
                  className="rm-lift inline-flex min-h-11 items-center gap-2 rounded-lg border border-[var(--rm-rule)] bg-[var(--rm-card)] px-3 py-2 text-[13px] text-[var(--rm-ink)]"
                >
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.tint }} aria-hidden="true" />
                  {p.name}
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Sticky action bar */}
      <div className="sticky bottom-4 mt-10">
        <div className="flex items-center gap-3 rounded-2xl border border-[var(--rm-rule)] bg-[rgba(21,35,39,0.95)] p-3 shadow-xl backdrop-blur">
          {done ? (
            <p className="flex min-h-11 flex-1 items-center gap-2 px-2 text-[14px] font-semibold text-[var(--rm-amber)]">
              <Check size={16} aria-hidden="true" />
              Done{dateLabel ? ` · ${dateLabel}` : ''}
            </p>
          ) : (
            <button
              type="button"
              onClick={handleDone}
              className="min-h-11 flex-1 rounded-xl bg-[var(--rm-amber)] px-5 text-[14.5px] font-bold text-[#2A1F12] hover:brightness-105"
            >
              Mark as done
            </button>
          )}
          <button
            type="button"
            onClick={() => togglePin(skill.id)}
            aria-label={pinned ? 'Unpin from the corkboard' : 'Pin to the corkboard'}
            aria-pressed={pinned}
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
              pinned
                ? 'border-[var(--rm-rose)] text-[var(--rm-rose)]'
                : 'border-[var(--rm-rule)] text-[var(--rm-muted)] hover:border-[var(--rm-rose)] hover:text-[var(--rm-rose)]'
            }`}
          >
            <Pin size={17} fill={pinned ? 'currentColor' : 'none'} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
