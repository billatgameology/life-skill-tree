/**
 * LATTICE — pure derivation of the prerequisite graph, computed once at
 * module load. The metaphor is a printed circuit board: skills are PADS,
 * prerequisite edges are copper TRACES, and — borrowing real PCB
 * vocabulary — each weakly-connected component is a NET.
 *
 * Measured shape of the real DAG (233 skills): 154 prerequisite edges and
 * 92 weakly-connected components — 35 real nets of 2–25 pads and 57
 * isolated pads with no traces at all ("loose pins"). Longest chain: 7
 * pads. One mutual-prerequisite pair exists in the data
 * (give-useful-feedback ↔ receive-feedback-calmly), so the depth
 * computation below carries a cycle guard.
 */
import { ALL_SKILLS, SKILL_MAP, getChildren } from '@/data/skills';
import type { DomainKey, Skill } from '@/lib/types';

export const LAT_BASE = '/lattice';
export const TOTAL_PADS = ALL_SKILLS.length;

const COLLATOR = new Intl.Collator('en');
const byTitle = (a: Skill, b: Skill) => COLLATOR.compare(a.title, b.title);

/** Silkscreen reference designators — U001…U233 in canonical library order. */
export const REFDES: Record<string, string> = {};
ALL_SKILLS.forEach((s, i) => {
  REFDES[s.id] = `U${String(i + 1).padStart(3, '0')}`;
});

/** Directed prerequisite edges: from = prerequisite, to = dependent. */
interface RawEdge {
  from: string;
  to: string;
}

const RAW_EDGES: RawEdge[] = [];
for (const s of ALL_SKILLS) {
  for (const p of s.suggestedPrerequisites) {
    if (SKILL_MAP[p]) RAW_EDGES.push({ from: p, to: s.id });
  }
}
export const TOTAL_TRACES = RAW_EDGES.length;

// ── Weakly-connected components ──────────────────────────────────────────

const NEIGHBORS = new Map<string, string[]>(ALL_SKILLS.map((s) => [s.id, []]));
for (const e of RAW_EDGES) {
  NEIGHBORS.get(e.from)?.push(e.to);
  NEIGHBORS.get(e.to)?.push(e.from);
}

function findComponents(): string[][] {
  const seen = new Set<string>();
  const comps: string[][] = [];
  for (const s of ALL_SKILLS) {
    if (seen.has(s.id)) continue;
    const comp: string[] = [];
    const stack = [s.id];
    seen.add(s.id);
    while (stack.length > 0) {
      const cur = stack.pop() as string;
      comp.push(cur);
      for (const n of NEIGHBORS.get(cur) ?? []) {
        if (!seen.has(n)) {
          seen.add(n);
          stack.push(n);
        }
      }
    }
    comps.push(comp);
  }
  // Deterministic order: biggest first, ties by smallest member id.
  const minId = (c: string[]) => [...c].sort((a, b) => COLLATOR.compare(a, b))[0];
  return comps.sort((a, b) => b.length - a.length || COLLATOR.compare(minId(a), minId(b)));
}

// ── Layered layout ───────────────────────────────────────────────────────

export const NODE_W = 176;
export const NODE_H = 76;
const GAP_X = 32;
const GAP_Y = 96;
const PAD = 26;

/** Longest-path depth from the net's roots, guarded against the one cycle. */
function computeDepths(ids: string[]): Map<string, number> {
  const inComp = new Set(ids);
  const memo = new Map<string, number>();
  const depth = (id: string): number => {
    const known = memo.get(id);
    if (known !== undefined) return known;
    memo.set(id, 0); // cycle guard: a back-edge reads 0 instead of recursing
    let best = 0;
    for (const p of SKILL_MAP[id].suggestedPrerequisites) {
      if (inComp.has(p)) best = Math.max(best, depth(p) + 1);
    }
    memo.set(id, best);
    return best;
  };
  for (const id of ids) depth(id);
  return memo;
}

