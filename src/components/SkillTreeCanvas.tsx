import { useRef, useState, useCallback, useEffect } from 'react';
import { Plus, Minus, Crosshair } from 'lucide-react';
import { ALL_SKILLS, CATEGORIES, CATEGORY_KEYS, getSkillState } from '@/skills';
import type { Skill, DomainKey } from '@/lib/types';

interface SkillTreeCanvasProps {
  completedIds: string[];
  onSelectSkill: (skill: Skill) => void;
  selectedSkillId: string | null;
}

// --- Canvas dimensions (matches ALL_SKILLS from skillData) ---
const SKILL_WIDTH = 1400;
const SKILL_HEIGHT = 1100;
const CX = SKILL_WIDTH / 2;
const CY = SKILL_HEIGHT / 2;

// Pre-computed positioned skills from data file
const positionedSkills = ALL_SKILLS;

// --- Node components ---
const NODE_RADIUS_T1 = 18;
const NODE_RADIUS_T2 = 15;
const NODE_RADIUS_T3 = 13;
const ROOT_RADIUS = 24;

function getNodeRadius(skill: Skill): number {
  if (skill.id === 'root') return ROOT_RADIUS;
  if (skill.level === 1) return NODE_RADIUS_T1;
  if (skill.level === 2) return NODE_RADIUS_T2;
  return NODE_RADIUS_T3;
}

