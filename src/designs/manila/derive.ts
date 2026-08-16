import { format, parseISO } from 'date-fns';
import { ALL_SKILLS, CATEGORIES, CATEGORY_KEYS, getChildren } from '@/data/skills';
import { LEARNING_PATHS, type LearningPath } from '@/data/paths';
import type { DomainKey, Skill } from '@/lib/types';

/**
 * Manila's view of the shared skill library: the 15 domains become labeled
 * DRAWERS in a card catalog, the 233 skills become typed index CARDS filed
 * behind tier dividers, learning paths become DOSSIER folders.
 * Pure derivation — no content changes.
 */

/** The app-root path this design is mounted under (see src/designs/registry.tsx). */
export const MA_BASE = '/manila';

/**
 * Domain hues desaturated ~15% toward archival label ink and darkened until
 * they hold >=4.5:1 on the card cream (#F9F2E0), so they are safe as label
 * text and filing-edge stripes alike.
 */
export const DRAWER_TINTS: Record<DomainKey, string> = {
  'digital-basics': '#4A7477',
  'navigation': '#557087',
  'money-finance': '#7F6A3C',
  'food-cooking': '#51745D',
  'home-care': '#7E6A50',
  'communication': '#7C6489',
  'health-safety': '#945D5D',
  'organization': '#606C7A',
  'career-work': '#616C78',
  'school-learning': '#667047',
  'civic-community': '#596F79',
  'emotional-skills': '#7D6672',
  'outdoor-everyday': '#5E7353',
  'housing-living': '#766C56',
  'shopping-consumer': '#846753',
};

const DIFFICULTY_ORDER: Record<Skill['difficulty'], number> = { easy: 0, medium: 1, hard: 2 };

// Pinned collation: card order (and the printed call numbers derived from it)
// must not vary with the viewer's browser locale.
const COLLATOR = new Intl.Collator('en');

function cardCompare(a: Skill, b: Skill): number {
  if (a.level !== b.level) return a.level - b.level;
  const d = DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty];
  if (d !== 0) return d;
  return COLLATOR.compare(a.title, b.title);
}

export interface DrawerDef {
  domain: DomainKey;
  /** 1-based drawer number, zero-padded: "04" */
  num: string;
  name: string;
  tint: string;
  /** Cards in deterministic filing order: tier (level) → difficulty → title. */
  cards: Skill[];
}

export const DRAWERS: DrawerDef[] = CATEGORY_KEYS.map((domain, i) => ({
  domain,
  num: String(i + 1).padStart(2, '0'),
  name: CATEGORIES[domain].name,
  tint: DRAWER_TINTS[domain],
  cards: ALL_SKILLS.filter((s) => s.domain === domain).sort(cardCompare),
}));

export const DRAWER_MAP: Record<DomainKey, DrawerDef> = Object.fromEntries(
  DRAWERS.map((d) => [d.domain, d]),
) as Record<DomainKey, DrawerDef>;

export interface CardInfo {
  skill: Skill;
  drawer: DrawerDef;
  /** 0-based position within the drawer. */
  index: number;
  /** Citable call number, e.g. "04.07" (drawer 4, card 7). */
  callNumber: string;
}

export const CARDS: Record<string, CardInfo> = {};
for (const drawer of DRAWERS) {
  drawer.cards.forEach((skill, index) => {
    CARDS[skill.id] = {
      skill,
      drawer,
      index,
      callNumber: `${drawer.num}.${String(index + 1).padStart(2, '0')}`,
    };
  });
}

/** Tier = skill level, always paired with plain language. */
export const TIER_NAMES: Record<number, string> = {
  1: 'The basics',
  2: 'Building up',
  3: 'Going further',
};

export function tierLabel(level: number): string {
  return `Tier ${level} — ${TIER_NAMES[level] ?? 'Further on'}`;
}

export interface Tier {
  level: number;
  label: string;
  cards: Skill[];
}

/** Group a drawer's cards into its (non-empty) tiers, in filing order. */
export function tiersOf(drawer: DrawerDef): Tier[] {
  const tiers: Tier[] = [];
  for (const card of drawer.cards) {
    const last = tiers[tiers.length - 1];
    if (last && last.level === card.level) {
      last.cards.push(card);
    } else {
      tiers.push({ level: card.level, label: tierLabel(card.level), cards: [card] });
    }
  }
  return tiers;
}

export function filedCount(drawer: DrawerDef, completedIds: string[]): number {
  const done = new Set(completedIds);
  return drawer.cards.reduce((n, c) => n + (done.has(c.id) ? 1 : 0), 0);
}

/** Prerequisite cards, resolved ("SEE ALSO" cross-references). */
export function seeAlso(skill: Skill): CardInfo[] {
  return skill.suggestedPrerequisites
    .map((id) => CARDS[id])
    .filter((c): c is CardInfo => Boolean(c));
}

