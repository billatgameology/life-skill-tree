import { format, parseISO } from 'date-fns';
import { ALL_SKILLS, CATEGORIES, CATEGORY_KEYS, SKILL_MAP, getChildren } from '@/data/skills';
import type { DomainKey, Skill } from '@/lib/types';

/**
 * Frontier's view of the shared skill library: the collection is organized by
 * the USER'S OWN COMPLETION STATE, not the taxonomy. Every skill stands in one
 * of three bands relative to this user —
 *
 *   BEHIND   — completed ground, honored chronologically,
 *   FRONTIER — the actionable edge: every suggested prerequisite covered,
 *   BEYOND   — reachable later; never locked, just further out.
 *
 * Pure derivation over the shared data — no content changes, no local storage.
 */

/** The app-root path this design is mounted under (see src/designs/registry.tsx). */
export const FR_BASE = '/frontier';

export const TOTAL = ALL_SKILLS.length;

/**
 * Domain hues lifted toward dawn-lit pastels so they hold >=4.5:1 as small
 * label text on the night ground (#10162B) and card dusk (#1A2140) alike.
 */
export const TINTS: Record<DomainKey, string> = {
  'digital-basics': '#7FC7CE',
  'navigation': '#8FB6DE',
  'money-finance': '#DDBB6C',
  'food-cooking': '#86C79E',
  'home-care': '#CCAC82',
  'communication': '#C2A0D6',
  'health-safety': '#DA9494',
  'organization': '#A3B6CB',
  'career-work': '#AABDCE',
  'school-learning': '#BBCB84',
  'civic-community': '#96C1D3',
  'emotional-skills': '#D0A6BC',
  'outdoor-everyday': '#A8C994',
  'housing-living': '#C8B792',
  'shopping-consumer': '#DBAD8B',
};

export function domainName(domain: DomainKey): string {
  return CATEGORIES[domain].name;
}

/** Where a skill stands relative to this user's progress. */
export type Standing = 'behind' | 'frontier' | 'beyond';

export function standingOf(skill: Skill, done: ReadonlySet<string>): Standing {
  if (done.has(skill.id)) return 'behind';
  return skill.suggestedPrerequisites.every((p) => done.has(p)) ? 'frontier' : 'beyond';
}

export function standingWord(standing: Standing): string {
  return standing === 'behind' ? 'covered' : standing === 'frontier' ? 'within reach' : 'further out';
}

export interface Survey {
  behind: Skill[];
  frontier: Skill[];
  beyond: Skill[];
}

/** One pass over the whole library, banded by this user's completions. */
export function surveyTerritory(completedIds: string[]): Survey {
  const done = new Set(completedIds);
  const result: Survey = { behind: [], frontier: [], beyond: [] };
  for (const skill of ALL_SKILLS) result[standingOf(skill, done)].push(skill);
  return result;
}

const DIFF_ORDER: Record<Skill['difficulty'], number> = { easy: 0, medium: 1, hard: 2 };

export const DIFF_LABEL: Record<Skill['difficulty'], string> = {
  easy: 'easy',
  medium: 'moderate',
  hard: 'hard',
};

export const STAGE_LABEL: Record<number, string> = {
  1: 'base terrain',
  2: 'higher ground',
  3: 'summit work',
};

export function stageLabel(level: number): string {
  return STAGE_LABEL[level] ?? 'far country';
}

// Pinned collation so ordering never varies with the viewer's browser locale.
const COLLATOR = new Intl.Collator('en');

/** Deterministic small PRNG so "show me different ground" is a seeded re-deal. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(items: T[], rand: () => number): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * The curated frontier hand: never the whole edge (98 skills for a brand-new
 * user), but a small deal sampled round-robin across domains — easy, short
 * work surfacing first with seeded jitter for variety. `pinnedIds` (skills
 * just unlocked by an advance) always lead the hand.
 */
export function dealHand(
  frontier: Skill[],
  seed: number,
  count: number,
  pinnedIds: string[],
): Skill[] {
  const inFrontier = new Map(frontier.map((s) => [s.id, s]));
  const pinned = pinnedIds
    .map((id) => inFrontier.get(id))
    .filter((s): s is Skill => Boolean(s));
  const pinnedSet = new Set(pinned.map((s) => s.id));

  const rand = mulberry32(seed);
  const jitter = new Map<string, number>();
  for (const s of frontier) jitter.set(s.id, rand() * 26);

  const buckets = new Map<DomainKey, Skill[]>();
  for (const s of frontier) {
    if (pinnedSet.has(s.id)) continue;
    const bucket = buckets.get(s.domain);
    if (bucket) bucket.push(s);
    else buckets.set(s.domain, [s]);
  }
  for (const bucket of buckets.values()) {
    bucket.sort((a, b) => {
      const scoreA = DIFF_ORDER[a.difficulty] * 18 + a.estimatedMinutes + (a.level - 1) * 10 + (jitter.get(a.id) ?? 0);
      const scoreB = DIFF_ORDER[b.difficulty] * 18 + b.estimatedMinutes + (b.level - 1) * 10 + (jitter.get(b.id) ?? 0);
      return scoreA - scoreB || COLLATOR.compare(a.title, b.title);
    });
  }

  const domainOrder = seededShuffle(
    CATEGORY_KEYS.filter((k) => buckets.has(k)),
    rand,
  );

  const hand: Skill[] = [...pinned];
  let dealt = true;
  while (hand.length < count && dealt) {
    dealt = false;
    for (const domain of domainOrder) {
      const bucket = buckets.get(domain);
      if (!bucket || bucket.length === 0) continue;
      hand.push(bucket.shift() as Skill);
      dealt = true;
      if (hand.length >= count) break;
    }
  }
  return hand;
}

