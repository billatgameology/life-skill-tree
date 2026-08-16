import { ALL_SKILLS, CATEGORIES, CATEGORY_KEYS, getChildren } from '@/data/skills';
import type { DomainKey, Skill } from '@/lib/types';

/**
 * Trail's view of the shared skill library: ONE continuous path through all
 * 233 skills. A deterministic global ordering (topological over the
 * prerequisite DAG, gradient from easy level-1 toward hard level-3, domains
 * interleaved so consecutive stretches vary), chunked into named LEGS of
 * ~15–20 waypoints. Pure derivation — no content changes.
 */

/** The app-root path this design is mounted under (see src/designs/registry.tsx). */
export const TR_BASE = '/trail';

// Pinned collation: the waypoint order (and every number printed from it)
// must not vary with the viewer's browser locale.
const COLLATOR = new Intl.Collator('en');

const DIFFICULTY_ORDER: Record<Skill['difficulty'], number> = { easy: 0, medium: 1, hard: 2 };

/** Gradient band 0..8: level first, difficulty within a level. */
function gradeOf(s: Skill): number {
  return (s.level - 1) * 3 + DIFFICULTY_ORDER[s.difficulty];
}

/**
 * Domain hues darkened until they hold >=4.5:1 on the parchment ground
 * (#F0E8D2), so they are safe as small text and marker rings alike.
 * White text on any of them clears 6:1.
 */
export const TRAIL_TINTS: Record<DomainKey, string> = {
  'digital-basics': '#3F6467',
  'navigation': '#4A6379',
  'money-finance': '#6F5C32',
  'food-cooking': '#456650',
  'home-care': '#6F5D45',
  'communication': '#6E577A',
  'health-safety': '#875353',
  'organization': '#555F6C',
  'career-work': '#57616C',
  'school-learning': '#5A633C',
  'civic-community': '#4E626B',
  'emotional-skills': '#705A66',
  'outdoor-everyday': '#526647',
  'housing-living': '#69604A',
  'shopping-consumer': '#775C49',
};

/**
 * THE ordering. Kahn's topological sort over the prerequisite DAG where the
 * next waypoint is always chosen from the ready set (all prereqs already
 * placed) by: lowest gradient band first (easy level-1 → hard level-3), then
 * the least-recently-visited domain (so consecutive stretches vary), then
 * Intl.Collator('en') on title. Fully deterministic. A prereq therefore
 * always appears before its dependents, except across a data cycle, where the
 * guard below breaks the tie the same deterministic way.
 */
function buildTrail(): Skill[] {
  const byId = new Map(ALL_SKILLS.map((s) => [s.id, s]));
  const indegree = new Map<string, number>();
  const dependents = new Map<string, string[]>();

  // Break mutual 2-cycles up front (the data has one: give-useful-feedback ↔
  // receive-feedback-calmly). Without this, neither member is ever "ready",
  // so both sink to the very end of the trail via the guard below instead of
  // sitting at their natural band. Drop the edge INTO the member that orders
  // first under the same grade/collator rule, keeping the other direction.
  const skipEdge = new Set<string>();
  for (const s of ALL_SKILLS) {
    for (const p of s.suggestedPrerequisites) {
      const other = byId.get(p);
      if (!other || !other.suggestedPrerequisites.includes(s.id)) continue;
      const sFirst =
        gradeOf(s) < gradeOf(other) ||
        (gradeOf(s) === gradeOf(other) && COLLATOR.compare(s.title, other.title) < 0);
      const first = sFirst ? s : other;
      const second = sFirst ? other : s;
      skipEdge.add(`${second.id}->${first.id}`);
    }
  }

  for (const s of ALL_SKILLS) {
    const prereqs = s.suggestedPrerequisites.filter(
      (p) => byId.has(p) && !skipEdge.has(`${p}->${s.id}`),
    );
    indegree.set(s.id, prereqs.length);
    for (const p of prereqs) {
      const list = dependents.get(p);
      if (list) list.push(s.id);
      else dependents.set(p, [s.id]);
    }
  }

  const remaining = new Set(ALL_SKILLS.map((s) => s.id));
  const lastDomainPick = new Map<DomainKey, number>();
  const order: Skill[] = [];

  const better = (a: Skill, b: Skill): boolean => {
    const g = gradeOf(a) - gradeOf(b);
    if (g !== 0) return g < 0;
    const la = lastDomainPick.get(a.domain) ?? -1;
    const lb = lastDomainPick.get(b.domain) ?? -1;
    if (la !== lb) return la < lb;
    return COLLATOR.compare(a.title, b.title) < 0;
  };

  while (remaining.size > 0) {
    let pick: Skill | null = null;
    for (const id of remaining) {
      if ((indegree.get(id) ?? 0) > 0) continue;
      const s = byId.get(id);
      if (s && (!pick || better(s, pick))) pick = s;
    }
    if (!pick) {
      // Cycle guard: no ready skill left — pick among everything remaining.
      for (const id of remaining) {
        const s = byId.get(id);
        if (s && (!pick || better(s, pick))) pick = s;
      }
    }
    if (!pick) break; // unreachable; satisfies the type checker
    order.push(pick);
    remaining.delete(pick.id);
    lastDomainPick.set(pick.domain, order.length - 1);
    for (const d of dependents.get(pick.id) ?? []) {
      indegree.set(d, Math.max(0, (indegree.get(d) ?? 0) - 1));
    }
  }
  return order;
}