export default function SkillTreeCanvas({ completedIds, onSelectSkill, selectedSkillId }: SkillTreeCanvasProps) {
  const [activeCategories, setActiveCategories] = useState<Set<DomainKey>>(new Set(CATEGORY_KEYS));
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(0.85);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const visibleSkills = positionedSkills.filter(
    s => s.id === 'root' || activeCategories.has(s.domain)
  );

  const toggleCategory = (cat: DomainKey) => {
    setActiveCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) { if (next.size > 1) next.delete(cat); }
      else next.add(cat);
      return next;
    });
  };

  // Center the view on mount
  useEffect(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const initialPan = { x: vw / 2 - CX * 0.85, y: vh / 2 - CY * 0.85 };
    setPan(initialPan);
    panStart.current = initialPan;
  }, []);

  // Wheel zoom toward mouse cursor
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const delta = -e.deltaY * 0.001;
    const newZoom = Math.max(0.25, Math.min(2.5, zoom + delta));

    if (newZoom !== zoom) {
      // Zoom toward mouse: adjust pan so the point under mouse stays under mouse
      const zoomRatio = newZoom / zoom;
      const newPanX = mouseX - (mouseX - pan.x) * zoomRatio;
      const newPanY = mouseY - (mouseY - pan.y) * zoomRatio;
      setZoom(newZoom);
      setPan({ x: newPanX, y: newPanY });
    }
  }, [zoom, pan]);

  // Pointer drag
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    panStart.current = { x: pan.x, y: pan.y };
  }, [pan]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setPan({ x: panStart.current.x + dx, y: panStart.current.y + dy });
  }, [isDragging]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const zoomIn = () => setZoom(z => Math.min(2.5, z * 1.2));
  const zoomOut = () => setZoom(z => Math.max(0.25, z / 1.2));
  const recenter = () => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    setPan({ x: vw / 2 - CX * zoom, y: vh / 2 - CY * zoom });
  };

  const renderConnection = (skill: Skill & { x: number; y: number }) => {
    if (skill.prerequisites.length === 0) return null;
    const parent = positionedSkills.find(s => s.id === skill.prerequisites[0]);
    if (!parent) return null;

    const isCompleted = completedIds.includes(skill.id);
    const parentCompleted = completedIds.includes(skill.prerequisites[0]);
    const color = CATEGORIES[skill.domain].color;

    // Bezier curve
    const path = `M ${parent.x} ${parent.y} C ${parent.x} ${(parent.y + skill.y) / 2} ${skill.x} ${(parent.y + skill.y) / 2} ${skill.x} ${skill.y}`;

    if (isCompleted && parentCompleted) {
      return (
        <path
          key={`conn-${skill.id}`}
          d={path}
          fill="none"
          stroke="#D4AF37"
          strokeWidth={1.5}
          strokeOpacity={0.6}
        />
      );
    }
    if (parentCompleted) {
      return (
        <path
          key={`conn-${skill.id}`}
          d={path}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          strokeOpacity={0.35}
          strokeDasharray="6 4"
        />
      );
    }
    return (
      <path
        key={`conn-${skill.id}`}
        d={path}
        fill="none"
        stroke="#4A4858"
        strokeWidth={1}
        strokeOpacity={0.25}
        strokeDasharray="3 4"
      />
    );
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-hidden cursor-grab active:cursor-grabbing select-none relative"
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{ touchAction: 'none', userSelect: 'none', background: '#0D0E17' }}
    >
      {/* Category filter pills */}
      <div className="absolute top-4 left-4 z-10 flex gap-1.5 flex-wrap max-w-[50vw]">
        {CATEGORY_KEYS.map(cat => {
          const catData = CATEGORIES[cat];
          const isActive = activeCategories.has(cat);
          return (
            <button
              key={cat}
              onClick={e => { e.stopPropagation(); toggleCategory(cat); }}
              className="px-3 py-1 rounded-full text-[11px] font-heading font-semibold border transition-all cursor-pointer"
              style={{
                backgroundColor: isActive ? `${catData.color}20` : 'transparent',
                color: isActive ? catData.color : '#4A4858',
                borderColor: isActive ? `${catData.color}50` : '#2A2A3A',
              }}
            >
              {catData.name}
            </button>
          );
        })}
      </div>

      {/* Zoom controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-1">
        <button onClick={zoomIn} className="w-8 h-8 rounded-lg bg-surface-raised/80 border border-border flex items-center justify-center text-ink-muted hover:text-ink hover:bg-surface-high transition-colors cursor-pointer">
          <Plus size={16} />
        </button>
        <button onClick={recenter} className="w-8 h-8 rounded-lg bg-surface-raised/80 border border-border flex items-center justify-center text-ink-muted hover:text-ink hover:bg-surface-high transition-colors cursor-pointer">
          <Crosshair size={14} />
        </button>
        <button onClick={zoomOut} className="w-8 h-8 rounded-lg bg-surface-raised/80 border border-border flex items-center justify-center text-ink-muted hover:text-ink hover:bg-surface-high transition-colors cursor-pointer">
          <Minus size={16} />
        </button>
      </div>

      {/* Zoom indicator */}
      <div className="absolute bottom-4 left-4 z-10 text-[10px] text-ink-dim font-mono select-none pointer-events-none">
        {Math.round(zoom * 100)}%
      </div>

      {/* SVG Skill Tree */}
      <svg
        viewBox={`0 0 ${SKILL_WIDTH} ${SKILL_HEIGHT}`}
        style={{
          width: SKILL_WIDTH,
          height: SKILL_HEIGHT,
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          transition: isDragging ? 'none' : 'transform 0.15s ease-out',
        }}
      >
        <defs>
          {/* Glow filters */}
          <filter id="glow-gold" x="-100%" y="-100%" width="300%" height="300%">
            <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#D4AF37" floodOpacity="0.5" />
          </filter>
          <filter id="glow-node" x="-100%" y="-100%" width="300%" height="300%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="currentColor" floodOpacity="0.4" />
          </filter>
          <filter id="glow-active" x="-100%" y="-100%" width="300%" height="300%">
            <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#D4AF37" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Connections */}
        {visibleSkills.map(skill => renderConnection(skill))}

        {/* Nodes */}
        {visibleSkills.map(skill => {
          const state = getSkillState(skill, completedIds);
          const category = CATEGORIES[skill.domain];
          const r = getNodeRadius(skill);
          const isSelected = skill.id === selectedSkillId;
          const isRoot = skill.id === 'root';

          if (isRoot) {
            return (
              <g key="root" onClick={e => { e.stopPropagation(); onSelectSkill(skill); }} className="cursor-pointer">
                <circle cx={skill.x} cy={skill.y} r={r + 4} fill="none" stroke="#D4AF37" strokeWidth={2} strokeOpacity={0.4}>
                  <animateTransform attributeName="transform" type="rotate" from={`0 ${skill.x} ${skill.y}`} to={`360 ${skill.x} ${skill.y}`} dur="20s" repeatCount="indefinite" />
                </circle>
                <circle cx={skill.x} cy={skill.y} r={r} fill="#1C1D2B" stroke="#D4AF37" strokeWidth={2} />
                <text x={skill.x} y={skill.y + 4} textAnchor="middle" fill="#D4AF37" fontSize={12} fontWeight={700} fontFamily="Inter, sans-serif">
                  ROOT
                </text>
                <text x={skill.x} y={skill.y + r + 18} textAnchor="middle" fill="#7A7887" fontSize={11} fontWeight={600} fontFamily="Inter, sans-serif">
                  {skill.title}
                </text>
              </g>
            );
          }

          if (state === 'completed') {
            return (
              <g
                key={skill.id}
                onClick={e => { e.stopPropagation(); onSelectSkill(skill); }}
                className="cursor-pointer"
              >
                {/* Selection ring */}
                {isSelected && (
                  <circle cx={skill.x} cy={skill.y} r={r + 8} fill="none" stroke="#D4AF37" strokeWidth={2} strokeDasharray="4 3" opacity={0.7}>
                    <animateTransform attributeName="transform" type="rotate" from={`0 ${skill.x} ${skill.y}`} to={`360 ${skill.x} ${skill.y}`} dur="10s" repeatCount="indefinite" />
                  </circle>
                )}
                {/* Glow ring */}
                <circle cx={skill.x} cy={skill.y} r={r + 3} fill="none" stroke="#5B9B6B" strokeWidth={1.5} opacity={0.5} filter="url(#glow-gold)" />
                {/* Filled node */}
                <circle cx={skill.x} cy={skill.y} r={r} fill="#D4AF37" stroke="#B8964A" strokeWidth={1.5} />
                {/* Label */}
                <NodeLabel skill={skill} category={category} isCompleted />
              </g>
            );
          }

          // Active (available)
          return (
            <g
              key={skill.id}
              onClick={e => { e.stopPropagation(); onSelectSkill(skill); }}
              className="cursor-pointer"
            >
              {/* Selection ring */}
              {isSelected && (
                <circle cx={skill.x} cy={skill.y} r={r + 8} fill="none" stroke="#D4AF37" strokeWidth={2} strokeDasharray="4 3" opacity={0.7}>
                  <animateTransform attributeName="transform" type="rotate" from={`0 ${skill.x} ${skill.y}`} to={`360 ${skill.x} ${skill.y}`} dur="10s" repeatCount="indefinite" />
                </circle>
              )}
              {/* Subtle glow */}
              <circle cx={skill.x} cy={skill.y} r={r + 4} fill="none" stroke={category.color} strokeWidth={1} opacity={0.25} />
              {/* Filled node */}
              <circle cx={skill.x} cy={skill.y} r={r} fill={`${category.color}30`} stroke={category.color} strokeWidth={1.5} />
              {/* Label */}
              <NodeLabel skill={skill} category={category} isCompleted={false} />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// --- Text label component ---
// Uses foreignObject for HTML text wrapping — full names, never truncated
function NodeLabel({ skill, category, isCompleted }: {
  skill: Skill & { x: number; y: number };
  category: { color: string; name: string };
  isCompleted: boolean;
}) {
  const r = getNodeRadius(skill);
  const width = 120;
  const height = 40;
  const x = skill.x - width / 2;
  const y = skill.y + r + 4;

  return (
    <foreignObject x={x} y={y} width={width} height={height} style={{ pointerEvents: 'none', overflow: 'visible' }}>
      <div
        style={{
          width: '100%',
          textAlign: 'center',
          fontSize: 11,
          fontWeight: 600,
          fontFamily: 'Inter, sans-serif',
          lineHeight: 1.3,
          color: isCompleted ? '#D4AF37' : category.color,
          textShadow: '0 1px 3px rgba(8,9,15,0.9), 0 0 6px rgba(8,9,15,0.7)',
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        {skill.title}
      </div>
    </foreignObject>
  );
}
