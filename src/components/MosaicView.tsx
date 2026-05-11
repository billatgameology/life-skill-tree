import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { Plus, Minus, Crosshair } from 'lucide-react';
import { ALL_SKILLS, CATEGORIES, CATEGORY_KEYS, getSkillState } from '@/data/skills';
import type { Skill, DomainKey } from '@/lib/types';

interface MosaicViewProps {
  completedIds: string[];
  onSelectSkill: (skill: Skill) => void;
  selectedSkillId: string | null;
  activeCategories: Set<DomainKey>;
  selectedPathId: string | null;
}

// ─── Hex geometry (pointy-top, axial coords) ───
const HEX_R = 58;
const HEX_W = Math.sqrt(3) * HEX_R;
const ROW_STEP = HEX_R * 1.5;

// ─── Category territory geometry ───
// Categories live on one continuous offset hex sheet. Each territory reserves a
// small no-hex title slot, while side cells remain available as bridges so rows
// and columns of categories stay connected.
const CANVAS_PAD = 80;

const NEIGHBORS: [number, number][] = [
  [1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1],
];

function axialToPixel(q: number, r: number): { x: number; y: number } {
  return { x: HEX_W * (q + r / 2), y: ROW_STEP * r };
}

function hexPoints(cx: number, cy: number, r: number): string {
  let s = '';
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i - Math.PI / 2;
    s += `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)} `;
  }
  return s.trim();
}

function wrapLabel(text: string, maxLines: number, maxCharsPerLine: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    if (!current) {
      current = word;
    } else if ((current + ' ' + word).length <= maxCharsPerLine) {
      current += ' ' + word;
    } else {
      lines.push(current);
      current = word;
      if (lines.length >= maxLines - 1) break;
    }
  }
  if (current && lines.length < maxLines) lines.push(current);
  return lines;
}

interface ClusterCell {
  q: number;        // global axial
  r: number;
  col: number;      // global offset-grid col
  row: number;      // global offset-grid row
  localCol: number;
  localRow: number;
  isLabelZone: boolean;
  skill?: Skill;
  empty: boolean;   // visible empty cell (for future expansion)
}

interface CategoryRegion {
  domain: DomainKey;
  startCol: number;
  startRow: number;
  cols: number;
  rows: number;
  cells: ClusterCell[];
  totalSkills: number;
  labelPixel: { x: number; y: number };
}

const CATEGORY_PLACEMENTS: Record<DomainKey, { col: number; row: number }> = {
  'digital-basics': { col: 0, row: 0 },
  'navigation': { col: 6, row: 0 },
  'money-finance': { col: 12, row: 0 },
  'food-cooking': { col: 18, row: 0 },
  'communication': { col: 0, row: 6 },
  'health-safety': { col: 6, row: 6 },
  'organization': { col: 12, row: 6 },
  'home-care': { col: 18, row: 6 },
  'civic-community': { col: 0, row: 12 },
  'emotional-skills': { col: 5, row: 12 },
  'career-work': { col: 10, row: 12 },
  'school-learning': { col: 15, row: 12 },
  'shopping-consumer': { col: 20, row: 12 },
  'outdoor-everyday': { col: 4, row: 17 },
  'housing-living': { col: 9, row: 17 },
};

function offsetToAxial(col: number, row: number): { q: number; r: number } {
  return { q: col - Math.floor(row / 2), r: row };
}

function getTerritorySize(skillCount: number): { cols: number; rows: number } {
  if (skillCount >= 23) return { cols: 7, rows: 5 };
  if (skillCount >= 18) return { cols: 6, rows: 5 };
  return { cols: 5, rows: 4 };
}

function isTitleSlot(_localCol: number, localRow: number): boolean {
  return localRow === 0;
}

// Build all category regions on one contiguous honeycomb.
function buildRegions(): CategoryRegion[] {
  return CATEGORY_KEYS.map((domain) => {
    const skills = ALL_SKILLS.filter(s => s.domain === domain);
    const N = skills.length;

    const placement = CATEGORY_PLACEMENTS[domain];
    const { cols, rows } = getTerritorySize(N);
    const startCol = placement.col;
    const startRow = placement.row;

    let skillCursor = 0;
    const cells: ClusterCell[] = [];
    for (let localRow = 0; localRow < rows; localRow++) {
      for (let localCol = 0; localCol < cols; localCol++) {
        const col = startCol + localCol;
        const row = startRow + localRow;
        const { q, r } = offsetToAxial(col, row);
        const isLabelZone = isTitleSlot(localCol, localRow);
        const skill = !isLabelZone && skillCursor < N ? skills[skillCursor++] : undefined;

        cells.push({
          q,
          r,
          col,
          row,
          localCol,
          localRow,
          isLabelZone,
          skill,
          empty: !isLabelZone && !skill,
        });
      }
    }

    const labelCol = startCol + (cols - 1) / 2;
    const labelRow = startRow;
    const labelAxial = offsetToAxial(labelCol, labelRow);
    const labelPixel = axialToPixel(labelAxial.q, labelAxial.r);

    return {
      domain,
      startCol,
      startRow,
      cols,
      rows,
      cells,
      totalSkills: N,
      labelPixel,
    };
  });
}