export interface TrailStop {
  skill: Skill;
  /** 0-based position along the whole trail. */
  index: number;
  /** 1-based waypoint number, the one printed on markers. */
  num: number;
  /** Padded printed form, e.g. "047". */
  numLabel: string;
  /** Horizontal position of the marker, percent of trail width (17..83). */
  x: number;
  /** Index of the leg this waypoint belongs to. */
  legIndex: number;
}

// ─── Serpentine geometry (shared by page + path) ───
// One global sine so the meander is continuous across leg boundaries.
const MEANDER_AMPLITUDE = 33; // percent of trail width
const MEANDER_STEP = 0.7; // radians per waypoint (~9 waypoints per full bend)

function meanderX(index: number): number {
  return Math.round((50 + MEANDER_AMPLITUDE * Math.sin(index * MEANDER_STEP)) * 100) / 100;
}

const ORDERED = buildTrail();

// ─── Legs: even chunks of ~16 waypoints ───
const LEG_TARGET = 16;
const LEG_COUNT = Math.max(1, Math.round(ORDERED.length / LEG_TARGET));
const LEG_BASE = Math.floor(ORDERED.length / LEG_COUNT);
const LEG_EXTRA = ORDERED.length - LEG_BASE * LEG_COUNT; // first LEG_EXTRA legs get one more

function legIndexOf(trailIndex: number): number {
  const bigSpan = LEG_EXTRA * (LEG_BASE + 1);
  if (trailIndex < bigSpan) return Math.floor(trailIndex / (LEG_BASE + 1));
  return LEG_EXTRA + Math.floor((trailIndex - bigSpan) / LEG_BASE);
}

export const TRAIL: TrailStop[] = ORDERED.map((skill, index) => ({
  skill,
  index,
  num: index + 1,
  numLabel: String(index + 1).padStart(3, '0'),
  x: meanderX(index),
  legIndex: legIndexOf(index),
}));

export const STOP_MAP: Record<string, TrailStop> = Object.fromEntries(
  TRAIL.map((t) => [t.skill.id, t]),
);

export const TOTAL_STOPS = TRAIL.length;
export const TOTAL_MINUTES = ALL_SKILLS.reduce((n, s) => n + s.estimatedMinutes, 0);

// ─── Leg naming: derived, never hand-written per leg ───
// Each domain has a fixed trail-feature word; the terrain word comes from the
// leg's average level (how steep the going is), varied cyclically so names
// don't repeat back-to-back. Name = "<feature> <terrain>", always paired with
// a plain-language line naming the dominant domain(s).
const DOMAIN_FEATURES: Record<DomainKey, string> = {
  'digital-basics': 'Signal',
  'navigation': 'Compass',
  'money-finance': 'Ledger',
  'food-cooking': 'Hearth',
  'home-care': 'Homestead',
  'communication': 'Echo',
  'health-safety': 'Wellspring',
  'organization': 'Cairn',
  'career-work': 'Foundry',
  'school-learning': 'Lantern',
  'civic-community': 'Commons',
  'emotional-skills': 'Stillwater',
  'outdoor-everyday': 'Timberline',
  'housing-living': 'Shelter',
  'shopping-consumer': 'Market',
};

const TERRAIN_WORDS: string[][] = [
  ['Meadows', 'Flats', 'Foothills'], // easy going
  ['Ridge', 'Hollow', 'Bend'], // steady climbing
  ['Heights', 'Pass', 'Summits'], // steep going
];

/** Feature words for legs where no single domain dominates (the interleaving works). */
const MIXED_FEATURES = ['Crossing', 'Confluence', 'Wayfarer', 'Rambler', 'Patchwork'];