/** Group into rows by depth, then a few barycenter sweeps to untangle. */
function orderRows(ids: string[], depths: Map<string, number>): string[][] {
  let maxDepth = 0;
  for (const id of ids) maxDepth = Math.max(maxDepth, depths.get(id) ?? 0);
  const rows: string[][] = Array.from({ length: maxDepth + 1 }, () => []);
  for (const id of [...ids].sort((a, b) => byTitle(SKILL_MAP[a], SKILL_MAP[b]))) {
    rows[depths.get(id) ?? 0].push(id);
  }
  const inComp = new Set(ids);
  const pos = new Map<string, number>();
  const setPositions = () => {
    for (const row of rows) {
      row.forEach((id, i) => pos.set(id, row.length === 1 ? 0.5 : i / (row.length - 1)));
    }
  };
  setPositions();
  const sortRow = (row: string[]) => {
    const keys = new Map<string, number>();
    for (const id of row) {
      const ns = (NEIGHBORS.get(id) ?? []).filter((n) => inComp.has(n));
      keys.set(
        id,
        ns.length > 0
          ? ns.reduce((sum, n) => sum + (pos.get(n) ?? 0.5), 0) / ns.length
          : pos.get(id) ?? 0.5,
      );
    }
    row.sort(
      (a, b) => (keys.get(a) ?? 0.5) - (keys.get(b) ?? 0.5) || byTitle(SKILL_MAP[a], SKILL_MAP[b]),
    );
  };
  for (let pass = 0; pass < 3; pass++) {
    for (let d = 1; d <= maxDepth; d++) {
      sortRow(rows[d]);
      setPositions();
    }
    for (let d = maxDepth - 1; d >= 0; d--) {
      sortRow(rows[d]);
      setPositions();
    }
  }
  return rows;
}

/**
 * PCB-style trace: vertical drop, 45° chamfer, horizontal run at jogY,
 * 45° chamfer, then vertical into the target (up or down).
 */
function chamferedTrace(x1: number, y1: number, x2: number, y2: number, jogY: number): string {
  const c = 10;
  if (x1 === x2) return `M ${x1} ${y1} L ${x2} ${y2}`;
  const s = x2 > x1 ? 1 : -1;
  const dx = Math.abs(x2 - x1);
  const e = y2 > jogY ? 1 : -1;
  if (dx < 2 * c + 4) {
    return `M ${x1} ${y1} L ${x1} ${jogY} L ${x2} ${jogY + dx * e} L ${x2} ${y2}`;
  }
  return [
    `M ${x1} ${y1}`,
    `L ${x1} ${jogY - c}`,
    `L ${x1 + c * s} ${jogY}`,
    `L ${x2 - c * s} ${jogY}`,
    `L ${x2} ${jogY + c * e}`,
    `L ${x2} ${y2}`,
  ].join(' ');
}

export interface LatNode {
  id: string;
  x: number;
  y: number;
  depth: number;
}

export interface LatEdge {
  from: string;
  to: string;
  /** Pre-routed SVG path in net coordinates. */
  d: string;
}

export interface Net {
  id: string;
  /** 1-based index, biggest net first. */
  index: number;
  /** PCB-style signal name derived from the net's hub pad. */
  signal: string;
  /** e.g. "NET-01" */
  label: string;
  skillIds: string[];
  nodes: LatNode[];
  nodeMap: Record<string, LatNode>;
  edges: LatEdge[];
  /** Domains present, most frequent first. */
  domains: DomainKey[];
  /** Root pads (no in-net prerequisites), left to right. */
  entryIds: string[];
  width: number;
  height: number;
}

