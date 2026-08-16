import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import type { ReactNode } from 'react';
import { CATEGORIES } from '@/data/skills';
import { useTrail } from '../context';
import { TR_BASE, TRAIL_TINTS, type TrailStop } from '../derive';

/** Mono uppercase section label, pine ink. */
export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <h2 className="tr-mono mb-2.5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--tr-pine)]">
      <span aria-hidden="true" className="h-[7px] w-[7px] rotate-45 border-[1.5px] border-[var(--tr-pine)]" />
      {children}
    </h2>
  );
}

/** The painted trail-blaze mark: a small vertical bar, like paint on a tree. */
export function BlazeMark({ className = '' }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block h-[15px] w-[7px] rounded-[2px] bg-white ${className}`}
    />
  );
}

/** A tappable chip for a junction waypoint (earlier prereq / later dependent). */
export function StopChip({ stop }: { stop: TrailStop }) {
  const { completedIds } = useTrail();
  const done = completedIds.includes(stop.skill.id);
  const tint = TRAIL_TINTS[stop.skill.domain];
  return (
    <Link
      to={`${TR_BASE}/skill/${stop.skill.id}`}
      className="flex min-h-[44px] items-center gap-2.5 rounded-lg border border-[var(--tr-rule)] bg-[var(--tr-panel)] px-3 py-2 transition-colors hover:border-[var(--tr-ink2)]"
    >
      <span
        aria-hidden="true"
        className="tr-mono flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 bg-[var(--tr-ground)] text-[9px] font-bold text-[var(--tr-ink2)]"
        style={{ borderColor: done ? 'var(--tr-berry)' : tint, backgroundColor: done ? 'var(--tr-berry)' : undefined }}
      >
        {done ? <BlazeMark className="h-[11px] w-[5px]" /> : stop.num}
      </span>
      <span className="min-w-0">
        <span className={`block truncate text-[13px] font-bold leading-tight ${done ? 'text-[var(--tr-ink2)]' : ''}`}>
          {stop.skill.title}
        </span>
        <span className="tr-mono block text-[9.5px] uppercase tracking-wider text-[var(--tr-ink2)]">
          Waypoint {stop.numLabel} · {CATEGORIES[stop.skill.domain].name}
        </span>
      </span>
      {done && <Check size={13} strokeWidth={3} className="ml-auto shrink-0 text-[var(--tr-berry)]" />}
    </Link>
  );
}
