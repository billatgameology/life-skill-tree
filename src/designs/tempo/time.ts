import { eachMonthOfInterval, format, parseISO, startOfMonth } from 'date-fns';
import { ALL_SKILLS, SKILL_MAP } from '@/data/skills';
import type { Skill } from '@/lib/types';

/** Route base for the Tempo design. All Link/Navigate targets are absolute. */
export const TP_BASE = '/tempo';

export const TOTAL_SKILLS = ALL_SKILLS.length;
/** Every estimatedMinutes in the library summed — the "whole dial". */
export const TOTAL_MINUTES = ALL_SKILLS.reduce((sum, s) => sum + s.estimatedMinutes, 0);

/**
 * Dial stops for "how much time do you have?".
 * Real distribution: 5m x4 · 10m x80 · 15m x91 · 20m x47 · 25m x8 · 30m x3.
 * The last stop (30) is rendered "30+" and admits the whole library, since no
 * skill exceeds 30 minutes.
 */
export const DIAL_STOPS = [5, 10, 15, 20, 30] as const;
export const OPEN_STOP = 30;
export const DEFAULT_BUDGET = 15;

/** Session budgets — every one is exactly reachable from 2–3 real skill durations. */
export const SESSION_BUDGETS = [30, 35, 40, 45] as const;

const DIFF_ORDER: Record<Skill['difficulty'], number> = { easy: 0, medium: 1, hard: 2 };

/** Stable string hash (djb2) — gives the session builder a deterministic, non-alphabetical order. */
function hashId(id: string): number {
  let h = 5381;
  for (let i = 0; i < id.length; i += 1) h = ((h << 5) + h + id.charCodeAt(i)) >>> 0;
  return h;
}

/** All skills that fit inside a minute budget. */
export function fitSkills(budget: number): Skill[] {
  return ALL_SKILLS.filter((s) => s.estimatedMinutes <= budget);
}

/** Quick-win order: not-yet-logged first, then shortest, easiest, alphabetical. */
function quickWinCompare(completed: ReadonlySet<string>) {
  return (a: Skill, b: Skill): number => {
    const ca = completed.has(a.id) ? 1 : 0;
    const cb = completed.has(b.id) ? 1 : 0;
    if (ca !== cb) return ca - cb;
    if (a.estimatedMinutes !== b.estimatedMinutes) return a.estimatedMinutes - b.estimatedMinutes;
    if (DIFF_ORDER[a.difficulty] !== DIFF_ORDER[b.difficulty]) {
      return DIFF_ORDER[a.difficulty] - DIFF_ORDER[b.difficulty];
    }
    return a.title.localeCompare(b.title);
  };
}

export interface MinuteBand {
  minutes: number;
  skills: Skill[];
}

/** The fitting skills, banded by exact duration (the dial's own taxonomy). */
export function minuteBands(budget: number, completed: ReadonlySet<string>): MinuteBand[] {
  const byMinutes = new Map<number, Skill[]>();
  for (const skill of fitSkills(budget)) {
    const list = byMinutes.get(skill.estimatedMinutes);
    if (list) list.push(skill);
    else byMinutes.set(skill.estimatedMinutes, [skill]);
  }
  const cmp = quickWinCompare(completed);
  return [...byMinutes.entries()]
    .sort(([a], [b]) => a - b)
    .map(([minutes, skills]) => ({ minutes, skills: skills.sort(cmp) }));
}