function buildNet(ids: string[], index: number): Net {
  const inComp = new Set(ids);
  const depths = computeDepths(ids);
  const rows = orderRows(ids, depths);

  const rowWidth = (n: number) => n * NODE_W + (n - 1) * GAP_X;
  let maxRowW = 0;
  for (const row of rows) maxRowW = Math.max(maxRowW, rowWidth(row.length));
  const width = maxRowW + PAD * 2;
  const height = rows.length * NODE_H + (rows.length - 1) * GAP_Y + PAD * 2;

  const nodes: LatNode[] = [];
  const nodeMap: Record<string, LatNode> = {};
  rows.forEach((row, depth) => {
    const offset = PAD + (maxRowW - rowWidth(row.length)) / 2;
    row.forEach((id, col) => {
      const node: LatNode = {
        id,
        x: offset + col * (NODE_W + GAP_X),
        y: PAD + depth * (NODE_H + GAP_Y),
        depth,
      };
      nodes.push(node);
      nodeMap[id] = node;
    });
  });

  const compEdges = RAW_EDGES.filter((e) => inComp.has(e.from));

  // Down-edge jog lanes are assigned per source row with greedy interval
  // coloring, so unrelated traces never share a collinear horizontal run
  // (a global `i % 4` merged separate traces into one line in the big nets).
  // Edges from the same source pad may share a lane — that segment is genuine.
  const laneOf = new Map<(typeof compEdges)[number], number>();
  const byRow = new Map<number, { e: (typeof compEdges)[number]; lo: number; hi: number }[]>();
  for (const e of compEdges) {
    const a = nodeMap[e.from];
    const b = nodeMap[e.to];
    if (b.depth <= a.depth) continue;
    const x1 = a.x + NODE_W / 2;
    const x2 = b.x + NODE_W / 2;
    const y1 = a.y + NODE_H;
    const list = byRow.get(y1) ?? [];
    list.push({ e, lo: Math.min(x1, x2), hi: Math.max(x1, x2) });
    byRow.set(y1, list);
  }
  for (const list of byRow.values()) {
    list.sort((p, q) => p.lo - q.lo || COLLATOR.compare(p.e.from, q.e.from));
    const occupied: { from: string; lo: number; hi: number }[][] = [];
    for (const item of list) {
      let lane = 0;
      while (
        occupied[lane]?.some(
          (s) => s.from !== item.e.from && item.lo <= s.hi && item.hi >= s.lo,
        )
      ) {
        lane += 1;
      }
      (occupied[lane] ??= []).push({ from: item.e.from, lo: item.lo, hi: item.hi });
      laneOf.set(item.e, lane);
    }
  }

  const edges: LatEdge[] = compEdges.map((e) => {
    const a = nodeMap[e.from];
    const b = nodeMap[e.to];
    const x1 = a.x + NODE_W / 2;
    const y1 = a.y + NODE_H;
    const x2 = b.x + NODE_W / 2;
    if (b.depth > a.depth) {
      // Normal downstream trace: jog in the gap below the source row.
      const jogY = y1 + 26 + (laneOf.get(e) ?? 0) * 12;
      return { from: e.from, to: e.to, d: chamferedTrace(x1, y1, x2, b.y, jogY) };
    }
    // Back-edge (the one mutual pair): loop below the deeper pad and rise
    // OUTSIDE the pad column, so the return trace stays visibly distinct from
    // the forward trace even when both pads share a column (x1 === x2).
    const jogY = Math.max(y1, b.y + NODE_H) + 22;
    const xSide = Math.min(x1 + NODE_W / 2 + 18, width - 8);
    const xEnter = x2 + NODE_W / 4;
    const yEnter = b.y + NODE_H;
    const d = [
      `M ${x1} ${y1}`,
      `L ${x1} ${jogY}`,
      `L ${xSide} ${jogY}`,
      `L ${xSide} ${yEnter + 14}`,
      `L ${xEnter} ${yEnter + 14}`,
      `L ${xEnter} ${yEnter}`,
    ].join(' ');
    return { from: e.from, to: e.to, d };
  });

  // Signal name = the hub pad (highest degree, ties by id).
  const degree = new Map<string, number>();
  for (const e of compEdges) {
    degree.set(e.from, (degree.get(e.from) ?? 0) + 1);
    degree.set(e.to, (degree.get(e.to) ?? 0) + 1);
  }
  const hub = [...ids].sort(
    (a, b) => (degree.get(b) ?? 0) - (degree.get(a) ?? 0) || COLLATOR.compare(a, b),
  )[0];

  const domainCount = new Map<DomainKey, number>();
  for (const id of ids) {
    const d = SKILL_MAP[id].domain;
    domainCount.set(d, (domainCount.get(d) ?? 0) + 1);
  }
  const domains = [...domainCount.keys()].sort(
    (a, b) => (domainCount.get(b) ?? 0) - (domainCount.get(a) ?? 0) || COLLATOR.compare(a, b),
  );

  const entryIds = nodes
    .filter((n) => n.depth === 0)
    .sort((a, b) => a.x - b.x)
    .map((n) => n.id);

  const num = String(index).padStart(2, '0');
  return {
    id: `net-${num}`,
    index,
    signal: hub.toUpperCase().replace(/-/g, '_'),
    label: `NET-${num}`,
    skillIds: ids,
    nodes,
    nodeMap,
    edges,
    domains,
    entryIds,
    width,
    height,
  };
}

