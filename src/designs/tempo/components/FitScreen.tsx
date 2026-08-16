import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, ChevronRight } from 'lucide-react';
import type { Skill } from '@/lib/types';
import { useTempo } from '../context';
import { DIAL_STOPS, OPEN_STOP, TP_BASE, minuteBands } from '../time';
import { DiffTag, DomainChip, LoggedCheck } from './bits';

/** One fitting skill — the whole row is the tap target. */
function FitRow({ skill }: { skill: Skill }) {
  const { completedIds, favoriteIds } = useTempo();
  const done = completedIds.includes(skill.id);
  const pinned = favoriteIds.includes(skill.id);

  return (
    <Link
      to={`${TP_BASE}/skill/${skill.id}`}
      className={`group flex min-h-[56px] items-center gap-3 border-b border-[var(--tp-hairline)] px-1 py-2.5 transition-colors hover:bg-[var(--tp-card)] ${
        done ? 'opacity-60' : ''
      }`}
    >
      <span
        aria-hidden
        className={`tp-mono w-9 shrink-0 text-right text-[19px] font-bold leading-none ${
          done ? 'text-[var(--tp-ink2)]' : 'text-[var(--tp-ink)]'
        }`}
      >
        {skill.estimatedMinutes}
      </span>
      <span aria-hidden className="h-7 w-px shrink-0 bg-[var(--tp-hairline)]" />
      <span className="min-w-0 flex-1">
        <span className="tp-display block truncate text-[15px] font-semibold text-[var(--tp-ink)]">
          {skill.title}
        </span>
        <span className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5">
          <DomainChip domain={skill.domain} />
          <DiffTag difficulty={skill.difficulty} />
          {done && <LoggedCheck />}
        </span>
      </span>
      {pinned && (
        <Bookmark size={14} aria-label="Pinned" className="shrink-0 fill-[var(--tp-red)] text-[var(--tp-red)]" />
      )}
      <ChevronRight
        size={16}
        aria-hidden
        className="shrink-0 text-[var(--tp-tick)] transition-colors group-hover:text-[var(--tp-ink2)]"
      />
    </Link>
  );
}

/**
 * The primary surface: "How much time do you have?" A tactile dial of minute
 * stops; choosing one reshapes the library into exactly what fits.
 */
export default function FitScreen() {
  const { budget, setBudget, completedIds } = useTempo();
  const completed = useMemo(() => new Set(completedIds), [completedIds]);
  const bands = useMemo(() => minuteBands(budget, completed), [budget, completed]);

  const fitCount = bands.reduce((n, b) => n + b.skills.length, 0);
  const undoneCount = bands.reduce(
    (n, b) => n + b.skills.filter((s) => !completed.has(s.id)).length,
    0,
  );

  return (
    <div className="mx-auto max-w-2xl px-4 pb-24 pt-8 sm:pt-12">
      <h1 className="tp-display text-center text-[26px] font-bold leading-tight text-[var(--tp-ink)] sm:text-[32px]">
        How much time do you have?
      </h1>
      <p className="tp-sans mt-1 text-center text-[14px] text-[var(--tp-ink2)]">
        Pick a stop. Tempo shows only what fits.
      </p>

      {/* The dial — chunky minute stops. */}
      <div className="mt-6 flex justify-center gap-2 sm:gap-3" role="group" aria-label="Minute budget">
        {DIAL_STOPS.map((stop) => {
          const selected = budget === stop;
          const label = stop === OPEN_STOP ? '30+' : String(stop);
          return (
            <button
              key={stop}
              onClick={() => setBudget(stop)}
              aria-pressed={selected}
              aria-label={`${label} minutes`}
              className={`relative flex h-[72px] w-[58px] flex-col items-center justify-center rounded-md border transition-colors sm:w-[68px] ${
                selected
                  ? 'border-[var(--tp-ink)] bg-[var(--tp-ink)] text-[var(--tp-dial)]'
                  : 'border-[var(--tp-hairline)] bg-[var(--tp-card)] text-[var(--tp-ink)] hover:border-[var(--tp-ink2)]'
              }`}
            >
              {selected && (
                <span aria-hidden className="absolute inset-x-4 top-0 h-[3px] rounded-b bg-[var(--tp-red)]" />
              )}
              <span className="tp-mono text-[24px] font-bold leading-none sm:text-[27px]">{label}</span>
              <span
                className={`tp-mono mt-1 text-[9px] uppercase tracking-[0.18em] ${
                  selected ? 'text-[var(--tp-dial)] opacity-70' : 'text-[var(--tp-ink2)]'
                }`}
              >
                min
              </span>
            </button>
          );
        })}
      </div>

      {/* Readout */}
      <p className="tp-mono mt-5 text-center text-[11px] uppercase tracking-[0.14em] text-[var(--tp-ink2)]">
        <span className="font-bold text-[var(--tp-ink)]">{fitCount}</span> skills fit ·{' '}
        <span className="font-bold text-[var(--tp-red)]">{undoneCount}</span> not yet logged
      </p>
      {budget === 5 && (
        <p className="tp-sans mt-2 text-center text-[12px] text-[var(--tp-ink2)]">
          Five-minute skills are rare — the 10-minute stop is one tap away.
        </p>
      )}

      {/* Bands by exact duration — the dial's own taxonomy. */}
      <div className="mt-8">
        {bands.map((band) => (
          <section key={band.minutes} aria-label={`${band.minutes} minute skills`}>
            {/* Tailwind v3 can't apply /opacity to var() colors — use the literal. */}
            <div className="sticky top-0 z-10 flex items-baseline gap-2 border-b border-[var(--tp-ink)] bg-[#FAFAF7]/95 px-1 pb-1.5 pt-4 backdrop-blur-sm">
              <span className="tp-mono text-[15px] font-bold text-[var(--tp-ink)]">
                {band.minutes} min
              </span>
              <span className="tp-mono text-[10px] uppercase tracking-[0.14em] text-[var(--tp-ink2)]">
                {band.skills.length} {band.skills.length === 1 ? 'skill' : 'skills'}
              </span>
            </div>
            {band.skills.map((skill) => (
              <FitRow key={skill.id} skill={skill} />
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
