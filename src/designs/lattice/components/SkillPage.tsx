import { useCallback } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { format, parseISO } from 'date-fns';
import { useReducedMotion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowLeft,
  ArrowUpLeft,
  Check,
  Lightbulb,
  Star,
  Zap,
} from 'lucide-react';
import { CATEGORIES, SKILL_MAP } from '@/data/skills';
import type { Skill } from '@/lib/types';
import {
  LAT_BASE,
  NET_OF,
  REFDES,
  downstreamOf,
  padState,
  upstreamOf,
} from '../graph';
import { useLattice } from '../context';

const DIFFICULTY_COLOR: Record<Skill['difficulty'], string> = {
  easy: '#8FD19E',
  medium: '#F0C33C',
  hard: '#E58A8A',
};

function stamp(iso: string | undefined): string {
  if (!iso) return '';
  try {
    return format(parseISO(iso), 'MMM d, yyyy');
  } catch {
    return iso;
  }
}

function Section({ kicker, children }: { kicker: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-[var(--lt-line)] py-6">
      <h2 className="lt-mono mb-3.5 text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--lt-copper)]">
        {kicker}
      </h2>
      {children}
    </section>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 text-[14px] leading-relaxed text-[var(--lt-silk)]">
          <span
            className="mt-[7px] h-2 w-2 shrink-0 rounded-full border border-[var(--lt-copper)] bg-[var(--lt-well)]"
            aria-hidden="true"
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function WalkLink({ skill, dir }: { skill: Skill; dir: 'up' | 'down' }) {
  const { completedSet } = useLattice();
  const state = padState(skill, completedSet);
  const Icon = dir === 'up' ? ArrowUpLeft : ArrowDownRight;
  return (
    <Link
      to={`${LAT_BASE}/skill/${skill.id}`}
      className="flex min-h-[52px] items-center gap-3 rounded-md border border-[var(--lt-line)] bg-[var(--lt-panel)] px-3.5 py-2.5 transition-colors hover:border-[var(--lt-copper)]"
    >
      {state === 'soldered' ? (
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[var(--lt-gold)] text-[var(--lt-gold-ink)]">
          <Check className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
      ) : state === 'live' ? (
        <Zap
          className="h-5 w-5 shrink-0 text-[var(--lt-gold)]"
          fill="currentColor"
          aria-hidden="true"
        />
      ) : (
        <span
          className="ml-1 mr-1 h-3 w-3 shrink-0 rounded-full border border-[#4A6B57]"
          aria-hidden="true"
        />
      )}
      <span className="min-w-0 flex-1">
        <span className="lt-mono block text-[8px] uppercase tracking-[0.16em] text-[var(--lt-dim)]">
          {REFDES[skill.id]} · {skill.estimatedMinutes} min
        </span>
        <span className="block truncate text-[13.5px] font-semibold text-[var(--lt-silk)]">
          {skill.title}
        </span>
      </span>
      <Icon className="h-4 w-4 shrink-0 text-[var(--lt-copper)]" aria-hidden="true" />
    </Link>
  );
}

export default function SkillPage() {
  const { skillId } = useParams();
  const { completedSet, completionDates, solder, togglePin, favoriteIds } = useLattice();
  const reducedMotion = useReducedMotion();

  const skill = skillId ? SKILL_MAP[skillId] : undefined;

  const handleSolder = useCallback(() => {
    if (!skill || completedSet.has(skill.id)) return;
    const ok = solder(skill.id);
    if (ok && !reducedMotion) {
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.3 },
        colors: ['#F0C33C', '#D98E4A', '#E9F4EB'],
        disableForReducedMotion: true,
      });
    }
  }, [skill, completedSet, solder, reducedMotion]);

  if (!skill) return <Navigate to={LAT_BASE} replace />;

  const net = NET_OF[skill.id];
  const soldered = completedSet.has(skill.id);
  const pinned = favoriteIds.includes(skill.id);
  const upstream = upstreamOf(skill);
  const downstream = downstreamOf(skill);
  const state = padState(skill, completedSet);
  const date = stamp(completionDates[skill.id]);

  return (
    <div className="mx-auto max-w-[880px] px-4 pb-24 pt-6 sm:px-6">
      {/* Location line */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {net ? (
          <Link
            to={`${LAT_BASE}/net/${net.id}?focus=${skill.id}`}
            className="lt-mono inline-flex min-h-11 items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-[var(--lt-dim)] hover:text-[var(--lt-silk)]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            On {net.label} · {net.signal}
          </Link>
        ) : (
          <Link
            to={LAT_BASE}
            className="lt-mono inline-flex min-h-11 items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-[var(--lt-dim)] hover:text-[var(--lt-silk)]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Loose pin — no traces
          </Link>
        )}
        <span className="lt-mono ml-auto text-[10px] uppercase tracking-[0.2em] text-[var(--lt-copper)]">
          {REFDES[skill.id]}
        </span>
      </div>

      {/* Datasheet head */}
      <header className="mt-3">
        <h1 className="text-[28px] font-extrabold leading-tight tracking-tight text-[var(--lt-silk)] sm:text-[36px]">
          {skill.title}
        </h1>
        <p className="mt-2.5 max-w-[62ch] text-[15px] leading-relaxed text-[var(--lt-dim)]">
          {skill.summary}
        </p>
        {skill.learnerPromise && skill.learnerPromise !== skill.summary && (
          <p className="mt-2 max-w-[62ch] border-l-2 border-[var(--lt-copper)] pl-3 text-[13.5px] italic leading-relaxed text-[var(--lt-dim)]">
            {skill.learnerPromise}
          </p>
        )}
        <div className="lt-mono mt-4 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11px] uppercase tracking-[0.12em]">
          <span style={{ color: DIFFICULTY_COLOR[skill.difficulty] }}>{skill.difficulty}</span>
          <span className="text-[var(--lt-dim)]">{skill.estimatedMinutes} min</span>
          <span className="text-[var(--lt-dim)]">tier {skill.level}</span>
          <span className="text-[var(--lt-dim)]">{CATEGORIES[skill.domain].name}</span>
          {state === 'live' && !soldered && (
            <span className="inline-flex items-center gap-1 text-[var(--lt-gold)]">
              <Zap className="h-3 w-3" fill="currentColor" aria-hidden="true" />
              live
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleSolder}
            disabled={soldered}
            className={`lt-mono flex h-12 items-center gap-2 rounded-md px-5 text-[12px] font-bold uppercase tracking-[0.14em] transition-colors ${
              soldered
                ? 'cursor-default border border-[var(--lt-gold)] bg-transparent text-[var(--lt-gold)]'
                : 'bg-[var(--lt-gold)] text-[var(--lt-gold-ink)] hover:brightness-110'
            }`}
          >
            <Check className="h-4 w-4" aria-hidden="true" />
            {soldered ? `Soldered${date ? ` · ${date}` : ''}` : 'Mark complete'}
          </button>
          <button
            type="button"
            onClick={() => togglePin(skill.id)}
            aria-label={pinned ? 'Unpin this skill' : 'Pin this skill'}
            aria-pressed={pinned}
            className={`lt-mono flex h-12 items-center gap-2 rounded-md border px-4 text-[12px] font-bold uppercase tracking-[0.14em] transition-colors ${
              pinned
                ? 'border-[var(--lt-copper)] bg-[var(--lt-panel)] text-[var(--lt-copper)]'
                : 'border-[var(--lt-line)] bg-transparent text-[var(--lt-dim)] hover:border-[var(--lt-copper)] hover:text-[var(--lt-silk)]'
            }`}
          >
            <Star className="h-4 w-4" fill={pinned ? 'currentColor' : 'none'} aria-hidden="true" />
            {pinned ? 'Pinned' : 'Pin'}
          </button>
        </div>
      </header>

      {/* The walk — primary navigation */}
      <section className="mt-8 rounded-lg border border-[var(--lt-line)] bg-[var(--lt-well)] p-4 sm:p-5">
        <h2 className="lt-mono mb-4 text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--lt-gold)]">
          Walk the traces
        </h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <h3 className="lt-mono mb-2.5 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-[var(--lt-dim)]">
              <ArrowUpLeft className="h-3.5 w-3.5" aria-hidden="true" />
              Feeds this pad
            </h3>
            {upstream.length > 0 ? (
              <div className="space-y-2">
                {upstream.map((s) => (
                  <WalkLink key={s.id} skill={s} dir="up" />
                ))}
              </div>
            ) : (
              <p className="rounded-md border border-dashed border-[var(--lt-line)] px-3.5 py-3 text-[12.5px] text-[var(--lt-dim)]">
                No inputs — this is an entry pad. Start here freely.
              </p>
            )}
          </div>
          <div>
            <h3 className="lt-mono mb-2.5 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-[var(--lt-dim)]">
              <ArrowDownRight className="h-3.5 w-3.5" aria-hidden="true" />
              This pad drives
            </h3>
            {downstream.length > 0 ? (
              <div className="space-y-2">
                {downstream.map((s) => (
                  <WalkLink key={s.id} skill={s} dir="down" />
                ))}
              </div>
            ) : (
              <p className="rounded-md border border-dashed border-[var(--lt-line)] px-3.5 py-3 text-[12.5px] text-[var(--lt-dim)]">
                End of the trace — nothing downstream yet.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Datasheet body */}
      <div className="mt-8">
        <Section kicker="Why it matters">
          <p className="max-w-[66ch] text-[14.5px] leading-relaxed text-[var(--lt-silk)]">
            {skill.whyItMatters}
          </p>
        </Section>

        <Section kicker="Real-life uses">
          <Bullets items={skill.realLifeUses} />
        </Section>

        <Section kicker="You will learn">
          <Bullets items={skill.youWillLearn} />
        </Section>

        <Section kicker="Procedure">
          <ol className="space-y-4">
            {skill.steps.map((step, i) => (
              <li key={i} className="flex gap-4">
                <span className="lt-mono grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[var(--lt-copper)] bg-[var(--lt-panel)] text-[11px] font-bold text-[var(--lt-copper)]">
                  {i + 1}
                </span>
                <p className="pt-1 text-[14px] leading-relaxed text-[var(--lt-silk)]">{step}</p>
              </li>
            ))}
          </ol>
        </Section>

        <Section kicker="Mini challenge">
          <div className="rounded-lg border border-[var(--lt-copper)] bg-[var(--lt-panel)] p-4">
            <p className="text-[14px] leading-relaxed text-[var(--lt-silk)]">
              {skill.miniChallenge}
            </p>
          </div>
        </Section>

        <Section kicker="Completion criteria">
          <ul className="space-y-2.5">
            {skill.completionCriteria.map((c, i) => (
              <li key={i} className="flex gap-3 text-[14px] leading-relaxed text-[var(--lt-silk)]">
                <span
                  className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded border ${
                    soldered
                      ? 'border-[var(--lt-gold)] bg-[var(--lt-gold)] text-[var(--lt-gold-ink)]'
                      : 'border-[var(--lt-line)] bg-[var(--lt-well)] text-transparent'
                  }`}
                  aria-hidden="true"
                >
                  <Check className="h-3.5 w-3.5" />
                </span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
          {!soldered && (
            <button
              type="button"
              onClick={handleSolder}
              className="lt-mono mt-5 flex h-12 items-center gap-2 rounded-md bg-[var(--lt-gold)] px-5 text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--lt-gold-ink)] hover:brightness-110"
            >
              <Check className="h-4 w-4" aria-hidden="true" />
              Done it? Mark complete
            </button>
          )}
        </Section>

        {skill.commonProblems && skill.commonProblems.length > 0 && (
          <Section kicker="Common problems">
            <ul className="space-y-2.5">
              {skill.commonProblems.map((p, i) => (
                <li key={i} className="flex gap-3 text-[14px] leading-relaxed text-[var(--lt-silk)]">
                  <AlertTriangle
                    className="mt-1 h-4 w-4 shrink-0 text-[var(--lt-red)]"
                    aria-hidden="true"
                  />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {skill.tips && skill.tips.length > 0 && (
          <Section kicker="Tips">
            <ul className="space-y-2.5">
              {skill.tips.map((t, i) => (
                <li key={i} className="flex gap-3 text-[14px] leading-relaxed text-[var(--lt-silk)]">
                  <Lightbulb
                    className="mt-1 h-4 w-4 shrink-0 text-[var(--lt-gold)]"
                    aria-hidden="true"
                  />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}
      </div>
    </div>
  );
}