const COMPONENTS = findComponents();

/** The 35 real nets, biggest first. */
export const NETS: Net[] = COMPONENTS.filter((c) => c.length >= 2).map((c, i) => buildNet(c, i + 1));

export const NET_MAP: Record<string, Net> = Object.fromEntries(NETS.map((n) => [n.id, n]));

/** skillId → its net (absent for loose pins). */
export const NET_OF: Record<string, Net> = {};
for (const net of NETS) {
  for (const id of net.skillIds) NET_OF[id] = net;
}

/** The 57 pads with no traces at all — honest, browsable, complete-anytime. */
export const LOOSE_PINS: Skill[] = COMPONENTS.filter((c) => c.length === 1)
  .map((c) => SKILL_MAP[c[0]])
  .sort(byTitle);

// ── User-state derivations ───────────────────────────────────────────────

export type PadState = 'soldered' | 'live' | 'open';

/**
 * soldered = completed. live = every prerequisite soldered (warm, ready).
 * open = some feed still unsoldered — purely a temperature cue, never a
 * lock: every pad stays walkable and completable.
 */
export function padState(skill: Skill, done: ReadonlySet<string>): PadState {
  if (done.has(skill.id)) return 'soldered';
  const ready = skill.suggestedPrerequisites.every((p) => !SKILL_MAP[p] || done.has(p));
  return ready ? 'live' : 'open';
}

export function upstreamOf(skill: Skill): Skill[] {
  return skill.suggestedPrerequisites.map((id) => SKILL_MAP[id]).filter(Boolean);
}

export function downstreamOf(skill: Skill): Skill[] {
  return [...getChildren(skill.id)].sort(byTitle);
}

/**
 * The live frontier: unsoldered pads whose every prerequisite is soldered
 * and that are actually fed by completed work. Pads powered by the most
 * finished joints come first.
 */
export function liveFrontier(done: ReadonlySet<string>): Skill[] {
  if (done.size === 0) return [];
  return ALL_SKILLS.filter(
    (s) =>
      !done.has(s.id) &&
      s.suggestedPrerequisites.some((p) => done.has(p)) &&
      s.suggestedPrerequisites.every((p) => !SKILL_MAP[p] || done.has(p)),
  ).sort(
    (a, b) =>
      b.suggestedPrerequisites.length - a.suggestedPrerequisites.length ||
      a.level - b.level ||
      a.estimatedMinutes - b.estimatedMinutes ||
      byTitle(a, b),
  );
}

/** Entry pads that power the most downstream work — good first joints. */
export function entryPads(done: ReadonlySet<string>): Skill[] {
  return ALL_SKILLS.filter(
    (s) => !done.has(s.id) && s.suggestedPrerequisites.length === 0 && getChildren(s.id).length > 0,
  ).sort((a, b) => getChildren(b.id).length - getChildren(a.id).length || byTitle(a, b));
}

export function netSoldered(net: Net, done: ReadonlySet<string>): number {
  return net.skillIds.reduce((n, id) => n + (done.has(id) ? 1 : 0), 0);
}

// ── Probe (search escape hatch) ──────────────────────────────────────────

export function searchSkills(query: string): Skill[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const tokens = q.split(/\s+/).filter(Boolean);
  const scored: { skill: Skill; score: number }[] = [];
  for (const skill of ALL_SKILLS) {
    const title = skill.title.toLowerCase();
    const rest = `${skill.summary} ${skill.youWillLearn.join(' ')}`.toLowerCase();
    if (!tokens.every((t) => title.includes(t) || rest.includes(t))) continue;
    const score = title.startsWith(q)
      ? 0
      : title.includes(q)
        ? 1
        : tokens.every((t) => title.includes(t))
          ? 2
          : 3;
    scored.push({ skill, score });
  }
  return scored.sort((a, b) => a.score - b.score || byTitle(a.skill, b.skill)).map((s) => s.skill);
}

export const PROBE_SUGGESTIONS = ['budget', 'pasta', 'laundry', 'interview', 'first aid', 'wifi'];
