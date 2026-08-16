import { Check } from 'lucide-react';
import { CATEGORIES } from '@/data/skills';
import type { Difficulty, DomainKey } from '@/lib/types';

/** Small metadata chip — domains are metadata in Tempo, never structure. */
export function DomainChip({ domain }: { domain: DomainKey }) {
  const cat = CATEGORIES[domain];
  return (
    <span className="tp-mono inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.08em] text-[var(--tp-ink2)]">
      <span
        aria-hidden
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: cat.color }}
      />
      {cat.name}
    </span>
  );
}

const DIFF_LABEL: Record<Difficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

export function DiffTag({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span className="tp-mono text-[10px] uppercase tracking-[0.08em] text-[var(--tp-ink2)]">
      {DIFF_LABEL[difficulty]}
    </span>
  );
}

/** Red logged check — Tempo's completion mark. */
export function LoggedCheck({ label }: { label?: string }) {
  return (
    <span className="tp-mono inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--tp-red)]">
      <Check size={12} strokeWidth={3} aria-hidden />
      {label ?? 'Logged'}
    </span>
  );
}

/** The wordmark's miniature dial with a live sweep hand. */
export function DialMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" aria-hidden className="shrink-0">
      <circle cx="11" cy="11" r="9.5" fill="var(--tp-card)" stroke="var(--tp-ink)" strokeWidth="1.6" />
      <line x1="11" y1="2.4" x2="11" y2="4.6" stroke="var(--tp-ink)" strokeWidth="1.4" />
      <line x1="11" y1="17.4" x2="11" y2="19.6" stroke="var(--tp-tick)" strokeWidth="1.2" />
      <line x1="2.4" y1="11" x2="4.6" y2="11" stroke="var(--tp-tick)" strokeWidth="1.2" />
      <line x1="17.4" y1="11" x2="19.6" y2="11" stroke="var(--tp-tick)" strokeWidth="1.2" />
      <g className="tp-sweep-hand">
        <line x1="11" y1="11" x2="11" y2="3.6" stroke="var(--tp-red)" strokeWidth="1.6" strokeLinecap="round" />
      </g>
      <circle cx="11" cy="11" r="1.4" fill="var(--tp-red)" />
    </svg>
  );
}
