import { ALL_SKILLS, CATEGORIES, CATEGORY_KEYS, getChildren } from '@/data/skills';
import type { DomainKey, Skill } from '@/lib/types';

export const SHORTWAVE_BASE = '/shortwave';

const BAND_CODES: Record<DomainKey, string> = {
  'digital-basics': 'DB',
  navigation: 'NV',
  'money-finance': 'MF',
  'food-cooking': 'FC',
  'home-care': 'HC',
  communication: 'CM',
  'health-safety': 'HS',
  organization: 'OR',
  'career-work': 'CW',
  'school-learning': 'SL',
  'civic-community': 'CC',
  'emotional-skills': 'ES',
  'outdoor-everyday': 'OE',
  'housing-living': 'HL',
  'shopping-consumer': 'SC',
};

const BAND_ACCENTS = [
  '#168A99',
  '#3E72A8',
  '#B57B12',
  '#38845C',
  '#A56537',
  '#87519A',
  '#D34E43',
  '#357A80',
  '#6658A5',
  '#74792E',
  '#2E7785',
  '#A34F78',
  '#4B7A43',
  '#93643F',
  '#C65A42',
] as const;

const COLLATOR = new Intl.Collator('en');
const DIFFICULTY_ORDER: Record<Skill['difficulty'], number> = {
  easy: 0,
  medium: 1,
  hard: 2,
};

export const DAYPARTS: Record<number, { name: string; time: string; note: string }> = {
  1: { name: 'Morning Signal', time: '06:00–10:00', note: 'Foundational broadcasts' },
  2: { name: 'Daytime Practice', time: '10:00–17:00', note: 'Build your working range' },
  3: { name: 'After Hours', time: '17:00–22:00', note: 'Go further with the signal' },
};

export interface FrequencyBand {
  domain: DomainKey;
  name: string;
  code: string;
  frequency: string;
  accent: string;
  skills: Skill[];
}

function compareBroadcasts(a: Skill, b: Skill) {
  if (a.level !== b.level) return a.level - b.level;
  const byDifficulty = DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty];
  if (byDifficulty !== 0) return byDifficulty;
  return COLLATOR.compare(a.title, b.title);
}

export const BANDS: FrequencyBand[] = CATEGORY_KEYS.map((domain, index) => ({
  domain,
  name: CATEGORIES[domain].name,
  code: BAND_CODES[domain],
  frequency: (88.3 + index * 1.4).toFixed(1),
  accent: BAND_ACCENTS[index],
  skills: ALL_SKILLS.filter((skill) => skill.domain === domain).sort(compareBroadcasts),
}));

export const BAND_MAP = Object.fromEntries(BANDS.map((band) => [band.domain, band])) as Record<
  DomainKey,
  FrequencyBand
>;

export interface BroadcastInfo {
  skill: Skill;
  band: FrequencyBand;
  index: number;
  code: string;
}

export const BROADCASTS: Record<string, BroadcastInfo> = {};
for (const band of BANDS) {
  band.skills.forEach((skill, index) => {
    BROADCASTS[skill.id] = {
      skill,
      band,
      index,
      code: `${band.code}-${String(index + 1).padStart(2, '0')}`,
    };
  });
}

export function daypartFor(level: number) {
  return DAYPARTS[level] ?? {
    name: `Level ${level}`,
    time: 'Open schedule',
    note: 'Extended broadcast',
  };
}

export function groupByDaypart(skills: Skill[]) {
  const groups = new Map<number, Skill[]>();
  for (const skill of skills) {
    const current = groups.get(skill.level) ?? [];
    current.push(skill);
    groups.set(skill.level, current);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => a - b)
    .map(([level, broadcasts]) => ({ level, ...daypartFor(level), broadcasts }));
}

export function prerequisiteBroadcasts(skill: Skill): BroadcastInfo[] {
  return skill.suggestedPrerequisites
    .map((id) => BROADCASTS[id])
    .filter((info): info is BroadcastInfo => Boolean(info));
}

export function dependentBroadcasts(skill: Skill): BroadcastInfo[] {
  return getChildren(skill.id)
    .map((child) => BROADCASTS[child.id])
    .filter((info): info is BroadcastInfo => Boolean(info));
}

export function adjacentBroadcasts(skillId: string): { previous: BroadcastInfo | null; next: BroadcastInfo | null } {
  const info = BROADCASTS[skillId];
  if (!info) return { previous: null, next: null };
  const previous = info.index > 0 ? BROADCASTS[info.band.skills[info.index - 1].id] : null;
  const next = info.index < info.band.skills.length - 1
    ? BROADCASTS[info.band.skills[info.index + 1].id]
    : null;
  return { previous, next };
}
