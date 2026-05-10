import { useRef, useState, useCallback, useEffect } from 'react';
import { Plus, Minus, Crosshair } from 'lucide-react';
import { ALL_SKILLS, CATEGORIES, getSkillState, getChildren } from '@/data/skills';
import type { PositionedSkill } from '@/data/skills';
import { LEARNING_PATHS } from '@/data/paths';
import type { DomainKey } from '@/lib/types';

interface SkillTreeCanvasProps {
  completedIds: string[];
  onSelectSkill: (skill: PositionedSkill) => void;
  selectedSkillId: string | null;
  selectedPathId: string | null;
  activeCategories: Set<DomainKey>;
}

// --- Canvas dimensions (matches ALL_SKILLS from skillData) ---
const SKILL_WIDTH = 2000;
const SKILL_HEIGHT = 1600;
const CX = SKILL_WIDTH / 2;
const CY = SKILL_HEIGHT / 2;

// Pre-computed positioned skills from data file
const positionedSkills: PositionedSkill[] = ALL_SKILLS;

// --- Node components ---
const NODE_RADIUS_T1 = 18;
const NODE_RADIUS_T2 = 15;
const NODE_RADIUS_T3 = 13;
const ROOT_RADIUS = 24;

function getNodeRadius(skill: PositionedSkill): number {
  if (skill.id === 'root') return ROOT_RADIUS;
  if (skill.level === 1) return NODE_RADIUS_T1;
  if (skill.level === 2) return NODE_RADIUS_T2;
  return NODE_RADIUS_T3;
}

const MINI_MAP_WIDTH = 200;
const MINI_MAP_HEIGHT = 160;