/** A domain "dominates" a ~16-waypoint leg from 4 waypoints up. */
const DOMINANT_MIN = 4;

const GOING_PHRASES = ['easy going', 'steady climbing', 'steep going'];

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX'];

export function romanNumeral(n: number): string {
  return ROMAN[n - 1] ?? String(n);
}

export interface Leg {
  index: number;
  roman: string;
  /** Derived name, e.g. "Hearth Foothills". */
  name: string;
  /** Plain-language pairing, e.g. "Mostly Food & Cooking, with some Home Care · easy going". */
  pairing: string;
  /** Dominant domain of the leg (most waypoints). */
  domain: DomainKey;
  tint: string;
  stops: TrailStop[];
  startNum: number;
  endNum: number;
}

function deriveLeg(index: number, stops: TrailStop[]): Leg {
  const counts = new Map<DomainKey, number>();
  for (const s of stops) counts.set(s.skill.domain, (counts.get(s.skill.domain) ?? 0) + 1);
  // Dominant + runner-up, ties broken by the fixed CATEGORY_KEYS order.
  const ranked = CATEGORY_KEYS.filter((k) => counts.has(k)).sort(
    (a, b) => (counts.get(b) ?? 0) - (counts.get(a) ?? 0),
  );
  const dominant = ranked[0];
  const dominantCount = counts.get(dominant) ?? 0;
  const second = ranked.length > 1 ? ranked[1] : null;

  const avgLevel = stops.reduce((n, s) => n + s.skill.level, 0) / stops.length;
  const band = avgLevel < 1.45 ? 0 : avgLevel < 2.2 ? 1 : 2;
  const terrain = TERRAIN_WORDS[band][index % TERRAIN_WORDS[band].length];

  const dominated = dominantCount >= DOMINANT_MIN;
  const feature = dominated
    ? DOMAIN_FEATURES[dominant]
    : MIXED_FEATURES[index % MIXED_FEATURES.length];
  const pairing = dominated
    ? `Mostly ${CATEGORIES[dominant].name}${second && (counts.get(second) ?? 0) >= 3 ? `, with some ${CATEGORIES[second].name}` : ''} · ${GOING_PHRASES[band]}`
    : `A mixed stretch — ${CATEGORIES[dominant].name}${second ? `, ${CATEGORIES[second].name}` : ''} & more · ${GOING_PHRASES[band]}`;

  return {
    index,
    roman: romanNumeral(index + 1),
    name: `${feature} ${terrain}`,
    pairing,
    domain: dominant,
    tint: TRAIL_TINTS[dominant],
    stops,
    startNum: stops[0].num,
    endNum: stops[stops.length - 1].num,
  };
}

export const LEGS: Leg[] = (() => {
  const legs: TrailStop[][] = Array.from({ length: LEG_COUNT }, () => []);
  for (const stop of TRAIL) legs[stop.legIndex].push(stop);
  return legs.map((stops, i) => deriveLeg(i, stops));
})();

export const TOTAL_LEGS = LEGS.length;

// ─── Layout constants shared by the trail page ───
/** Vertical pixels reserved for a leg's header card (the path passes behind it). */
export const LEG_HEADER_H = 128;
/** Vertical pixels per waypoint row. */
export const ROW_H = 86;

export function legPixelHeight(leg: Leg): number {
  return LEG_HEADER_H + leg.stops.length * ROW_H;
}

/** y (px, within the leg block) of a waypoint's marker center. */
export function stopY(localIndex: number): number {
  return LEG_HEADER_H + localIndex * ROW_H + ROW_H / 2;
}

/**
 * The dashed trail line of one leg block, in 0..1000 x-units (stretched to
 * the block's width; y-units are pixels). Enters at the top edge at the
 * previous leg's exit x, curves behind the header to each waypoint, and
 * leaves through the bottom edge at its own last x.
 */
export function legPathD(leg: Leg, entryX: number | null, exit: boolean): string {
  const pts = leg.stops.map((s, i) => ({ x: s.x * 10, y: stopY(i) }));
  const first = pts[0];
  let d: string;
  if (entryX !== null) {
    const ex = entryX * 10;
    d = `M ${ex} 0 C ${ex} ${first.y * 0.55}, ${first.x} ${first.y * 0.55}, ${first.x} ${first.y}`;
  } else {
    d = `M ${first.x} ${first.y}`;
  }
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    const my = (a.y + b.y) / 2;
    d += ` C ${a.x} ${my}, ${b.x} ${my}, ${b.x} ${b.y}`;
  }
  if (exit) {
    const last = pts[pts.length - 1];
    d += ` L ${last.x} ${legPixelHeight(leg)}`;
  }
  return d;
}

