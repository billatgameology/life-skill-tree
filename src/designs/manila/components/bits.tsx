import { motion, useReducedMotion } from 'framer-motion';
import { stampDate } from '../derive';

/** Thin pencil-shaded progress bar (graphite on paper — never a game meter). */
export function PencilBar({ done, total, tint }: { done: number; total: number; tint?: string }) {
  const pct = total === 0 ? 0 : (done / total) * 100;
  return (
    <div className="h-[3px] w-full overflow-hidden rounded-full bg-[var(--ma-ink)]/10" aria-hidden="true">
      <div
        className="h-full rounded-full"
        style={{ width: `${pct}%`, backgroundColor: tint ?? 'var(--ma-graphite)', opacity: 0.75 }}
      />
    </div>
  );
}

/** A steel paperclip slid over a card's top edge (favorite marker). */
export function Paperclip({ size = 14 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 10 24"
      width={size * (10 / 24)}
      height={size}
      className="shrink-0"
      aria-hidden="true"
    >
      <path
        d="M 2 9 L 2 4 A 3 3 0 0 1 8 4 L 8 17 A 2 2 0 0 1 4 17 L 4 7"
        fill="none"
        stroke="#8A8F94"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Tiny red FILED mark for riffle rows and log lines. */
export function FiledMark() {
  return (
    <span className="ma-stamp -rotate-3 text-[9px] font-normal leading-none text-[var(--ma-stamp)]" aria-label="Filed">
      FILED
    </span>
  );
}

/**
 * The red FILED date stamp. `animate` plays the slam (skipped under
 * prefers-reduced-motion); `ghost` renders the faint hover preview.
 */
export function FiledStamp({
  date,
  animate = false,
  ghost = false,
}: {
  date?: string;
  animate?: boolean;
  ghost?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const label = stampDate(date);
  return (
    <motion.span
      initial={animate && !reduceMotion ? { scale: 2, opacity: 0, rotate: 4 } : false}
      animate={{ scale: 1, opacity: ghost ? 0.18 : 1, rotate: -6 }}
      transition={{ type: 'spring', stiffness: 550, damping: 23 }}
      className="ma-stamp pointer-events-none inline-block select-none rounded border-2 border-[var(--ma-stamp)] px-2.5 py-1 text-center leading-tight text-[var(--ma-stamp)]"
      style={{ boxShadow: 'inset 0 0 0 1px var(--ma-stamp)' }}
      aria-label={ghost ? undefined : `Filed${label ? ` on ${label}` : ''}`}
    >
      <span className="block text-[15px] tracking-[0.14em]">FILED</span>
      {label && <span className="block text-[9px] tracking-[0.1em]">{label}</span>}
    </motion.span>
  );
}

/** Dot-leader inventory line: "FOOD & COOKING ......... 9/24". */
export function DotLeaderRow({
  label,
  value,
  tint,
}: {
  label: string;
  value: string;
  tint?: string;
}) {
  return (
    <span className="ma-type flex items-baseline gap-1.5 text-[12px] uppercase tracking-wide">
      <span className="shrink-0 font-bold" style={{ color: tint ?? 'var(--ma-ink)' }}>
        {label}
      </span>
      <span className="min-w-4 flex-1 border-b-2 border-dotted border-[var(--ma-ink)]/30" />
      <span className="shrink-0 text-[var(--ma-ink)]">{value}</span>
    </span>
  );
}