export default function SkillTreeCanvas({ completedIds, onSelectSkill, selectedSkillId, selectedPathId, activeCategories }: SkillTreeCanvasProps) {
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(0.6);
  const [isDragging, setIsDragging] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const dragStart = useRef({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Measure container size for mini-map viewport rect
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const cr = entries[0].contentRect;
      setContainerSize({ width: cr.width, height: cr.height });
    });
    ro.observe(el);
    setContainerSize({ width: el.clientWidth, height: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  const activePath = selectedPathId ? LEARNING_PATHS.find(p => p.id === selectedPathId) : null;
  const pathSkillIds = activePath ? new Set(activePath.skillIds) : null;

  const visibleSkills = positionedSkills.filter(
    s => s.id === 'root' || activeCategories.has(s.domain)
  );

  // Compute highlighted skills when one is selected
  const highlightedSkillIds = new Set<string>();
  if (selectedSkillId) {
    highlightedSkillIds.add(selectedSkillId);
    const selectedSkill = positionedSkills.find(s => s.id === selectedSkillId);
    if (selectedSkill) {
      for (const prereqId of selectedSkill.prerequisites) {
        highlightedSkillIds.add(prereqId);
      }
    }
    for (const child of getChildren(selectedSkillId)) {
      highlightedSkillIds.add(child.id);
    }
  }

  // Center the view on mount
  useEffect(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const initialPan = { x: vw / 2 - CX * 0.6, y: vh / 2 - CY * 0.6 };
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

      {/* Mini-map */}
      {containerSize.width > 0 && (
        <div className="absolute bottom-4 right-4 z-10 rounded-lg border border-border overflow-hidden bg-surface-raised/90 backdrop-blur-sm select-none"
          style={{ width: MINI_MAP_WIDTH, height: MINI_MAP_HEIGHT }}
        >
          <svg
            viewBox={`0 0 ${SKILL_WIDTH} ${SKILL_HEIGHT}`}
            width={MINI_MAP_WIDTH}
            height={MINI_MAP_HEIGHT}
            className="cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const mx = e.clientX - rect.left;
              const my = e.clientY - rect.top;
              // Map mini-map pixel to tree coordinate
              const treeX = (mx / MINI_MAP_WIDTH) * SKILL_WIDTH;
              const treeY = (my / MINI_MAP_HEIGHT) * SKILL_HEIGHT;
              // Center viewport on that point
              setPan({
                x: containerSize.width / 2 - treeX * zoom,
                y: containerSize.height / 2 - treeY * zoom,
              });
            }}
          >
            {/* Background */}
            <rect width={SKILL_WIDTH} height={SKILL_HEIGHT} fill="#0D0E17" />

            {/* All skills as tiny dots */}
            {positionedSkills.map(skill => {
              const cat = CATEGORIES[skill.domain];
              const inPath = pathSkillIds ? pathSkillIds.has(skill.id) : true;
              const opacity = !pathSkillIds || inPath ? 0.6 : 0.15;
              return (
                <circle
                  key={skill.id}
                  cx={skill.x}
                  cy={skill.y}
                  r={skill.level === 1 ? 5 : skill.level === 2 ? 4 : 3}
                  fill={cat.color}
                  opacity={opacity}
                />
              );
            })}

            {/* Viewport rectangle */}
            {(() => {
              const vx = Math.max(0, -pan.x / zoom);
              const vy = Math.max(0, -pan.y / zoom);
              const vw = Math.min(SKILL_WIDTH - vx, containerSize.width / zoom);
              const vh = Math.min(SKILL_HEIGHT - vy, containerSize.height / zoom);
              if (vw <= 0 || vh <= 0) return null;
              return (
                <>
                  <rect
                    x={vx}
                    y={vy}
                    width={vw}
                    height={vh}
                    fill="none"
                    stroke="#D4AF37"
                    strokeWidth={3}
                    opacity={0.6}
                  />
                  <rect
                    x={vx}
                    y={vy}
                    width={vw}
                    height={vh}
                    fill="#D4AF37"
                    opacity={0.05}
                  />
                </>
              );
            })()}
          </svg>
        </div>
      )}

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

        {/* Connections — first pass: all dimmed */}
        {visibleSkills.map(skill => {
          if (skill.prerequisites.length === 0) return null;
          const parent = positionedSkills.find(s => s.id === skill.prerequisites[0]);
          if (!parent) return null;

          const isCompleted = completedIds.includes(skill.id);
          const parentCompleted = completedIds.includes(skill.prerequisites[0]);
          const color = CATEGORIES[skill.domain].color;

          const path = `M ${parent.x} ${parent.y} C ${parent.x} ${(parent.y + skill.y) / 2} ${skill.x} ${(parent.y + skill.y) / 2} ${skill.x} ${skill.y}`;

          if (isCompleted && parentCompleted) {
            return (
              <path
                key={`conn-bg-${skill.id}`}
                d={path}
                fill="none"
                stroke="#D4AF37"
                strokeWidth={1.5}
                strokeOpacity={0.15}
              />
            );
          }
          if (parentCompleted) {
            return (
              <path
                key={`conn-bg-${skill.id}`}
                d={path}
                fill="none"
                stroke={color}
                strokeWidth={1.5}
                strokeOpacity={0.15}
                strokeDasharray="6 4"
              />
            );
          }
          return (
            <path
              key={`conn-bg-${skill.id}`}
              d={path}
              fill="none"
              stroke="#4A4858"
              strokeWidth={1}
              strokeOpacity={0.15}
              strokeDasharray="3 4"
            />
          );
        })}

        {/* Connections — second pass: highlighted */}
        {selectedSkillId && visibleSkills.map(skill => {
          if (skill.prerequisites.length === 0) return null;
          const parentId = skill.prerequisites[0];
          const parent = positionedSkills.find(s => s.id === parentId);
          if (!parent) return null;

          const isChildHighlighted = highlightedSkillIds.has(skill.id);
          const isParentHighlighted = highlightedSkillIds.has(parentId);
          if (!isChildHighlighted && !isParentHighlighted) return null;

          const isDirectlyConnected = skill.id === selectedSkillId || parentId === selectedSkillId;
          const color = CATEGORIES[skill.domain].color;

          const path = `M ${parent.x} ${parent.y} C ${parent.x} ${(parent.y + skill.y) / 2} ${skill.x} ${(parent.y + skill.y) / 2} ${skill.x} ${skill.y}`;

          if (isDirectlyConnected) {
            return (
              <path
                key={`conn-hl-${skill.id}`}
                d={path}
                fill="none"
                stroke={color}
                strokeWidth={2.5}
                strokeOpacity={0.9}
              />
            );
          }
          return (
            <path
              key={`conn-hl-${skill.id}`}
              d={path}
              fill="none"
              stroke={color}
              strokeWidth={1.5}
              strokeOpacity={0.6}
            />
          );
        })}

        {/* Nodes */}
        {visibleSkills.map(skill => {
          const state = getSkillState(skill, completedIds);
          const category = CATEGORIES[skill.domain];
          const r = getNodeRadius(skill);
          const isSelected = skill.id === selectedSkillId;
          const isRoot = skill.id === 'root';
          const isHighlighted = selectedSkillId ? highlightedSkillIds.has(skill.id) : false;
          const inActivePath = pathSkillIds ? pathSkillIds.has(skill.id) : true;

          let nodeOpacity: number;
          if (selectedSkillId) {
            nodeOpacity = isSelected || isHighlighted ? 1.0 : 0.35;
          } else if (pathSkillIds) {
            nodeOpacity = inActivePath ? 1.0 : 0.12;
          } else {
            nodeOpacity = 1.0;
          }

          if (isRoot) {
            return (
              <g key="root" onClick={e => { e.stopPropagation(); onSelectSkill(skill); }} className="cursor-pointer">
                {isHighlighted && !isSelected && (
                  <circle cx={skill.x} cy={skill.y} r={r + 6} fill="none" stroke="#D4AF37" strokeWidth={1} opacity={0.35} />
                )}
                <circle cx={skill.x} cy={skill.y} r={r + 4} fill="none" stroke="#D4AF37" strokeWidth={2} strokeOpacity={0.4} opacity={nodeOpacity}>
                  <animateTransform attributeName="transform" type="rotate" from={`0 ${skill.x} ${skill.y}`} to={`360 ${skill.x} ${skill.y}`} dur="20s" repeatCount="indefinite" />
                </circle>
                <circle cx={skill.x} cy={skill.y} r={r} fill="#1C1D2B" stroke="#D4AF37" strokeWidth={2} opacity={nodeOpacity} />
                <text x={skill.x} y={skill.y + 4} textAnchor="middle" fill="#D4AF37" fontSize={12} fontWeight={700} fontFamily="Inter, sans-serif" opacity={nodeOpacity}>
                  ROOT
                </text>
                <text x={skill.x} y={skill.y + r + 18} textAnchor="middle" fill="#7A7887" fontSize={11} fontWeight={600} fontFamily="Inter, sans-serif" opacity={nodeOpacity}>
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
                {/* Highlight glow ring */}
                {isHighlighted && !isSelected && (
                  <circle cx={skill.x} cy={skill.y} r={r + 6} fill="none" stroke={category.color} strokeWidth={1} opacity={0.35} />
                )}
                {/* Glow ring */}
                <circle cx={skill.x} cy={skill.y} r={r + 3} fill="none" stroke="#5B9B6B" strokeWidth={1.5} opacity={0.5 * nodeOpacity} filter="url(#glow-gold)" />
                {/* Filled node */}
                <circle cx={skill.x} cy={skill.y} r={r} fill="#D4AF37" stroke="#B8964A" strokeWidth={1.5} opacity={nodeOpacity} />
                {/* Label */}
                <NodeLabel skill={skill} category={category} isCompleted opacity={nodeOpacity} />
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
              {/* Highlight glow ring */}
              {isHighlighted && !isSelected && (
                <circle cx={skill.x} cy={skill.y} r={r + 6} fill="none" stroke={category.color} strokeWidth={1} opacity={0.35} />
              )}
              {/* Subtle glow */}
              <circle cx={skill.x} cy={skill.y} r={r + 4} fill="none" stroke={category.color} strokeWidth={1} opacity={0.25 * nodeOpacity} />
              {/* Filled node */}
              <circle cx={skill.x} cy={skill.y} r={r} fill={`${category.color}30`} stroke={category.color} strokeWidth={1.5} opacity={nodeOpacity} />
              {/* Label */}
              <NodeLabel skill={skill} category={category} isCompleted={false} opacity={nodeOpacity} />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// --- Text label component ---
// Uses foreignObject for HTML text wrapping — full names, never truncated
function NodeLabel({ skill, category, isCompleted, opacity = 1 }: {
  skill: PositionedSkill;
  category: { color: string; name: string };
  isCompleted: boolean;
  opacity?: number;
}) {
  const r = getNodeRadius(skill);
  const width = 120;
  const height = 40;
  const x = skill.x - width / 2;
  const y = skill.y + r + 4;

  return (
    <foreignObject x={x} y={y} width={width} height={height} style={{ pointerEvents: 'none', overflow: 'visible' }} opacity={opacity}>
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
