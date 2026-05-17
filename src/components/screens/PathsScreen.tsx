import { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, Map as MapIcon, Check } from 'lucide-react';
import { LEARNING_PATHS, PATH_MAP, type LearningPath } from '@/data/paths';
import { ALL_SKILLS, CATEGORIES } from '@/data/skills';
import type { Skill } from '@/lib/types';

interface PathsScreenProps {
  completedIds: string[];
  activePathId: string | null;
  /** Apply this path as the map filter and jump to the Skills tab. */
  onShowOnMap: (pathId: string) => void;
  onSelectSkill: (skill: Skill) => void;
  /** Mobile renders full-screen over the tab bar; desktop renders inside a panel. */
  isMobile?: boolean;
}

function pathProgress(path: LearningPath, completedIds: string[]) {
  const done = path.skillIds.filter((id) => completedIds.includes(id)).length;
  return { done, total: path.skillIds.length, pct: path.skillIds.length ? Math.round((done / path.skillIds.length) * 100) : 0 };
}

export default function PathsScreen({
  completedIds,
  activePathId,
  onShowOnMap,
  onSelectSkill,
  isMobile = false,
}: PathsScreenProps) {
  const [openPathId, setOpenPathId] = useState<string | null>(null);
  const openPath = openPathId ? PATH_MAP[openPathId] : null;

  if (openPath) {
    const { done, total, pct } = pathProgress(openPath, completedIds);
    const isActive = activePathId === openPath.id;
    const skills = openPath.skillIds
      .map((id) => ALL_SKILLS.find((s) => s.id === id))
      .filter(Boolean) as Skill[];

    return (
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-2 px-4 pb-2 pt-4">
          <button
            onClick={() => setOpenPathId(null)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface-raised/70 text-ink-dim transition-colors hover:text-ink"
            aria-label="Back to all paths"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-[10px] font-heading font-bold uppercase tracking-[0.14em] text-ink-dim">
            All Paths
          </span>
        </div>

        <div className="detail-scrollbar flex-1 overflow-y-auto px-4 pb-28">
          <div className="flex items-start gap-3">
            <div
              className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${openPath.color}1f`, border: `1px solid ${openPath.color}55` }}
            >
              <MapIcon size={20} style={{ color: openPath.color }} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="font-display text-lg leading-tight text-ink">{openPath.title}</h1>
                {isActive && (
                  <span
                    className="flex-shrink-0 rounded px-1.5 py-0.5 text-[9px] font-heading font-bold tracking-wider text-void"
                    style={{ backgroundColor: openPath.color }}
                  >
                    ON MAP
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-ink-muted">
                {total} skills · <span style={{ color: done > 0 ? openPath.color : undefined }}>{done}/{total} done</span>
              </p>
            </div>
          </div>

          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-raised">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: openPath.color }} />
          </div>

          <p className="mt-4 text-sm leading-relaxed text-ink">{openPath.summary}</p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-md border border-border bg-surface-raised px-2 py-0.5 text-[11px] font-heading font-semibold capitalize text-ink-dim">
              {openPath.difficulty}
            </span>
            <span className="flex items-center gap-1 rounded-md border border-border bg-surface-raised px-2 py-0.5 text-[11px] font-heading font-semibold text-ink-dim">
              <Clock size={10} />
              {openPath.estimatedTotalMinutes} min
            </span>
          </div>

          <div className="mt-4 space-y-1">
            <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-ink">
              What You Will Be Able to Do
            </h3>
            <p className="text-xs leading-relaxed text-ink-muted">{openPath.realLifeOutcome}</p>
          </div>

          {openPath.whenThisHelps.length > 0 && (
            <div className="mt-4 space-y-1.5">
              <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-ink">When This Helps</h3>
              <ul className="space-y-1">
                {openPath.whenThisHelps.map((w, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs leading-relaxed text-ink-muted">
                    <span className="mt-0.5 flex-shrink-0" style={{ color: openPath.color }}>-</span>
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-5 space-y-2">
            <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-ink">
              Skills in This Path · any order
            </h3>
            <div className="space-y-1.5">
              {skills.map((skill, i) => {
                const isDone = completedIds.includes(skill.id);
                const cat = CATEGORIES[skill.domain];
                return (
                  <button
                    key={skill.id}
                    onClick={() => onSelectSkill(skill)}
                    className="w-full rounded-lg border p-2.5 text-left transition-colors"
                    style={{
                      backgroundColor: isDone ? `${openPath.color}08` : '#151621',
                      borderColor: isDone ? `${openPath.color}30` : '#2A2A3A',
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                        style={{
                          backgroundColor: isDone ? `${openPath.color}30` : `${cat.color}20`,
                          color: isDone ? openPath.color : cat.color,
                        }}
                      >
                        {isDone ? <Check size={10} strokeWidth={3} /> : i + 1}
                      </span>
                      <span className={`flex-1 text-xs font-body font-medium ${isDone ? 'text-ink-dim line-through opacity-60' : 'text-ink-muted'}`}>
                        {skill.title}
                      </span>
                      <span className="text-[9px] font-heading font-semibold" style={{ color: cat.color }}>
                        {cat.name}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className={`absolute inset-x-0 ${isMobile ? 'bottom-[60px]' : 'bottom-0'} border-t border-border bg-surface/95 p-3 backdrop-blur`}>
          <button
            onClick={() => onShowOnMap(openPath.id)}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3 font-heading text-sm font-bold text-void transition-all hover:brightness-110"
            style={{ backgroundColor: openPath.color }}
          >
            {isActive ? 'Showing on map' : 'Show this path on the map'}
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="px-4 pb-2 pt-4">
        <p className="text-[10px] font-heading font-bold uppercase tracking-[0.14em] text-ink-dim">Curated journeys</p>
        <h1 className="font-display text-lg text-ink">Learning Paths</h1>
        <p className="mt-1 text-xs leading-relaxed text-ink-muted">
          A path gathers skills from across the tree that build toward a real-life goal. Learn them in any order.
        </p>
      </div>
      <div className="detail-scrollbar flex-1 space-y-2.5 overflow-y-auto px-4 pb-28 pt-1">
        {LEARNING_PATHS.map((path) => {
          const { done, total, pct } = pathProgress(path, completedIds);
          const isActive = activePathId === path.id;
          return (
            <button
              key={path.id}
              onClick={() => setOpenPathId(path.id)}
              className="w-full rounded-xl border p-3.5 text-left transition-colors"
              style={{
                backgroundColor: isActive ? `${path.color}14` : 'rgba(255,255,255,0.025)',
                borderColor: isActive ? `${path.color}88` : '#2A2A3A',
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${path.color}1f`, border: `1px solid ${path.color}44` }}
                >
                  <MapIcon size={16} style={{ color: path.color }} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-heading text-sm font-bold text-ink">{path.title}</span>
                    {isActive && (
                      <span
                        className="flex-shrink-0 rounded px-1.5 py-0.5 text-[8px] font-heading font-bold tracking-wider text-void"
                        style={{ backgroundColor: path.color }}
                      >
                        ON MAP
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[11px] text-ink-muted">
                    {total} skills ·{' '}
                    <span style={{ color: done > 0 ? path.color : undefined }}>{done}/{total} done</span>
                  </p>
                </div>
                <ChevronRight size={16} className="flex-shrink-0 text-ink-dim" />
              </div>
              <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-surface-raised">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: path.color }} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
