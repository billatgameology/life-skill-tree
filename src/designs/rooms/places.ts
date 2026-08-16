import { format, parseISO } from 'date-fns';
import { ALL_SKILLS, CATEGORIES, SKILL_MAP, getChildren } from '@/data/skills';
import type { Difficulty, DomainKey, Skill } from '@/lib/types';

/**
 * Rooms' view of the shared skill library: every skill is assigned to the
 * PLACE in life where it actually happens — the Kitchen, the Front Door,
 * Out on the Street, On Your Phone — instead of the domain it belongs to.
 * Places deliberately cross-cut domains: the Kitchen holds food-cooking,
 * home-care, health-safety and organization skills side by side.
 *
 * Pure derivation over the shared data. No content changes.
 *
 * Assignment is deterministic, in priority order:
 *   1. ordered keyword rules over the skill id (ids are slugified titles,
 *      so these are title-keyword rules),
 *   2. a per-domain default place for everything the rules don't claim.
 * A small hand-curated SECONDARY_PLACES map records skills that genuinely
 * live in more than one place ("also passes through here").
 */

/** The app-root path this design is mounted under (see src/designs/registry.tsx). */
export const RM_BASE = '/rooms';

export type PlaceId =
  | 'front-door'
  | 'kitchen'
  | 'living-room'
  | 'desk'
  | 'laundry'
  | 'bedroom'
  | 'bathroom'
  | 'quiet-corner'
  | 'street'
  | 'shops'
  | 'town'
  | 'phone';

export interface PlaceDef {
  id: PlaceId;
  /** Full name, as spoken: "The Kitchen", "Out on the Street". */
  name: string;
  /** Short label for tight spots: "Kitchen", "Street". */
  short: string;
  /** One line of scene flavor, shown under the room name. */
  flavor: string;
  /** Whether this place is inside the dwelling (used for grouping copy). */
  indoors: boolean;
  /** Muted illustration tint for walls, bars and furniture. */
  tint: string;
}

/** Walk-through order: in the front door, around the house, then out into the world. */
export const PLACES: PlaceDef[] = [
  { id: 'front-door', name: 'The Front Door', short: 'Front Door', indoors: true, tint: '#C79A6B',
    flavor: 'Keys on the hook, coats, and the minute before you leave.' },
  { id: 'kitchen', name: 'The Kitchen', short: 'Kitchen', indoors: true, tint: '#D8875F',
    flavor: 'The kettle is on. Everything in here feeds somebody.' },
  { id: 'living-room', name: 'The Living Room', short: 'Living Room', indoors: true, tint: '#C98A96',
    flavor: 'The couch, the shelf, and most of the talking.' },
  { id: 'desk', name: 'The Desk', short: 'Desk', indoors: true, tint: '#E0B45C',
    flavor: 'One lamp, a stack of papers, and every plan you have ever made.' },
  { id: 'laundry', name: 'The Laundry Corner', short: 'Laundry', indoors: true, tint: '#9AAF8D',
    flavor: 'The washer hums under the shelf with the toolbox on it.' },
  { id: 'bedroom', name: 'The Bedroom', short: 'Bedroom', indoors: true, tint: '#A793C9',
    flavor: 'Your own four walls, the closet, and the half-packed bag.' },
  { id: 'bathroom', name: 'The Bathroom', short: 'Bathroom', indoors: true, tint: '#85C0C9',
    flavor: 'The mirror, the medicine cabinet, the small repairs of the body.' },
  { id: 'quiet-corner', name: 'The Quiet Corner', short: 'Quiet Corner', indoors: true, tint: '#E3B587',
    flavor: 'An armchair by the window. Just you, for a minute.' },
  { id: 'street', name: 'Out on the Street', short: 'Street', indoors: false, tint: '#93A6C9',
    flavor: 'Lamplight, bus stops, and every way across town.' },
  { id: 'shops', name: 'At the Shops', short: 'Shops', indoors: false, tint: '#C9797B',
    flavor: 'Aisles, awnings, price tags, and the till.' },
  { id: 'town', name: 'Around Town', short: 'Town', indoors: false, tint: '#74A5AD',
    flavor: 'The library, the post office, the clinic, the classroom.' },
  { id: 'phone', name: 'On Your Phone', short: 'Phone', indoors: false, tint: '#7CC3B4',
    flavor: 'A whole world in your pocket, glowing at dusk.' },
];

export const PLACE_MAP: Record<PlaceId, PlaceDef> = Object.fromEntries(
  PLACES.map((p) => [p.id, p]),
) as Record<PlaceId, PlaceDef>;

/**
 * Ordered keyword rules, first match wins. Matched against the skill id
 * (slugified title). Order matters: e.g. `interview-clothes` must land in
 * the Bedroom before the Town rule sees `arrive-for-interview`.
 */
