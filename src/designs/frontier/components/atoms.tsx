import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';
import type { Skill } from '@/lib/types';
import { DIFF_LABEL, FR_BASE, TINTS, domainName } from '../expedition';
import type { Standing } from '../expedition';

/** Mono small-caps section label, dawn-tinted when on the frontier band. */
export function BandLabel({ children, tone = 'dim' }: { children: ReactNode; tone?: 'dawn' | 'dim' | 'ember' }) {
  const color =
    tone === 'dawn' ? 'text-[var(--fr-dawn)]' : tone === 'ember' ? 'text-[var(--fr-ember)]' : 'text-[var(--fr-dim)]';
  return (
    <h2 className={`fr-mono text-[11px] font-bold uppercase tracking-[0.28em] ${color}`}>{children}</h2>
  );
}

/** Tiny domain tag: tinted dot + name in the domain's dawn pastel. */
export function DomainTag({ domain, muted = false }: { domain: Skill['domain']; muted?: boolean }) {
  return (
    <span className="fr-mono inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em]">
      <span
        aria-hidden
        className="h-[6px] w-[6px] shrink-0 rounded-full"
        style={{ backgroundColor: TINTS[domain] }}
      />
      <span style={{ color: muted ? undefined : TINTS[domain] }} className={muted ? 'text-[var(--fr-dim)]' : ''}>
        {domainName(domain)}
      </span>
    </span>
  );
}

/** The horizon progress bar: covered ground as dawn light along a night line. */
export function HorizonBar({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
      className="h-[6px] w-full overflow-hidden rounded-full bg-[var(--fr-card)]"
    >
      <div
        className="h-full rounded-full"
        style={{
          width: `${Math.max(pct, value > 0 ? 2 : 0)}%`,
          background: 'linear-gradient(to right, #B3542F, #FF8A5C 60%, #FFB454)',
        }}
      />
    </div>
  );
}

/** Standing marker used in Scout results and dense rows. */
export function StandingMark({ standing }: { standing: Standing }) {
  if (standing === 'behind') {
    return (
      <span
        aria-hidden
        className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[var(--fr-ember)]"
      >
        <Check size={11} strokeWidth={3.5} className="text-[#2A1606]" />
      </span>
    );
  }
  if (standing === 'frontier') {
    return <span aria-hidden className="h-4 w-4 shrink-0 rounded-full bg-[var(--fr-dawn)]" />;
  }
  return (
    <span aria-hidden className="h-4 w-4 shrink-0 rounded-full border-2 border-[var(--fr-faint)]" />
  );
}

/** A frontier-hand card. Pinned cards are freshly unlocked ground. */
export function FrontierCard({
  skill,
  pinned = false,
  animateIn = false,
  delay = 0,
}: {
  skill: Skill;
  pinned?: boolean;
  animateIn?: boolean;
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={animateIn && !reduceMotion ? { opacity: 0, y: 26 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 280, damping: 26, delay }}
      className="h-full"
    >
      <Link
        to={`${FR_BASE}/skill/${skill.id}`}
        className={`group flex h-full min-h-[112px] flex-col rounded-lg border bg-[var(--fr-card)] p-3.5 transition-colors hover:bg-[var(--fr-card2)] ${
          pinned ? 'border-[var(--fr-dawn)]' : 'border-[var(--fr-line)] hover:border-[var(--fr-faint)]'
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <DomainTag domain={skill.domain} />
          {pinned && (
            <span className="fr-mono rounded-sm bg-[var(--fr-dawn)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-[#2A1606]">
              New ground
            </span>
          )}
        </div>
        <p className="fr-display mt-2 text-[15.5px] font-bold leading-snug text-[var(--fr-ink)]">
          {skill.title}
        </p>
        <p className="fr-body mt-1 line-clamp-2 text-[12.5px] leading-snug text-[var(--fr-dim)]">
          {skill.summary}
        </p>
        <p className="fr-mono mt-auto pt-2.5 text-[10px] uppercase tracking-[0.14em] text-[var(--fr-faint)]">
          {skill.estimatedMinutes} min · {DIFF_LABEL[skill.difficulty]}
        </p>
      </Link>
    </motion.div>
  );
}

/** Dense tappable row for indexes, logs, and search results. */
export function SkillRow({
  skill,
  sub,
  lead,
  onNavigate,
}: {
  skill: Skill;
  sub?: ReactNode;
  lead?: ReactNode;
  onNavigate?: () => void;
}) {
  return (
    <Link
      to={`${FR_BASE}/skill/${skill.id}`}
      onClick={onNavigate}
      className="group flex min-h-[48px] items-center gap-3 rounded-md px-2.5 py-2 transition-colors hover:bg-[var(--fr-card)]"
    >
      {lead}
      <span className="min-w-0 flex-1">
        <span className="fr-body block truncate text-[14.5px] font-semibold leading-snug text-[var(--fr-ink)]">
          {skill.title}
        </span>
        {sub && (
          <span className="fr-body block truncate text-[12px] leading-snug text-[var(--fr-dim)]">{sub}</span>
        )}
      </span>
      <span className="fr-mono shrink-0 text-[10px] uppercase tracking-[0.12em] text-[var(--fr-faint)]">
        {skill.estimatedMinutes}m
      </span>
      <ChevronRight
        size={15}
        aria-hidden
        className="shrink-0 text-[var(--fr-faint)] transition-transform group-hover:translate-x-0.5"
      />
    </Link>
  );
}