export default function MosaicView({
  completedIds,
  onSelectSkill,
  selectedSkillId,
  activeCategories,
  selectedPathId,
}: MosaicViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(0.55);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0 });
  const activePointers = useRef(new Map<number, { x: number; y: number }>());
  const pinchStartDistance = useRef(0);
  const pinchStartZoom = useRef(zoom);
  const pinchMidpoint = useRef({ x: 0, y: 0 });
  const pinchStartPan = useRef({ x: 0, y: 0 });

  const pathSkillIds = useMemo(() => {
    if (!selectedPathId) return null;
    return new Set([selectedPathId]);
  }, [selectedPathId]);

  const regions = useMemo(() => buildRegions(), []);

  // Canvas extents — derived from every cell's pixel bound.
  const { totalW, totalH, tx, ty } = useMemo(() => {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const region of regions) {
      for (const cell of region.cells) {
        const { x, y } = axialToPixel(cell.q, cell.r);
        if (x - HEX_W / 2 < minX) minX = x - HEX_W / 2;
        if (x + HEX_W / 2 > maxX) maxX = x + HEX_W / 2;
        if (y - HEX_R < minY) minY = y - HEX_R;
        if (y + HEX_R > maxY) maxY = y + HEX_R;
      }
    }
    return {
      totalW: maxX - minX + 2 * CANVAS_PAD,
      totalH: maxY - minY + 2 * CANVAS_PAD,
      tx: CANVAS_PAD - minX,
      ty: CANVAS_PAD - minY,
    };
  }, [regions]);

  // Initial fit-to-screen
  useEffect(() => {
    const cw = containerRef.current?.clientWidth || window.innerWidth;
    const ch = containerRef.current?.clientHeight || window.innerHeight;
    const initial = Math.min(cw / totalW, ch / totalH) * 0.95;
    setZoom(initial);
    setPan({
      x: cw / 2 - (totalW * initial) / 2,
      y: ch / 2 - (totalH * initial) / 2,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const factor = Math.exp(-e.deltaY * 0.0015);
    const newZoom = Math.max(0.1, Math.min(3.0, zoom * factor));
    if (newZoom !== zoom) {
      const ratio = newZoom / zoom;
      setZoom(newZoom);
      setPan({
        x: mx - (mx - pan.x) * ratio,
        y: my - (my - pan.y) * ratio,
      });
    }
  }, [zoom, pan]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (activePointers.current.size === 1) {
      setIsDragging(true);
      dragStart.current = { x: e.clientX, y: e.clientY };
      panStart.current = { x: pan.x, y: pan.y };
      return;
    }

    if (activePointers.current.size === 2) {
      setIsDragging(false);
      const [p1, p2] = Array.from(activePointers.current.values());
      pinchStartDistance.current = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      pinchStartZoom.current = zoom;
      pinchMidpoint.current = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
      pinchStartPan.current = { ...pan };
    }
  }, [pan]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!activePointers.current.has(e.pointerId)) return;
    activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (activePointers.current.size === 1 && isDragging) {
      setPan({
        x: panStart.current.x + (e.clientX - dragStart.current.x),
        y: panStart.current.y + (e.clientY - dragStart.current.y),
      });
      return;
    }

    if (activePointers.current.size === 2) {
      const [p1, p2] = Array.from(activePointers.current.values());
      const currentDistance = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      if (pinchStartDistance.current <= 0) return;

      const nextZoom = Math.max(0.1, Math.min(3.0, pinchStartZoom.current * (currentDistance / pinchStartDistance.current)));
      const ratio = nextZoom / pinchStartZoom.current;
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const startMid = pinchMidpoint.current;
      const mx = startMid.x - rect.left;
      const my = startMid.y - rect.top;
      setZoom(nextZoom);
      setPan({
        x: mx - (mx - pinchStartPan.current.x) * ratio,
        y: my - (my - pinchStartPan.current.y) * ratio,
      });
    }
  }, [isDragging]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    activePointers.current.delete(e.pointerId);

    if (activePointers.current.size === 1) {
      const [remaining] = Array.from(activePointers.current.values());
      setIsDragging(true);
      dragStart.current = { x: remaining.x, y: remaining.y };
      panStart.current = { ...pan };
      return;
    }

    setIsDragging(false);
  }, [pan]);

  const zoomIn = () => setZoom(z => Math.min(3.0, z * 1.2));
  const zoomOut = () => setZoom(z => Math.max(0.1, z / 1.2));
  const recenter = () => {
    const cw = containerRef.current?.clientWidth || window.innerWidth;
    const ch = containerRef.current?.clientHeight || window.innerHeight;
    const z = Math.min(cw / totalW, ch / totalH) * 0.95;
    setZoom(z);
    setPan({
      x: cw / 2 - (totalW * z) / 2,
      y: ch / 2 - (totalH * z) / 2,
    });
  };

  // Reference unused vars to silence linter (kept for future use)
  void NEIGHBORS;

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-hidden bg-void cursor-grab active:cursor-grabbing select-none relative"
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{ touchAction: 'none', userSelect: 'none' }}
    >
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

      <div className="absolute bottom-4 left-4 z-10 text-[10px] text-ink-dim font-mono select-none pointer-events-none">
        {Math.round(zoom * 100)}%
      </div>

      <svg
        viewBox={`0 0 ${totalW} ${totalH}`}
        style={{
          width: totalW,
          height: totalH,
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          transition: isDragging ? 'none' : 'transform 0.15s ease-out',
        }}
      >
        {regions.map(region => {
          const cat = CATEGORIES[region.domain];
          const isActive = activeCategories.has(region.domain);
          const completedCount = region.cells.filter(c => c.skill && completedIds.includes(c.skill.id)).length;
          if (!isActive) return null;

          return (
            <g key={region.domain}>
              {/* Cluster cells (skip label zone entirely — that's "no go" for hex) */}
              {region.cells.map((cell, ci) => {
                if (cell.isLabelZone) return null;

                const { x, y } = axialToPixel(cell.q, cell.r);
                const hx = x + tx;
                const hy = y + ty;

                if (cell.empty) {
                  return (
                    <polygon
                      key={`empty-${region.domain}-${ci}`}
                      points={hexPoints(hx, hy, HEX_R - 4)}
                      fill="none"
                      stroke={`${cat.color}26`}
                      strokeWidth={1}
                      strokeDasharray="3 4"
                    />
                  );
                }

                const skill = cell.skill!;
                const state = getSkillState(skill, completedIds);
                const isSelected = skill.id === selectedSkillId;
                const inPath = pathSkillIds ? pathSkillIds.has(skill.id) : true;
                const skillOpacity = !pathSkillIds || inPath ? 1 : 0.18;

                const lines = wrapLabel(skill.title, 4, 13);
                const fs = 11;
                const lineH = fs * 1.05;
                const labelTop = hy - (lines.length * lineH) / 2 + fs * 0.85;

                return (
                  <g
                    key={skill.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectSkill(skill);
                    }}
                    style={{ cursor: 'pointer' }}
                    opacity={skillOpacity}
                  >
                    {isSelected && (
                      <polygon
                        points={hexPoints(hx, hy, HEX_R + 3)}
                        fill="none"
                        stroke="#D4AF37"
                        strokeWidth={2}
                        strokeDasharray="5 3"
                      />
                    )}
                    <polygon
                      points={hexPoints(hx, hy, HEX_R - 1.5)}
                      fill={state === 'completed' ? '#D4AF37' : `${cat.color}22`}
                      stroke={state === 'completed' ? '#B8964A' : cat.color}
                      strokeWidth={1.6}
                    />
                    <text
                      textAnchor="middle"
                      fontSize={fs}
                      fontWeight={600}
                      fill={state === 'completed' ? '#0D0E17' : cat.color}
                      fontFamily="Inter, sans-serif"
                      style={{ pointerEvents: 'none' }}
                    >
                      {lines.map((line, li) => (
                        <tspan key={li} x={hx} y={labelTop + li * lineH}>
                          {line}
                        </tspan>
                      ))}
                    </text>
                  </g>
                );
              })}

              {/* Category label — lives inside the cluster's reserved no-hex zone */}
              <text
                x={region.labelPixel.x + tx}
                y={region.labelPixel.y + ty - 4}
                textAnchor="middle"
                fontSize={26}
                fontWeight={800}
                fill={cat.color}
                fontFamily="Inter, sans-serif"
                style={{ letterSpacing: '0.02em', pointerEvents: 'none' }}
              >
                {cat.name.toUpperCase()}
              </text>
              <text
                x={region.labelPixel.x + tx}
                y={region.labelPixel.y + ty + 22}
                textAnchor="middle"
                fontSize={14}
                fontWeight={500}
                fill={`${cat.color}88`}
                fontFamily="Inter, sans-serif"
                style={{ pointerEvents: 'none' }}
              >
                {completedCount}/{region.totalSkills} completed
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
