import { Check } from 'lucide-react';
import type { LineDef } from '../lineMeta';
import { visitedCount } from '../lineMeta';

/** The round transit-line bullet with the two-letter code. */
export function LineBullet({
  line,
  size = 'md',
  complete = false,
}: {
  line: LineDef;
  size?: 'xs' | 'sm' | 'md';
  complete?: boolean;
}) {
  const px = size === 'xs' ? 14 : size === 'sm' ? 22 : 30;
  const fontPx = size === 'xs' ? 6 : size === 'sm' ? 8 : 10;
  return (
    <span
      className="ic-mono relative inline-flex shrink-0 items-center justify-center rounded-full font-bold text-white"
      style={{
        width: px,
        height: px,
        fontSize: fontPx,
        backgroundColor: line.dark,
        boxShadow: complete ? '0 0 0 2px var(--ic-paper), 0 0 0 4px var(--ic-green)' : undefined,
      }}
      aria-hidden="true"
    >
      {size === 'xs' ? '' : line.code}
    </span>
  );
}

/**
 * Miniature strip diagram: the line as a row of proportionally spaced stop dots,
 * visited stops filled in the line color. Used everywhere progress is shown.
 */
export function LineStrip({ line, completedIds }: { line: LineDef; completedIds: string[] }) {
  const done = new Set(completedIds);
  return (
    <div className="relative flex h-[7px] w-full items-center justify-between" aria-hidden="true">
      <div
        className="absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 rounded-full"
        style={{ backgroundColor: `${line.color}40` }}
      />
      {line.stations.map((s) => (
        <span
          key={s.id}
          className="relative h-[5px] w-[5px] rounded-full"
          style={
            done.has(s.id)
              ? { backgroundColor: line.color }
              : { backgroundColor: 'var(--ic-paper)', boxShadow: `inset 0 0 0 1.2px ${line.color}88` }
          }
        />
      ))}
    </div>
  );
}

/** Visited fraction, mono, e.g. "14/24". */
export function LineFraction({ line, completedIds }: { line: LineDef; completedIds: string[] }) {
  return (
    <span className="ic-mono text-[11px] text-[var(--ic-ink2)]">
      {visitedCount(line, completedIds)}/{line.stations.length}
    </span>
  );
}

/** The station tick symbol: hollow ring, filled when visited, double-ring for interchanges. */
export function StationTick({
  color,
  visited,
  interchange = false,
  size = 16,
}: {
  color: string;
  visited: boolean;
  interchange?: boolean;
  size?: number;
}) {
  return (
    <span
      className="relative inline-flex shrink-0 items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
        backgroundColor: visited ? color : 'var(--ic-card)',
        boxShadow: interchange
          ? `inset 0 0 0 2px ${visited ? '#FFFFFF66' : color}, 0 0 0 2px var(--ic-paper), 0 0 0 3.5px ${color}`
          : `inset 0 0 0 2px ${color}`,
      }}
      aria-hidden="true"
    >
      {visited && <Check size={size * 0.6} strokeWidth={3.5} className="text-white" />}
    </span>
  );
}

/** Uppercase mono section label with a hairline, board-sign style. */
export function BoardLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2.5 flex items-center gap-3">
      <h3 className="ic-mono shrink-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ic-ink2)]">
        {children}
      </h3>
      <div className="h-px flex-1 bg-[var(--ic-rule)]" />
    </div>
  );
}