/** Cards that list this one as a prerequisite ("REFERENCED BY"). */
export function referencedBy(skill: Skill): CardInfo[] {
  return getChildren(skill.id)
    .map((s) => CARDS[s.id])
    .filter((c): c is CardInfo => Boolean(c));
}

/** Previous / next card in the same drawer, filing order. */
export function prevNextCard(skillId: string): { prev: CardInfo | null; next: CardInfo | null } {
  const info = CARDS[skillId];
  if (!info) return { prev: null, next: null };
  const { drawer, index } = info;
  return {
    prev: index > 0 ? CARDS[drawer.cards[index - 1].id] : null,
    next: index < drawer.cards.length - 1 ? CARDS[drawer.cards[index + 1].id] : null,
  };
}

/**
 * "Pulled for you": unfiled cards whose suggested prerequisites are all filed —
 * the prerequisite DAG as a no-lock recommendation tray. Cards unlocked by the
 * most completed work rank first; for brand-new users this naturally surfaces
 * short, easy Tier-1 cards.
 */
export function pulledForYou(completedIds: string[], count: number): CardInfo[] {
  const done = new Set(completedIds);
  return ALL_SKILLS.filter(
    (s) => !done.has(s.id) && s.suggestedPrerequisites.every((p) => done.has(p)),
  )
    .sort((a, b) => {
      const ap = a.suggestedPrerequisites.length;
      const bp = b.suggestedPrerequisites.length;
      if (ap !== bp) return bp - ap;
      if (a.level !== b.level) return a.level - b.level;
      const d = DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty];
      if (d !== 0) return d;
      if (a.estimatedMinutes !== b.estimatedMinutes) return a.estimatedMinutes - b.estimatedMinutes;
      return COLLATOR.compare(a.title, b.title);
    })
    .slice(0, count)
    .map((s) => CARDS[s.id]);
}

export interface LogMonth {
  label: string;
  entries: { card: CardInfo; date: string; dateLabel: string }[];
}

/** The accession log: every filing, newest first, grouped by month. */
export function accessionLog(completionDates: Record<string, string>): LogMonth[] {
  const entries = Object.entries(completionDates)
    .map(([id, date]) => ({ info: CARDS[id], date }))
    .filter((e): e is { info: CardInfo; date: string } => Boolean(e.info) && Boolean(e.date))
    .sort((a, b) => b.date.localeCompare(a.date) || COLLATOR.compare(a.info.skill.title, b.info.skill.title));

  const months: LogMonth[] = [];
  for (const { info, date } of entries) {
    let label: string;
    let dateLabel: string;
    try {
      const parsed = parseISO(date);
      label = format(parsed, 'MMMM yyyy').toUpperCase();
      dateLabel = format(parsed, 'MMM d').toUpperCase();
    } catch {
      label = 'UNDATED';
      dateLabel = '—';
    }
    const last = months[months.length - 1];
    if (last && last.label === label) {
      last.entries.push({ card: info, date, dateLabel });
    } else {
      months.push({ label, entries: [{ card: info, date, dateLabel }] });
    }
  }
  return months;
}

export function stampDate(iso: string | undefined): string {
  if (!iso) return '';
  try {
    return format(parseISO(iso), 'MMM d yyyy').toUpperCase();
  } catch {
    return '';
  }
}

/** Lookup: substring match over title + summary + youWillLearn, title hits first. */
export function lookupCards(query: string): CardInfo[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const tokens = q.split(/\s+/).filter(Boolean);
  const scored: { info: CardInfo; score: number }[] = [];
  for (const skill of ALL_SKILLS) {
    const title = skill.title.toLowerCase();
    const rest = `${skill.summary} ${skill.youWillLearn.join(' ')}`.toLowerCase();
    if (!tokens.every((t) => title.includes(t) || rest.includes(t))) continue;
    const score = title.startsWith(q) ? 0 : title.includes(q) ? 1 : tokens.every((t) => title.includes(t)) ? 2 : 3;
    scored.push({ info: CARDS[skill.id], score });
  }
  return scored
    .sort((a, b) => a.score - b.score || COLLATOR.compare(a.info.skill.title, b.info.skill.title))
    .map((s) => s.info);
}

/** Warm dead-end suggestions for Lookup ("taxes" → try these). */
export const LOOKUP_SUGGESTIONS = [
  'boil pasta',
  'budget',
  'laundry',
  'interview',
  'phishing',
  'first aid',
];

export function dossierProgress(path: LearningPath, completedIds: string[]): number {
  const done = new Set(completedIds);
  return path.skillIds.reduce((n, id) => n + (done.has(id) ? 1 : 0), 0);
}

export const DOSSIERS = LEARNING_PATHS;
export const TOTAL_CARDS = ALL_SKILLS.length;