const KEYWORD_RULES: ReadonlyArray<readonly [PlaceId, RegExp]> = [
  // Bathroom — plumbing, hygiene, the medicine cabinet.
  ['bathroom', /toilet|bathroom-sink|unclog-drain|brush-floss|nosebleed|medicine-label|first-aid-kit|bug-bite|small-cut|wash-hands|check-temperature/],
  // Kitchen — spills, bins, burns, timers, the tap.
  ['kitchen', /trash-bag|small-spill|sweep-floor|stay-hydrated|minor-burn|use-timer/],
  // Laundry corner — the washer plus the toolbox and the fuse box.
  ['laundry', /laundry|lightbulb|tighten-screw|hammer-nail|tape-measure|replace-batteries|air-filter|water-valve|smoke-alarm|wall-hole|loose-handle|flashlight|power-outage|save-electricity/],
  // Bedroom — the bed, the closet, the suitcase, the sick day.
  ['bedroom', /make-bed|messy-room|pack-for-trip|packing-checklist|carry-on|moving-box|medication-for-trip|night-before|interview-clothes|dress-for-weather|room-condition|mild-illness/],
  // Front door — leaving rituals, keys, locks, the mail slot, the bins.
  ['front-door', /before-leaving|arrive-on-time|door-is-locked|house-key|sort-mail|sunscreen|water-bottle|organize-backpack|trash-recycling/],
  // Living room — the shared room and the conversations held in it.
  ['living-room', /vacuum|picture-frame|lost-item|practice-presentation|chore-plan|ask-for-space|repair-after-mistake/],
  // Around town — buildings you walk into: school, bank, clinic, library.
  ['town', /nearest-restroom|large-building|deposit-check|describe-symptoms|answer-interview|arrive-for-interview|ask-teacher|class-notes|library|copy-important-document|mail-package|public-notice/],
  // At the shops — choosing, paying, tipping, returning.
  ['shops', /grocery-unit-prices|shop-for-one-meal|nutrition-label|calculate-tip|compare-prices|needs-vs-wants|read-receipt|split-bill|sales-tax|debit-card/],
  // On your phone — calls, texts, apps, subscriptions, and phone-first chores.
  ['phone', /voicemail|phone-call|text-message|reply-to-invitation|reschedule|cancel-subscription|subscription-costs|money-scam|payment-reminder|find-doctor|doctor-appointment|emergency-numbers|set-reminder|call-out-sick|work-schedule|shift-change|local-office|maintenance-issue|shipping-costs|product-reviews|customer-support|fake-review|coupon-code/],
  // Desk — paperwork that outranks its domain default.
  ['desk', /professional-email|multi-stop-trip|emergency-contact-card|home-inventory|utility-bill|address-envelope|simple-form|keep-id-safe/],
  // Street — emergencies happen out in the world.
  ['street', /emergency-situation/],
];

/** Where a domain's skills live when no keyword rule claims them. */
const DOMAIN_DEFAULTS: Record<DomainKey, PlaceId> = {
  'digital-basics': 'phone',
  'navigation': 'street',
  'money-finance': 'desk',
  'food-cooking': 'kitchen',
  'home-care': 'laundry',
  'communication': 'living-room',
  'health-safety': 'bathroom',
  'organization': 'desk',
  'career-work': 'desk',
  'school-learning': 'desk',
  'civic-community': 'town',
  'emotional-skills': 'quiet-corner',
  'outdoor-everyday': 'street',
  'housing-living': 'laundry',
  'shopping-consumer': 'shops',
};

/** Deterministically classify one skill into its primary place. */
export function classifyPlace(skill: Pick<Skill, 'id' | 'domain'>): PlaceId {
  for (const [place, pattern] of KEYWORD_RULES) {
    if (pattern.test(skill.id)) return place;
  }
  return DOMAIN_DEFAULTS[skill.domain];
}

/** skillId -> primary place id, for all 233 skills. */
export const HOME_PLACE: Record<string, PlaceId> = Object.fromEntries(
  ALL_SKILLS.map((s) => [s.id, classifyPlace(s)]),
);

/**
 * Skills that genuinely live in a second (or third) place too.
 * Shown as "also passes through here" — hand-curated, small.
 */
export const SECONDARY_PLACES: Record<string, PlaceId[]> = {
  'wash-hands': ['kitchen'],
  'treat-small-cut': ['kitchen'],
  'treat-minor-burn': ['bathroom'],
  'use-timer': ['desk'],
  'read-nutrition-label': ['kitchen'],
  'make-grocery-list': ['shops'],
  'use-gps': ['phone'],
  'use-sunscreen': ['street'],
  'handle-bug-bite': ['street'],
  'pack-water-bottle': ['kitchen'],
  'sort-mail': ['town'],
  'practice-presentation': ['town'],
  'write-professional-email': ['phone'],
  'deposit-check': ['phone'],
  'dress-for-weather': ['front-door'],
  'emergency-numbers': ['kitchen'],
  'split-bill': ['phone'],
  'understand-shared-chore-plan': ['kitchen'],
  'set-reminder': ['desk'],
  'read-work-schedule': ['desk'],
};

