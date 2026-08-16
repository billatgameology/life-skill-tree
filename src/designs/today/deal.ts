import type { Difficulty, DomainKey, Skill } from '@/lib/types';
import { ALL_SKILLS, CATEGORIES, CATEGORY_KEYS, SKILL_MAP } from '@/data/skills';

/** Absolute route base — relative "." self-resolves inside splat routes. */
export const TODAY_BASE = '/today';

/** Cards per day: the first deal plus four warm "not today" redeals. */
export const HAND_SIZE = 5;

/** Near-black ink used on every card face (AA against all card colors). */
export const CARD_INK = '#191521';
/** Softer companion ink for secondary text on card faces. */
export const CARD_INK_SOFT = '#332D3E';

/**
 * TODAY's one saturated color per domain — bright enough that the shared
 * dark inks stay ≥ 4.5:1 on every card face. Only one shows at a time.
 */
export const CARD_COLOR: Record<DomainKey, string> = {
  'digital-basics': '#3EDBC3',
  'navigation': '#58A9FF',
  'money-finance': '#FFC94B',
  'food-cooking': '#7FDD6F',
  'home-care': '#FFA057',
  'communication': '#D09BFA',
  'health-safety': '#FF7C74',
  'organization': '#5FCFEA',
  'career-work': '#9FA8FF',
  'school-learning': '#C9E15A',
  'civic-community': '#8FD0C6',
  'emotional-skills': '#FF9BC1',
  'outdoor-everyday': '#A8D96C',
  'housing-living': '#EDBE7C',
  'shopping-consumer': '#FF9E7A',
};

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: 'gentle',
  medium: 'middling',
  hard: 'a stretch',
};

/** One-tap "What's today like?" contexts that re-deal within a slice of life. */
export interface Mood {
  id: string;
  label: string;
  matches: (skill: Skill) => boolean;
}

export const MOODS: Mood[] = [
  { id: 'cooking', label: 'Cooking something', matches: (s) => s.domain === 'food-cooking' },
  {
    id: 'out',
    label: 'Heading out',
    matches: (s) => s.domain === 'navigation' || s.domain === 'outdoor-everyday',
  },
  {
    id: 'money',
    label: 'Money stuff',
    matches: (s) => s.domain === 'money-finance' || s.domain === 'shopping-consumer',
  },
  { id: 'wobbly', label: 'Feeling wobbly', matches: (s) => s.domain === 'emotional-skills' },
  { id: 'ten', label: '10 spare minutes', matches: (s) => s.estimatedMinutes <= 10 },
];

/** FNV-1a — small, stable, deterministic across sessions. */
export function hashStr(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function localDateKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function nextDateKey(key: string): string {
  const base = parseDateKey(key);
  return localDateKey(new Date(base.getFullYear(), base.getMonth(), base.getDate() + 1));
}

/** Whole days since the epoch — drives day-over-day domain rotation. */
function dayIndexOf(key: string): number {
  const [y, m, d] = key.split('-').map(Number);
  return Math.round(Date.UTC(y, m - 1, d) / 86_400_000);
}

export interface Deal {
  skill: Skill;
  /** True when everything eligible is done and the card comes back around. */
  refresher: boolean;
}

function prereqsMet(skill: Skill, done: ReadonlySet<string>): boolean {
  return skill.suggestedPrerequisites.every((id) => done.has(id) || !SKILL_MAP[id]);
}

/**
 * The daily deal. Deterministic for a given (date, completed-set, pass, mood):
 * reload the app and the same card is waiting. Prefers uncompleted skills whose
 * prerequisites are met and that are short enough to actually do today, and
 * rotates the domain day over day (and per redeal) so consecutive cards differ.
 */
export function dealFor(
  dateKey: string,
  done: ReadonlySet<string>,
  pass: number,
  moodId: string | null,
): Deal {
  const mood = MOODS.find((m) => m.id === moodId) ?? null;
  const inMood = (s: Skill) => !mood || mood.matches(s);
  const fresh = ALL_SKILLS.filter((s) => !done.has(s.id) && inMood(s));

  // Progressive relaxation: ideal hand first, refreshers as a last resort.
  const ladder: Skill[][] = [
    fresh.filter((s) => prereqsMet(s, done) && s.estimatedMinutes <= 20),
    fresh.filter((s) => prereqsMet(s, done)),
    fresh,
    ALL_SKILLS.filter(inMood),
    ALL_SKILLS.filter((s) => !done.has(s.id)),
  ];
  const pool = ladder.find((rung) => rung.length > 0) ?? [...ALL_SKILLS];

  const day = dayIndexOf(dateKey);
  const sig = hashStr([...done].sort().join('|'));

  // Without a mood, rotate the domain so consecutive days (and redeals) differ.
  let sub = pool;
  if (!mood) {
    const domains = CATEGORY_KEYS.filter((k) => pool.some((s) => s.domain === k));
    const domain = domains[(day + pass) % domains.length];
    sub = pool.filter((s) => s.domain === domain);
  }

  const ordered = [...sub].sort(
    (a, b) => hashStr(`${a.id}:${dateKey}`) - hashStr(`${b.id}:${dateKey}`),
  );
  const skill = ordered[(sig + day + pass) % ordered.length];
  return { skill, refresher: done.has(skill.id) };
}

/** Where tomorrow's card leans, given today's completions. Honest, not a promise. */
export function tomorrowHint(dateKey: string, done: ReadonlySet<string>): string {
  const deal = dealFor(nextDateKey(dateKey), done, 0, null);
  return CATEGORIES[deal.skill.domain].name;
}

/**
 * Ephemeral daily ritual state (redeal count + active mood) — deliberately NOT
 * progress. Progress lives only in useUserData; this just keeps "not today"
 * honest across a reload and resets itself at midnight.
 */
export interface Ritual {
  date: string;
  /** Redeals used today (0 = first card of the day). */
  pass: number;
  mood: string | null;
}

const RITUAL_KEY = 'lst-today-ritual-v1';

export function loadRitual(dateKey: string): Ritual {
  try {
    const raw = localStorage.getItem(RITUAL_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Ritual>;
      if (parsed.date === dateKey && typeof parsed.pass === 'number') {
        return {
          date: dateKey,
          pass: Math.min(HAND_SIZE - 1, Math.max(0, Math.floor(parsed.pass))),
          mood: typeof parsed.mood === 'string' ? parsed.mood : null,
        };
      }
    }
  } catch {
    // Storage unavailable — the ritual simply starts fresh.
  }
  return { date: dateKey, pass: 0, mood: null };
}

export function saveRitual(ritual: Ritual): void {
  try {
    localStorage.setItem(RITUAL_KEY, JSON.stringify(ritual));
  } catch {
    // Storage unavailable — nothing to do.
  }
}
