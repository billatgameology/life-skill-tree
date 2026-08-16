import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Check, Zap } from 'lucide-react';
import { SKILL_MAP } from '@/data/skills';
import { LAT_BASE, NODE_H, NODE_W, padState, REFDES } from '../graph';
import type { LatNode, Net } from '../graph';
import { useLattice } from '../context';

const PAD_CLASSES: Record<string, string> = {
  soldered: 'border-[var(--lt-gold)] bg-[var(--lt-gold)] text-[var(--lt-gold-ink)]',
  live: 'lt-live-pad border-[var(--lt-copper)] bg-[var(--lt-panel)] text-[var(--lt-silk)]',
  open: 'border-[#2E4A39] bg-[var(--lt-well)] text-[var(--lt-dim)]',
};

function PadNode({ node, focused }: { node: LatNode; focused: boolean }) {
  const { completedSet } = useLattice();
  const skill = SKILL_MAP[node.id];
  const state = padState(skill, completedSet);
  return (
    <Link
      to={`${LAT_BASE}/skill/${node.id}`}
      className={`absolute flex flex-col justify-between rounded-md border-2 px-2.5 py-2 transition-transform hover:scale-[1.03] ${PAD_CLASSES[state]} ${
        focused ? 'outline-dashed outline-2 outline-offset-4 outline-[var(--lt-silk)]' : ''
      }`}
      style={{ left: node.x, top: node.y, width: NODE_W, height: NODE_H }}
    >
      <span className="lt-mono flex items-center justify-between text-[9px] uppercase tracking-[0.14em]">
        {REFDES[node.id]}
        {state === 'soldered' && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
        {state === 'live' && (
          <Zap className="h-3.5 w-3.5 text-[var(--lt-gold)]" fill="currentColor" aria-hidden="true" />
        )}
      </span>
      <span className="lt-clamp2 text-[12px] font-semibold leading-tight">{skill.title}</span>
    </Link>
  );
}

/**
 * The walkable net map: pre-routed copper traces in SVG under absolutely
 * positioned pad buttons, inside a scrollable viewport (a local
 * neighborhood, not a pan/zoom canvas).
 */
export function TraceMap({ net, focusId }: { net: Net; focusId?: string | null }) {
  const { completedSet } = useLattice();
  const viewportRef = useRef<HTMLDivElement>(null);

  // Center the focused pad (arriving from a skill page's "view on net").
  useEffect(() => {
    const el = viewportRef.current;
    if (!el || !focusId) return;
    const node = net.nodeMap[focusId];
    if (!node) return;
    el.scrollTo({
      left: node.x + NODE_W / 2 - el.clientWidth / 2,
      top: node.y + NODE_H / 2 - el.clientHeight / 2,
    });
  }, [focusId, net]);

  return (
    <div
      ref={viewportRef}
      className="lt-scroll lt-board-grid relative overflow-auto rounded-lg border border-[var(--lt-line)] bg-[var(--lt-well)]"
      style={{ maxHeight: 'min(64vh, 680px)' }}
    >
      <div className="relative" style={{ width: net.width, height: net.height }}>
        <svg
          className="absolute inset-0"
          width={net.width}
          height={net.height}
          viewBox={`0 0 ${net.width} ${net.height}`}
          aria-hidden="true"
        >
          {net.edges.map((e) => {
            const lit = completedSet.has(e.from);
            const flowing = lit && !completedSet.has(e.to);
            return (
              <g key={`${e.from}->${e.to}`}>
                <path
                  d={e.d}
                  fill="none"
                  stroke={lit ? 'var(--lt-gold)' : '#6E5A41'}
                  strokeWidth={lit ? 3 : 2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={lit ? 0.95 : 0.75}
                />
                {flowing && (
                  <path
                    d={e.d}
                    fill="none"
                    stroke="#FFE9A8"
                    strokeWidth={2}
                    strokeLinecap="round"
                    className="lt-current"
                  />
                )}
              </g>
            );
          })}
        </svg>
        {net.nodes.map((n) => (
          <PadNode key={n.id} node={n} focused={n.id === focusId} />
        ))}
      </div>
    </div>
  );
}

/** Miniature of a net's real topology, for the home-board directory card. */
export function NetPreview({ net }: { net: Net }) {
  const { completedSet } = useLattice();
  const r = Math.max(16, Math.min(44, net.width / 40));
  const sw = Math.max(5, Math.min(13, net.width / 180));
  const center = (id: string) => {
    const n = net.nodeMap[id];
    return { cx: n.x + NODE_W / 2, cy: n.y + NODE_H / 2 };
  };
  return (
    <svg viewBox={`0 0 ${net.width} ${net.height}`} className="h-full w-full" aria-hidden="true">
      {net.edges.map((e) => {
        const a = center(e.from);
        const b = center(e.to);
        return (
          <line
            key={`${e.from}->${e.to}`}
            x1={a.cx}
            y1={a.cy}
            x2={b.cx}
            y2={b.cy}
            stroke={completedSet.has(e.from) ? 'var(--lt-gold)' : '#7A5C3E'}
            strokeWidth={sw}
            strokeLinecap="round"
          />
        );
      })}
      {net.nodes.map((n) => {
        const state = padState(SKILL_MAP[n.id], completedSet);
        return (
          <circle
            key={n.id}
            cx={n.x + NODE_W / 2}
            cy={n.y + NODE_H / 2}
            r={r}
            fill={
              state === 'soldered'
                ? 'var(--lt-gold)'
                : state === 'live'
                  ? 'var(--lt-copper)'
                  : '#284534'
            }
            stroke={state === 'open' ? '#4A6B57' : 'transparent'}
            strokeWidth={sw / 2}
          />
        );
      })}
    </svg>
  );
}