const DIFFICULTY_ORDER: Record<Skill['difficulty'], number> = { easy: 0, medium: 1, hard: 2 };

// Pinned collation so room ordering never varies with browser locale.
const COLLATOR = new Intl.Collator('en');

function roomCompare(a: Skill, b: Skill): number {
  if (a.level !== b.level) return a.level - b.level;
  const d = DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty];
  if (d !== 0) return d;
  return COLLATOR.compare(a.title, b.title);
}

/** placeId -> that place's skills, in deterministic shelf order. */
export const PLACE_SKILLS: Record<PlaceId, Skill[]> = Object.fromEntries(
  PLACES.map((p) => [p.id, [] as Skill[]]),
) as Record<PlaceId, Skill[]>;
for (const skill of ALL_SKILLS) PLACE_SKILLS[HOME_PLACE[skill.id]].push(skill);
for (const p of PLACES) PLACE_SKILLS[p.id].sort(roomCompare);

export function placeOf(skillId: string): PlaceDef {
  return PLACE_MAP[HOME_PLACE[skillId] ?? 'quiet-corner'];
}

/** Skills whose SECOND home is this place, shelf order. */
export function visitorsOf(placeId: PlaceId): Skill[] {
  return ALL_SKILLS
    .filter((s) => (SECONDARY_PLACES[s.id] ?? []).includes(placeId))
    .sort(roomCompare);
}

export function placeProgress(placeId: PlaceId, completedIds: string[]): { done: number; total: number } {
  const done = new Set(completedIds);
  const skills = PLACE_SKILLS[placeId];
  return { done: skills.reduce((n, s) => n + (done.has(s.id) ? 1 : 0), 0), total: skills.length };
}

export function overallProgress(completedIds: string[]): { done: number; total: number } {
  return {
    done: completedIds.reduce((n, id) => n + (SKILL_MAP[id] ? 1 : 0), 0),
    total: ALL_SKILLS.length,
  };
}

/** Rooms speak plainly about tiers. */
export const LEVEL_LABELS: Record<number, string> = {
  1: 'Start here',
  2: 'Settling in',
  3: 'Finishing touches',
};

export function levelLabel(level: number): string {
  return LEVEL_LABELS[level] ?? 'Further on';
}

export interface RoomShelf {
  level: number;
  label: string;
  skills: Skill[];
}

/** A room's skills grouped into non-empty level shelves, in order. */
export function shelvesOf(placeId: PlaceId): RoomShelf[] {
  const shelves: RoomShelf[] = [];
  for (const skill of PLACE_SKILLS[placeId]) {
    const last = shelves[shelves.length - 1];
    if (last && last.level === skill.level) last.skills.push(skill);
    else shelves.push({ level: skill.level, label: levelLabel(skill.level), skills: [skill] });
  }
  return shelves;
}

export function domainName(domain: DomainKey): string {
  return CATEGORIES[domain].name;
}

export function prereqsOf(skill: Skill): Skill[] {
  return skill.suggestedPrerequisites
    .map((id) => SKILL_MAP[id])
    .filter((s): s is (typeof ALL_SKILLS)[number] => Boolean(s));
}

export function leadsTo(skill: Skill): Skill[] {
  return getChildren(skill.id);
}

export function doneDate(iso: string | undefined): string {
  if (!iso) return '';
  try {
    return format(parseISO(iso), 'MMM d, yyyy');
  } catch {
    return '';
  }
}

/** Search escape hatch: substring match over title + summary + youWillLearn. */
export function searchSkills(query: string): Skill[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const tokens = q.split(/\s+/).filter(Boolean);
  const scored: { skill: Skill; score: number }[] = [];
  for (const skill of ALL_SKILLS) {
    const title = skill.title.toLowerCase();
    const rest = `${skill.summary} ${skill.youWillLearn.join(' ')}`.toLowerCase();
    if (!tokens.every((t) => title.includes(t) || rest.includes(t))) continue;
    const score = title.startsWith(q) ? 0 : title.includes(q) ? 1 : tokens.every((t) => title.includes(t)) ? 2 : 3;
    scored.push({ skill, score });
  }
  return scored
    .sort((a, b) => a.score - b.score || COLLATOR.compare(a.skill.title, b.skill.title))
    .map((s) => s.skill);
}

/** Warm dead-end suggestions for the search overlay. */
export const SEARCH_SUGGESTIONS = ['boil pasta', 'budget', 'laundry', 'interview', 'first aid', 'phishing'];

/** Difficulty, spoken the way the house speaks. */
export const DIFFICULTY_META: Record<Difficulty, { label: string; color: string }> = {
  easy: { label: 'Gentle', color: '#9AC79A' },
  medium: { label: 'Steady', color: '#F0B860' },
  hard: { label: 'Tricky', color: '#E08A6D' },
};

export function minutesLabel(minutes: number): string {
  return `~${minutes} min`;
}

export const TOTAL_SKILLS = ALL_SKILLS.length;
