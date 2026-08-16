import { ALL_SKILLS, CATEGORIES, CATEGORY_KEYS } from '@/data/skills';
import type { DomainKey, Skill } from '@/lib/types';

export const FIELD_BOOK_BASE = '/fieldbook';

const CHAPTER_DESCRIPTIONS: Record<DomainKey, string> = {
  'digital-basics': 'Devices, signals, files, and safer passage through the connected world.',
  navigation: 'Routes, landmarks, transit, and the practiced art of finding your way.',
  'money-finance': 'Everyday records for spending, saving, paying, and staying alert.',
  'food-cooking': 'Kitchen observations from first preparation to a finished meal.',
  'home-care': 'Small rituals that keep a living space useful, calm, and cared for.',
  communication: 'Ways to ask, answer, listen, and leave a conversation clearly.',
  'health-safety': 'Field notes for ordinary care, prevention, and urgent moments.',
  organization: 'Simple systems for time, belongings, plans, and the next small step.',
  'career-work': 'Practical records from the first application through a working week.',
  'school-learning': 'Study habits, clear questions, careful notes, and finished work.',
  'civic-community': 'Documents, places, and services that connect a person to community.',
  'emotional-skills': 'Quiet practices for noticing, pausing, deciding, and repairing.',
  'outdoor-everyday': 'Weather, streets, trails, and the preparation that makes outings easier.',
  'housing-living': 'Keys, utilities, upkeep, and the practical details of having a home.',
  'shopping-consumer': 'Labels, comparisons, receipts, and informed choices in the marketplace.',
};

const ROMAN_NUMERALS = [
  'I',
  'II',
  'III',
  'IV',
  'V',
  'VI',
  'VII',
  'VIII',
  'IX',
  'X',
  'XI',
  'XII',
  'XIII',
  'XIV',
  'XV',
] as const;

export interface FieldChapter {
  domain: DomainKey;
  name: string;
  icon: string;
  number: number;
  numeral: string;
  description: string;
  skills: Skill[];
}

export const FIELD_CHAPTERS: FieldChapter[] = CATEGORY_KEYS.map((domain, index) => ({
  domain,
  name: CATEGORIES[domain].name,
  icon: CATEGORIES[domain].icon,
  number: index + 1,
  numeral: ROMAN_NUMERALS[index] ?? String(index + 1),
  description: CHAPTER_DESCRIPTIONS[domain],
  skills: ALL_SKILLS.filter((skill) => skill.domain === domain).sort(
    (a, b) => a.level - b.level || a.title.localeCompare(b.title),
  ),
}));

export const FIELD_CHAPTER_MAP = Object.fromEntries(
  FIELD_CHAPTERS.map((chapter) => [chapter.domain, chapter]),
) as Record<DomainKey, FieldChapter>;

const OBSERVATION_CODES = Object.fromEntries(
  FIELD_CHAPTERS.flatMap((chapter) =>
    chapter.skills.map((skill, index) => [
      skill.id,
      `${chapter.numeral}.${String(index + 1).padStart(2, '0')}`,
    ]),
  ),
) as Record<string, string>;

export function observationCode(skillId: string): string {
  return OBSERVATION_CODES[skillId] ?? '—';
}

function searchableText(skill: Skill): string {
  return [
    skill.title,
    skill.summary,
    skill.learnerPromise,
    CATEGORIES[skill.domain].name,
    ...(skill.tags ?? []),
  ]
    .join(' ')
    .toLocaleLowerCase();
}

export function findObservations(query: string): Skill[] {
  const terms = query
    .trim()
    .toLocaleLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  if (terms.length === 0) return [];

  return ALL_SKILLS.filter((skill) => {
    const haystack = searchableText(skill);
    return terms.every((term) => haystack.includes(term));
  }).sort((a, b) => {
    const titleA = a.title.toLocaleLowerCase();
    const titleB = b.title.toLocaleLowerCase();
    const exactA = titleA === query.trim().toLocaleLowerCase() ? 0 : 1;
    const exactB = titleB === query.trim().toLocaleLowerCase() ? 0 : 1;
    return exactA - exactB || titleA.localeCompare(titleB);
  });
}

export function adjacentObservations(skill: Skill): { previous: Skill | null; next: Skill | null } {
  const chapter = FIELD_CHAPTER_MAP[skill.domain];
  const index = chapter.skills.findIndex((candidate) => candidate.id === skill.id);
  return {
    previous: index > 0 ? chapter.skills[index - 1] ?? null : null,
    next: index >= 0 ? chapter.skills[index + 1] ?? null : null,
  };
}