export function prereqsOf(skill: Skill): Skill[] {
  return skill.suggestedPrerequisites.flatMap((id) => {
    const s = SKILL_MAP[id];
    return s ? [s] : [];
  });
}

export function unmetPrereqs(skill: Skill, completedIds: string[]): Skill[] {
  const done = new Set(completedIds);
  return prereqsOf(skill).filter((p) => !done.has(p.id));
}

/** Skills that list this one as groundwork ("opens onto"). */
export function leadsTo(skill: Skill): Skill[] {
  return [...getChildren(skill.id)].sort((a, b) => COLLATOR.compare(a.title, b.title));
}

/**
 * Which beyond-band skills would slide INTO the frontier if `skillId` were
 * completed on top of `completedIds`. Computed BEFORE the completion lands,
 * so the migration can be shown as it happens.
 */
export function wouldUnlock(skillId: string, completedIds: string[]): Skill[] {
  const done = new Set(completedIds);
  done.add(skillId);
  return getChildren(skillId)
    .filter(
      (c) =>
        !completedIds.includes(c.id) &&
        c.suggestedPrerequisites.includes(skillId) &&
        !c.suggestedPrerequisites.every((p) => completedIds.includes(p)) &&
        c.suggestedPrerequisites.every((p) => done.has(p)),
    )
    .sort((a, b) => COLLATOR.compare(a.title, b.title));
}

export interface StepAway {
  skill: Skill;
  missing: Skill;
}

/** Beyond-band skills missing exactly one prerequisite — the next ridgeline. */
export function oneStepAway(beyond: Skill[], completedIds: string[]): StepAway[] {
  const done = new Set(completedIds);
  const steps: StepAway[] = [];
  for (const skill of beyond) {
    const missing = skill.suggestedPrerequisites.filter((p) => !done.has(p));
    if (missing.length !== 1) continue;
    const missingSkill = SKILL_MAP[missing[0]];
    if (missingSkill) steps.push({ skill, missing: missingSkill });
  }
  return steps.sort(
    (a, b) =>
      DIFF_ORDER[a.skill.difficulty] - DIFF_ORDER[b.skill.difficulty] ||
      a.skill.estimatedMinutes - b.skill.estimatedMinutes ||
      COLLATOR.compare(a.skill.title, b.skill.title),
  );
}

// ─── Chronology ───

export function fmtDay(iso: string): string {
  try {
    return format(parseISO(iso), 'd MMM yyyy').toUpperCase();
  } catch {
    return iso.toUpperCase();
  }
}

export function fmtDayShort(iso: string): string {
  try {
    return format(parseISO(iso), 'MMM d').toUpperCase();
  } catch {
    return iso;
  }
}

export interface TrailMark {
  skill: Skill;
  /** "YYYY-MM-DD" or '' when the date was never recorded. */
  date: string;
  dateLabel: string;
}

/**
 * The ground behind, oldest -> newest, so the trail reads left-to-right into
 * the frontier. Undated completions (older accounts) walk at the far end.
 */
export function trailOf(completedIds: string[], completionDates: Record<string, string>): TrailMark[] {
  return completedIds
    .flatMap((id) => {
      const s = SKILL_MAP[id];
      return s ? [s] : [];
    })
    .map((skill: Skill) => {
      const date = completionDates[skill.id] ?? '';
      return { skill, date, dateLabel: date ? fmtDayShort(date) : '—' };
    })
    .sort(
      (a, b) =>
        a.date.localeCompare(b.date) || COLLATOR.compare(a.skill.title, b.skill.title),
    );
}

export interface LogDay {
  label: string;
  marks: TrailMark[];
}

/** The full expedition log: newest day first. */
export function logDays(completedIds: string[], completionDates: Record<string, string>): LogDay[] {
  const marks = trailOf(completedIds, completionDates).reverse();
  const days: LogDay[] = [];
  for (const mark of marks) {
    const label = mark.date ? fmtDay(mark.date) : 'UNDATED';
    const last = days[days.length - 1];
    if (last && last.label === label) last.marks.push(mark);
    else days.push({ label, marks: [mark] });
  }
  return days;
}

// ─── Scout (search escape hatch) ───

/** Substring token match over title + summary + youWillLearn + domain name. */
export function scoutSkills(query: string): Skill[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const tokens = q.split(/\s+/).filter(Boolean);
  const scored: { skill: Skill; score: number }[] = [];
  for (const skill of ALL_SKILLS) {
    const title = skill.title.toLowerCase();
    const rest = `${skill.summary} ${skill.youWillLearn.join(' ')} ${domainName(skill.domain)}`.toLowerCase();
    if (!tokens.every((t) => title.includes(t) || rest.includes(t))) continue;
    const score = title.startsWith(q) ? 0 : title.includes(q) ? 1 : tokens.every((t) => title.includes(t)) ? 2 : 3;
    scored.push({ skill, score });
  }
  return scored
    .sort((a, b) => a.score - b.score || COLLATOR.compare(a.skill.title, b.skill.title))
    .map((s) => s.skill)
    .slice(0, 40);
}

export const SCOUT_HINTS = ['boil pasta', 'budget', 'laundry', 'interview', 'first aid', 'phishing'];
