import { useRef, useState, useCallback } from 'react';
import { Check, GripVertical, Map, Clock, ArrowRight } from 'lucide-react';
import type { LearningPath } from '@/data/paths';
import { ALL_SKILLS, CATEGORIES } from '@/data/skills';
import type { Skill } from '@/lib/types';

interface PathDetailPanelProps {
  path: LearningPath | null;
  completedIds: string[];
  onSelectSkill: (skill: Skill) => void;
}

const MIN_WIDTH = 320;
const MAX_WIDTH = 640;
const DEFAULT_WIDTH = 420;

export default function PathDetailPanel({
  path,
  completedIds,
  onSelectSkill,
}: PathDetailPanelProps) {
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const panelRef = useRef<HTMLDivElement>(null);
  const isResizingRef = useRef(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(DEFAULT_WIDTH);

  const stopResize = useCallback(() => {
    if (!isResizingRef.current) return;
    isResizingRef.current = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    if (panelRef.current) {
      const finalWidth = panelRef.current.getBoundingClientRect().width;
      setWidth(Math.round(finalWidth));
    }
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizingRef.current) return;
    const delta = startXRef.current - e.clientX;
    const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidthRef.current + delta));
    if (panelRef.current) {
      panelRef.current.style.width = `${newWidth}px`;
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    stopResize();
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove, stopResize]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isResizingRef.current = true;
    startXRef.current = e.clientX;
    startWidthRef.current = width;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [width, handleMouseMove, handleMouseUp]);

  const ResizeHandle = () => (
    <div
      onMouseDown={handleMouseDown}
      className="absolute left-0 top-0 bottom-0 w-4 -translate-x-1/2 cursor-col-resize z-20 group flex items-center justify-center"
      title="Drag to resize"
    >
      <div className="w-px h-8 rounded-full bg-border group-hover:bg-glow-gold/50 transition-colors" />
      <GripVertical size={10} className="absolute text-ink-dim/30 group-hover:text-glow-gold/60 transition-colors" />
    </div>
  );

  if (!path) {
    return (
      <div
        ref={panelRef}
        className="flex-shrink-0 h-full bg-surface border-l border-border flex flex-col items-center justify-center text-center px-8 select-none relative"
        style={{ width }}
      >
        <ResizeHandle />
        <div className="w-16 h-16 rounded-full bg-surface-raised border border-border flex items-center justify-center mb-4">
          <Map size={28} className="text-ink-dim/40" />
        </div>
        <p className="text-ink-dim text-sm font-heading font-semibold mb-1">Select a Skill or Path</p>
        <p className="text-ink-dim/60 text-xs font-body">Click any node or path card to view details</p>
      </div>
    );
  }

  const pathSkills = path.skillIds
    .map(id => ALL_SKILLS.find(s => s.id === id))
    .filter(Boolean) as Skill[];

  const completedCount = pathSkills.filter(s => completedIds.includes(s.id)).length;
  const progressPercent = pathSkills.length > 0 ? (completedCount / pathSkills.length) * 100 : 0;

  return (
    <div
      ref={panelRef}
      className="flex-shrink-0 h-full bg-surface border-l border-border flex flex-col overflow-hidden relative"
      style={{ width }}
    >
      <ResizeHandle />

      {/* Header */}
      <div
        className="relative flex-shrink-0 pt-6 pb-4 px-5 text-center"
        style={{ backgroundColor: `${path.color}10`, borderBottom: `1px solid ${path.color}30` }}
      >
        <span
          className="inline-block px-3 py-0.5 rounded-full text-[11px] font-heading font-semibold text-white mb-3"
          style={{ backgroundColor: `${path.color}90` }}
        >
          Learning Path
        </span>

        <div
          className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center text-lg relative"
          style={{
            backgroundColor: `${path.color}20`,
            border: `2px solid ${path.color}60`,
            boxShadow: `0 0 12px ${path.color}20`,
          }}
        >
          <Map size={22} style={{ color: path.color }} />
        </div>

        <h2 className="font-heading text-base text-ink font-semibold mb-2 leading-tight">
          {path.title}
        </h2>

        <p className="text-ink-muted text-xs font-body leading-relaxed mb-3">
          {path.learnerGoal}
        </p>

        {/* Progress bar */}
        <div className="w-full max-w-[200px] mx-auto">
          <div className="flex items-center justify-between text-[10px] text-ink-dim mb-1">
            <span>{completedCount} of {pathSkills.length} done</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-surface-raised border border-border overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%`, backgroundColor: path.color }}
            />
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 no-scrollbar">
        {/* Summary */}
        <p className="text-ink font-body text-sm leading-relaxed font-medium">
          {path.summary}
        </p>

        {/* Meta badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2 py-0.5 rounded-md bg-surface-raised border border-border text-[11px] text-ink-dim font-heading font-semibold capitalize">
            {path.difficulty}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-surface-raised border border-border text-[11px] text-ink-dim font-heading font-semibold flex items-center gap-1">
            <Clock size={10} />
            {path.estimatedTotalMinutes} min
          </span>
          <span className="px-2 py-0.5 rounded-md bg-surface-raised border border-border text-[11px] text-ink-dim font-heading font-semibold">
            {path.skillIds.length} skills
          </span>
        </div>

        {/* Real-Life Outcome */}
        <div className="space-y-1">
          <h3 className="font-heading font-bold text-ink text-xs uppercase tracking-wider">
            What You Will Be Able to Do
          </h3>
          <p className="text-ink-muted font-body text-xs leading-relaxed">
            {path.realLifeOutcome}
          </p>
        </div>

        {/* When This Helps */}
        {path.whenThisHelps.length > 0 && (
          <div className="space-y-1.5">
            <h3 className="font-heading font-bold text-ink text-xs uppercase tracking-wider">
              When This Helps
            </h3>
            <ul className="space-y-1">
              {path.whenThisHelps.map((use, i) => (
                <li key={i} className="text-ink-muted font-body text-xs leading-relaxed flex items-start gap-2">
                  <span style={{ color: path.color }} className="mt-0.5 flex-shrink-0">-</span>
                  {use}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Skills in this path */}
        <div className="space-y-2">
          <h3 className="font-heading font-bold text-ink text-xs uppercase tracking-wider">
            Skills in This Path
          </h3>
          <div className="space-y-1.5">
            {pathSkills.map((skill, i) => {
              const isDone = completedIds.includes(skill.id);
              const skillCat = CATEGORIES[skill.domain];
              return (
                <button
                  key={skill.id}
                  onClick={() => onSelectSkill(skill)}
                  className="w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer group"
                  style={{
                    backgroundColor: isDone ? `${path.color}08` : '#151621',
                    borderColor: isDone ? `${path.color}30` : '#2A2A3A',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                      style={{
                        backgroundColor: isDone ? `${path.color}30` : `${skillCat.color}20`,
                        color: isDone ? path.color : skillCat.color,
                      }}
                    >
                      {isDone ? <Check size={10} strokeWidth={3} /> : i + 1}
                    </span>
                    <span className={`text-xs font-body font-medium flex-1 ${isDone ? 'text-ink-dim line-through opacity-60' : 'text-ink-muted group-hover:text-ink'}`}>
                      {skill.title}
                    </span>
                    <ArrowRight size={10} className="flex-shrink-0 text-ink-dim/30 group-hover:text-ink-dim/60 transition-colors" />
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 ml-7">
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded-full font-heading font-semibold"
                      style={{
                        backgroundColor: `${skillCat.color}15`,
                        color: skillCat.color,
                      }}
                    >
                      {skillCat.name}
                    </span>
                    <span className="text-[9px] text-ink-dim/50">{skill.estimatedMinutes}m</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