/** "3 h 40 m" / "45 min" — honest accumulated time. */
export function formatDuration(mins: number): string {
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h} h` : `${h} h ${String(m).padStart(2, '0')} m`;
}

/** Sum of estimatedMinutes over a set of skill ids. */
export function investedMinutes(ids: readonly string[]): number {
  return ids.reduce((sum, id) => sum + (SKILL_MAP[id]?.estimatedMinutes ?? 0), 0);
}

// ─── Session assembly ────────────────────────────────────────────────────────

/** Deterministic candidate order: unfinished first, then hash order (stable, non-alphabetical). */
function sessionCandidates(completed: ReadonlySet<string>): Skill[] {
  return [...ALL_SKILLS].sort((a, b) => {
    const ca = completed.has(a.id) ? 1 : 0;
    const cb = completed.has(b.id) ? 1 : 0;
    if (ca !== cb) return ca - cb;
    const ha = hashId(a.id);
    const hb = hashId(b.id);
    if (ha !== hb) return ha - hb;
    return a.id.localeCompare(b.id);
  });
}

/** First exact combination of `size` skills (distinct domains) summing to `budget`. */
function findExact(pool: Skill[], budget: number, size: number): string[] | null {
  const picks: Skill[] = [];
  const dfs = (start: number, remaining: number): boolean => {
    if (picks.length === size) return remaining === 0;
    const slotsLeft = size - picks.length;
    for (let i = start; i < pool.length; i += 1) {
      const s = pool[i];
      // Leave at least 5 minutes for every remaining slot.
      if (s.estimatedMinutes > remaining - 5 * (slotsLeft - 1)) continue;
      if (picks.some((p) => p.domain === s.domain)) continue;
      picks.push(s);
      if (dfs(i + 1, remaining - s.estimatedMinutes)) return true;
      picks.pop();
    }
    return false;
  };
  return dfs(0, budget) ? picks.map((p) => p.id) : null;
}

/** Greedy near-fit fallback (only reachable if no exact combination exists). */
function greedyFit(pool: Skill[], budget: number, size: number): string[] {
  const picks: Skill[] = [];
  let remaining = budget;
  for (const s of pool) {
    if (picks.length === size) break;
    if (s.estimatedMinutes > remaining) continue;
    if (picks.some((p) => p.domain === s.domain)) continue;
    picks.push(s);
    remaining -= s.estimatedMinutes;
  }
  return picks.map((p) => p.id);
}

/**
 * Assemble a session queue for a minute budget: 2–3 skills, distinct domains,
 * summing to the budget exactly when possible, preferring unfinished skills.
 * Deterministic for a given completion state.
 */
export function buildSlots(budget: number, completedIds: readonly string[]): string[] {
  const completed = new Set(completedIds);
  const pool = sessionCandidates(completed).filter((s) => s.estimatedMinutes <= budget - 5);
  return (
    findExact(pool, budget, 3) ??
    findExact(pool, budget, 2) ??
    greedyFit(pool, budget, 3)
  );
}

/**
 * Swap one slot for the next candidate with the SAME duration (keeps the sum
 * intact) and a domain distinct from the other slots. Cycles deterministically.
 */
export function swapSlot(
  slots: readonly string[],
  index: number,
  completedIds: readonly string[],
): string[] {
  const current = SKILL_MAP[slots[index]];
  if (!current) return [...slots];
  const others = slots.filter((_, i) => i !== index);
  const otherDomains = new Set(others.map((id) => SKILL_MAP[id]?.domain));
  const ring = sessionCandidates(new Set(completedIds)).filter(
    (s) =>
      s.estimatedMinutes === current.estimatedMinutes &&
      !otherDomains.has(s.domain) &&
      !others.includes(s.id),
  );
  if (ring.length <= 1) return [...slots];
  const pos = ring.findIndex((s) => s.id === current.id);
  const next = ring[(pos + 1) % ring.length];
  const out = [...slots];
  out[index] = next.id;
  return out;
}

// ─── Invested history ────────────────────────────────────────────────────────

export interface MonthRhythm {
  key: string;
  label: string;
  minutes: number;
  count: number;
  isCurrent: boolean;
}

/**
 * Month-by-month practice rhythm from completion dates. Every month between the
 * first logged skill and now appears (quiet months stay quiet — never scolded).
 */
export function monthlyRhythm(completionDates: Record<string, string>): MonthRhythm[] {
  const entries = Object.entries(completionDates).filter(([id]) => SKILL_MAP[id]);
  if (entries.length === 0) return [];
  const dates = entries.map(([, d]) => parseISO(d));
  const earliest = dates.reduce((a, b) => (a < b ? a : b));
  const now = new Date();
  const byKey = new Map<string, { minutes: number; count: number }>();
  for (const [id, d] of entries) {
    const key = format(parseISO(d), 'yyyy-MM');
    const agg = byKey.get(key) ?? { minutes: 0, count: 0 };
    agg.minutes += SKILL_MAP[id].estimatedMinutes;
    agg.count += 1;
    byKey.set(key, agg);
  }
  const currentKey = format(now, 'yyyy-MM');
  return eachMonthOfInterval({ start: startOfMonth(earliest), end: now }).map((m) => {
    const key = format(m, 'yyyy-MM');
    const agg = byKey.get(key) ?? { minutes: 0, count: 0 };
    return { key, label: format(m, 'MMM yyyy'), isCurrent: key === currentKey, ...agg };
  });
}

/** "12 Jun 2026" from a "YYYY-MM-DD" completion date. */
export function formatDay(isoDate: string): string {
  return format(parseISO(isoDate), 'd MMM yyyy');
}

// ─── Search (the escape hatch) ───────────────────────────────────────────────

export function searchSkills(query: string, limit = 40): Skill[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const scored: { s: Skill; score: number }[] = [];
  for (const s of ALL_SKILLS) {
    const title = s.title.toLowerCase();
    let score = -1;
    if (title.startsWith(q)) score = 0;
    else if (title.includes(q)) score = 1;
    else if (s.tags?.some((t) => t.toLowerCase().includes(q))) score = 2;
    else if (s.summary.toLowerCase().includes(q)) score = 3;
    if (score >= 0) scored.push({ s, score });
  }
  scored.sort(
    (a, b) =>
      a.score - b.score ||
      a.s.estimatedMinutes - b.s.estimatedMinutes ||
      a.s.title.localeCompare(b.s.title),
  );
  return scored.slice(0, limit).map((x) => x.s);
}
