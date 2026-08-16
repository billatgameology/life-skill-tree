import { ALL_SKILLS, CATEGORIES, CATEGORY_KEYS, getChildren } from '@/data/skills';
import type { DomainKey, Skill } from '@/lib/types';

/**
 * Interchange's view of the shared skill library: the 15 domains become
 * transit LINES, the 233 skills become STATIONS ordered along them, and
 * levels 1–3 become fare ZONES. Pure derivation — no content changes.
 */

/** The app-root path this design is mounted under (see src/designs/registry.tsx). */
export const IC_BASE = '/interchange';

/** Two-letter line codes, transit style. */
export const LINE_CODES: Record<DomainKey, string> = {
  'digital-basics': 'DG',
  'navigation': 'NV',
  'money-finance': 'MF',
  'food-cooking': 'FC',
  'home-care': 'HC',
  'communication': 'CM',
  'health-safety': 'HS',
  'organization': 'OR',
  'career-work': 'CW',
  'school-learning': 'SL',
  'civic-community': 'CC',
  'emotional-skills': 'EM',
  'outdoor-everyday': 'OD',
  'housing-living': 'HL',
  'shopping-consumer': 'SH',
};

/**
 * Domain hues deepened ~10% so shapes hit >=3:1 contrast on the paper ground.
 * Used ONLY for shapes (lines, bullets, ticks, rules) — never for body text.
 */
export const LINE_COLORS: Record<DomainKey, string> = {
  'digital-basics': '#47898E',
  'navigation': '#4A6E8E',
  'money-finance': '#A9853B',
  'food-cooking': '#4F8060',
  'home-care': '#8C6F4A',
  'communication': '#7D5C8F',
  'health-safety': '#944B4B',
  'organization': '#5C6C7E',
  'career-work': '#697A8B',
  'school-learning': '#7A8A49',
  'civic-community': '#5A7A8A',
  'emotional-skills': '#8A697A',
  'outdoor-everyday': '#6A8A59',
  'housing-living': '#8A7A59',
  'shopping-consumer': '#A77A59',
};

/**
 * Line colors darkened where needed so 100% white text reaches >=4.5:1 (WCAG AA).
 * Used for surfaces that carry white text: bullets, ribbons, step numerals, pills.
 */
export const LINE_COLORS_DARK: Record<DomainKey, string> = {
  'digital-basics': '#417E83',
  'navigation': '#4A6E8E',
  'money-finance': '#8E7032',
  'food-cooking': '#4D7D5E',
  'home-care': '#8C6F4A',
  'communication': '#7D5C8F',
  'health-safety': '#944B4B',
  'organization': '#5C6C7E',
  'career-work': '#657585',
  'school-learning': '#6B7940',
  'civic-community': '#587887',
  'emotional-skills': '#8A697A',
  'outdoor-everyday': '#5F7C50',
  'housing-living': '#827354',
  'shopping-consumer': '#936B4E',
};

const DIFFICULTY_ORDER: Record<Skill['difficulty'], number> = { easy: 0, medium: 1, hard: 2 };

// Pinned collation: station order (and the printed codes derived from it) must
// not vary with the viewer's browser locale.
const COLLATOR = new Intl.Collator('en');

/** Zone = skill level, with a plain-language pairing so the metaphor never stands alone. */
export const ZONE_NAMES: Record<number, string> = {
  1: 'Foundations',
  2: 'Building up',
  3: 'Going further',
};

export function zoneLabel(level: number): string {
  return `Zone ${level} — ${ZONE_NAMES[level] ?? 'Further out'}`;
}

export interface LineDef {
  domain: DomainKey;
  code: string;
  name: string;
  color: string;
  /** White-text-safe darker variant (bullets, ribbons, step numerals). */
  dark: string;
  /** Stations in deterministic learning order: zone (level) → difficulty → title. */
  stations: Skill[];
}

function stationCompare(a: Skill, b: Skill): number {
  if (a.level !== b.level) return a.level - b.level;
  const d = DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty];
  if (d !== 0) return d;
  return COLLATOR.compare(a.title, b.title);
}

export const LINES: LineDef[] = CATEGORY_KEYS.map((domain) => ({
  domain,
  code: LINE_CODES[domain],
  name: CATEGORIES[domain].name,
  color: LINE_COLORS[domain],
  dark: LINE_COLORS_DARK[domain],
  stations: ALL_SKILLS.filter((s) => s.domain === domain).sort(stationCompare),
}));

export const LINE_MAP: Record<DomainKey, LineDef> = Object.fromEntries(
  LINES.map((l) => [l.domain, l]),
) as Record<DomainKey, LineDef>;

export interface StationInfo {
  skill: Skill;
  line: LineDef;
  /** 0-based position along the line. */
  index: number;
  /** Printed station code, e.g. "MF-07" (1-based, zero-padded). */
  code: string;
}

export const STATIONS: Record<string, StationInfo> = {};
for (const line of LINES) {
  line.stations.forEach((skill, index) => {
    STATIONS[skill.id] = {
      skill,
      line,
      index,
      code: `${line.code}-${String(index + 1).padStart(2, '0')}`,
    };
  });
}

export interface Zone {
  level: number;
  label: string;
  stations: Skill[];
}

/** Group a line's stations into its (non-empty) zones, in order. */
export function zonesOf(line: LineDef): Zone[] {
  const zones: Zone[] = [];
  for (const skill of line.stations) {
    const last = zones[zones.length - 1];
    if (last && last.level === skill.level) {
      last.stations.push(skill);
    } else {
      zones.push({ level: skill.level, label: zoneLabel(skill.level), stations: [skill] });
    }
  }
  return zones;
}

/** Prerequisite stations that live on a DIFFERENT line — the interchanges. */
export function crossLinePrereqs(skill: Skill): StationInfo[] {
  return skill.suggestedPrerequisites
    .map((id) => STATIONS[id])
    .filter((info): info is StationInfo => Boolean(info) && info.line.domain !== skill.domain);
}

/** All prerequisite stations (any line), resolved. */
export function prereqStations(skill: Skill): StationInfo[] {
  return skill.suggestedPrerequisites
    .map((id) => STATIONS[id])
    .filter((info): info is StationInfo => Boolean(info));
}

/** Stations that list this one as a prerequisite (onward connections). */
export function onwardStations(skill: Skill): StationInfo[] {
  return getChildren(skill.id)
    .map((s) => STATIONS[s.id])
    .filter((info): info is StationInfo => Boolean(info));
}

/** Previous / next stop along the same line, in learning order. */
export function prevNextStop(stationId: string): { prev: StationInfo | null; next: StationInfo | null } {
  const info = STATIONS[stationId];
  if (!info) return { prev: null, next: null };
  const { line, index } = info;
  const prev = index > 0 ? STATIONS[line.stations[index - 1].id] : null;
  const next = index < line.stations.length - 1 ? STATIONS[line.stations[index + 1].id] : null;
  return { prev, next };
}

/** First `count` unvisited stations along a line, in order. */
export function nextStops(line: LineDef, completedIds: string[], count: number): Skill[] {
  const done = new Set(completedIds);
  const result: Skill[] = [];
  for (const s of line.stations) {
    if (!done.has(s.id)) {
      result.push(s);
      if (result.length >= count) break;
    }
  }
  return result;
}

export function visitedCount(line: LineDef, completedIds: string[]): number {
  const done = new Set(completedIds);
  return line.stations.reduce((n, s) => n + (done.has(s.id) ? 1 : 0), 0);
}

export const TOTAL_STATIONS = ALL_SKILLS.length;