// ─── Progress, in the trail's own terms ───

export function traveledCount(completedIds: string[]): number {
  const done = new Set(completedIds);
  return TRAIL.reduce((n, t) => n + (done.has(t.skill.id) ? 1 : 0), 0);
}

export function traveledPercent(completedIds: string[]): number {
  return Math.round((traveledCount(completedIds) / TOTAL_STOPS) * 100);
}

/** The furthest waypoint you have blazed, by trail position. */
export function furthestStop(completedIds: string[]): TrailStop | null {
  const done = new Set(completedIds);
  for (let i = TRAIL.length - 1; i >= 0; i--) {
    if (done.has(TRAIL[i].skill.id)) return TRAIL[i];
  }
  return null;
}

/** The first unblazed waypoint from the trailhead — the "continue" target. */
export function firstUnvisited(completedIds: string[]): TrailStop | null {
  const done = new Set(completedIds);
  for (const t of TRAIL) {
    if (!done.has(t.skill.id)) return t;
  }
  return null;
}

export function legBlazedCount(leg: Leg, completedIds: string[]): number {
  const done = new Set(completedIds);
  return leg.stops.reduce((n, s) => n + (done.has(s.skill.id) ? 1 : 0), 0);
}

export function clearedLegCount(completedIds: string[]): number {
  return LEGS.reduce((n, leg) => n + (legBlazedCount(leg, completedIds) === leg.stops.length ? 1 : 0), 0);
}

/** Minutes of trail behind you: estimatedMinutes summed over blazed waypoints. */
export function minutesTraveled(completedIds: string[]): number {
  const done = new Set(completedIds);
  return TRAIL.reduce((n, t) => n + (done.has(t.skill.id) ? t.skill.estimatedMinutes : 0), 0);
}

export function formatMinutes(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

// ─── Junctions (the prerequisite DAG, resolved to trail positions) ───

function junctionStops(skill: Skill): TrailStop[] {
  const ids = new Set<string>([
    ...skill.suggestedPrerequisites,
    ...getChildren(skill.id).map((s) => s.id),
  ]);
  return [...ids]
    .map((id) => STOP_MAP[id])
    .filter((t): t is TrailStop => Boolean(t))
    .sort((a, b) => a.index - b.index);
}

/** Junction waypoints that genuinely sit earlier on the trail than this one —
 *  partitioned by actual position, so the heading can never lie. */
export function earlierJunctions(skill: Skill): TrailStop[] {
  const me = STOP_MAP[skill.id];
  return junctionStops(skill).filter((t) => Boolean(me) && t.index < me.index);
}

/** Junction waypoints further along the trail than this one. */
export function laterJunctions(skill: Skill): TrailStop[] {
  const me = STOP_MAP[skill.id];
  return junctionStops(skill).filter((t) => Boolean(me) && t.index > me.index);
}

/** Previous / next waypoint along the global trail. */
export function prevNextStop(skillId: string): { prev: TrailStop | null; next: TrailStop | null } {
  const stop = STOP_MAP[skillId];
  if (!stop) return { prev: null, next: null };
  return {
    prev: stop.index > 0 ? TRAIL[stop.index - 1] : null,
    next: stop.index < TRAIL.length - 1 ? TRAIL[stop.index + 1] : null,
  };
}

// ─── Search (the escape hatch to any waypoint) ───

/** Substring match over title + summary + youWillLearn, title hits first. */
export function searchTrail(query: string): TrailStop[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const tokens = q.split(/\s+/).filter(Boolean);
  const scored: { stop: TrailStop; score: number }[] = [];
  for (const stop of TRAIL) {
    const title = stop.skill.title.toLowerCase();
    const rest = `${stop.skill.summary} ${stop.skill.youWillLearn.join(' ')}`.toLowerCase();
    if (!tokens.every((t) => title.includes(t) || rest.includes(t))) continue;
    const score = title.startsWith(q) ? 0 : title.includes(q) ? 1 : tokens.every((t) => title.includes(t)) ? 2 : 3;
    scored.push({ stop, score });
  }
  return scored
    .sort((a, b) => a.score - b.score || a.stop.index - b.stop.index)
    .map((s) => s.stop);
}

/** Warm dead-end suggestions for the finder. */
export const FINDER_SUGGESTIONS = [
  'boil pasta',
  'budget',
  'laundry',
  'interview',
  'first aid',
  'phishing',
];
