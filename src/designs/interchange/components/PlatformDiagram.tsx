import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Eye, EyeOff, Flag } from 'lucide-react';
import type { DomainKey, Skill } from '@/lib/types';
import { useInterchange } from '../context';
import {
  IC_BASE,
  LINE_MAP,
  STATIONS,
  crossLinePrereqs,
  visitedCount,
  zonesOf,
  type LineDef,
} from '../lineMeta';
import { LineBullet, LineStrip, StationTick } from './atoms';

/** The 8px line segment running through a row's gutter. */
function LineSegment({ color, cap }: { color: string; cap?: 'top' | 'bottom' }) {
  return (
    <span
      className={`absolute left-1/2 w-[8px] -translate-x-1/2 ${
        cap === 'top'
          ? 'bottom-0 top-3 rounded-t-full'
          : cap === 'bottom'
            ? 'bottom-3 top-0 rounded-b-full'
            : 'inset-y-0'
      }`}
      style={{ backgroundColor: color }}
    />
  );
}

function StationRow({ skill, hideVisited }: { skill: Skill; hideVisited: boolean }) {
  const { completedIds, favoriteIds } = useInterchange();
  const info = STATIONS[skill.id];
  const line = info.line;
  const visited = completedIds.includes(skill.id);
  const saved = favoriteIds.includes(skill.id);
  const connections = crossLinePrereqs(skill);

  // Collapsed: a small filled tick keeps the line continuous without the noise.
  if (visited && hideVisited) {
    return (
      <div className="relative grid grid-cols-[64px_1fr] sm:grid-cols-[80px_1fr]">
        <div className="relative h-7">
          <LineSegment color={line.color} />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <StationTick color={line.color} visited size={10} />
          </span>
        </div>
      </div>
    );
  }

  return (
    <Link
      to={`${IC_BASE}/station/${skill.id}`}
      className="group relative grid min-h-[60px] grid-cols-[64px_1fr_auto] items-center border-b border-[var(--ic-rule)] transition-colors hover:bg-[var(--ic-card)] sm:grid-cols-[80px_1fr_auto]"
    >
      <div className="relative self-stretch">
        <LineSegment color={line.color} />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <StationTick color={line.color} visited={visited} interchange={connections.length > 0} />
        </span>
      </div>

      <div className="min-w-0 py-2.5 pr-3">
        <p className="flex items-center gap-1.5 text-[14px] font-bold leading-tight">
          <span className={visited ? 'text-[var(--ic-ink2)]' : ''}>{skill.title}</span>
          {connections.map((c) => (
            <span key={c.skill.id} title={`Connects from ${c.skill.title} · ${c.line.name} line`}>
              <LineBullet line={c.line} size="xs" />
            </span>
          ))}
        </p>
        <p className="mt-0.5 truncate text-[12px] leading-snug text-[var(--ic-ink2)]">
          {skill.summary}
        </p>
      </div>

      <div className="flex items-center gap-2 py-2.5 pr-3 sm:pr-5">
        {saved && <Flag size={12} className="fill-[var(--ic-amber)] text-[var(--ic-amber)]" />}
        <span className="hidden text-right sm:block">
          <span className="ic-mono block text-[11px] text-[var(--ic-ink2)]">
            {skill.estimatedMinutes} min
          </span>
          <span className="block text-[10px] capitalize text-[var(--ic-ink2)]">
            {skill.difficulty}
          </span>
        </span>
        <span className="ic-mono text-[10px] text-[var(--ic-ink2)] sm:hidden">
          {skill.estimatedMinutes}m
        </span>
      </div>
    </Link>
  );
}

/** One line's full vertical platform diagram, banded into zones. */
function DiagramInner({ line }: { line: LineDef }) {
  const { completedIds } = useInterchange();
  const [hideVisited, setHideVisited] = useState(false);

  const zones = zonesOf(line);
  const visited = visitedCount(line, completedIds);
  const done = new Set(completedIds);

  return (
    <div className="mx-auto max-w-[880px] pb-10">
      {/* Line header */}
      <div className="px-4 pb-4 pt-6 sm:px-6">
        <div className="flex items-center gap-3">
          <LineBullet line={line} complete={visited === line.stations.length} />
          <h1 className="min-w-0 flex-1 truncate text-2xl font-extrabold tracking-tight">
            {line.name} <span className="font-normal text-[var(--ic-ink2)]">line</span>
          </h1>
          {visited > 0 && (
            <button
              onClick={() => setHideVisited((v) => !v)}
              className="flex items-center gap-1.5 rounded-md border border-[var(--ic-rule)] bg-[var(--ic-card)] px-2.5 py-1.5 text-[11px] font-semibold text-[var(--ic-ink2)] transition-colors hover:text-[var(--ic-ink)]"
            >
              {hideVisited ? <Eye size={13} /> : <EyeOff size={13} />}
              {hideVisited ? 'Show visited' : 'Hide visited'}
            </button>
          )}
        </div>
        <p className="ic-mono mt-2 text-[11px] uppercase tracking-wider text-[var(--ic-ink2)]">
          {line.stations.length} stops · {visited} visited
        </p>
        <div className="mt-2.5 max-w-sm">
          <LineStrip line={line} completedIds={completedIds} />
        </div>
      </div>

      {/* Terminus cap */}
      <div className="relative grid grid-cols-[64px_1fr] sm:grid-cols-[80px_1fr]">
        <div className="relative h-10">
          <LineSegment color={line.color} cap="top" />
        </div>
        <div className="flex items-center">
          <span
            className="ic-mono rounded-full px-2.5 py-1 text-[10px] font-bold text-white"
            style={{ backgroundColor: line.dark }}
          >
            {line.code} LINE
          </span>
        </div>
      </div>

      {zones.map((zone, zi) => {
        const zoneVisited = zone.stations.reduce((n, s) => n + (done.has(s.id) ? 1 : 0), 0);
        return (
          <section key={zone.level} className={zi % 2 === 1 ? 'bg-[var(--ic-band)]' : ''}>
            {/* Sticky zone header — carries its own line segment so the line stays continuous. */}
            <div
              className={`sticky top-0 z-10 grid grid-cols-[64px_1fr] border-y border-[var(--ic-rule)] sm:grid-cols-[80px_1fr] ${
                zi % 2 === 1 ? 'bg-[var(--ic-band)]' : 'bg-[var(--ic-paper)]'
              }`}
            >
              <div className="relative">
                <LineSegment color={line.color} />
              </div>
              <p className="ic-mono py-1.5 pr-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ic-ink2)]">
                {zone.label} · {zoneVisited} of {zone.stations.length} visited
              </p>
            </div>
            {zone.stations.map((skill) => (
              <StationRow key={skill.id} skill={skill} hideVisited={hideVisited} />
            ))}
          </section>
        );
      })}

      {/* End of line */}
      <div className="relative grid grid-cols-[64px_1fr] sm:grid-cols-[80px_1fr]">
        <div className="relative h-8">
          <LineSegment color={line.color} cap="bottom" />
        </div>
        <p className="ic-mono self-center text-[10px] uppercase tracking-wider text-[var(--ic-ink2)]">
          End of line
        </p>
      </div>
    </div>
  );
}

export default function PlatformDiagram() {
  const { domain } = useParams();
  const line = domain ? LINE_MAP[domain as DomainKey] : undefined;
  if (!line) return <Navigate to={IC_BASE} replace />;
  // Keyed so per-line state (the hide-visited toggle) resets when switching lines.
  return <DiagramInner key={line.domain} line={line} />;
}
