export type DomainKey =
  | 'digital-basics'
  | 'navigation'
  | 'money-finance'
  | 'food-cooking'
  | 'home-care'
  | 'communication'
  | 'health-safety'
  | 'organization'
  | 'career-work'
  | 'school-learning'
  | 'civic-community'
  | 'emotional-skills'
  | 'outdoor-everyday'
  | 'housing-living'
  | 'shopping-consumer';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type SkillStatus = 'locked' | 'available' | 'completed';

export interface Skill {
  id: string;
  title: string;
  domain: DomainKey;
  summary: string;
  learnerPromise: string;
  whyItMatters: string;
  realLifeUses: string[];
  level: number;
  difficulty: Difficulty;
  status: SkillStatus;
  suggestedPrerequisites: string[];
  xp: number;
  estimatedMinutes: number;
  youWillLearn: string[];
  miniChallenge: string;
  steps: string[];
  completionCriteria: string[];
  commonProblems?: string[];
  tips?: string[];
  tags?: string[];
  createdDate: string;      // ISO date, e.g. "2026-01-15"
  publishedDate: string | null; // ISO date or null if not yet published
}

export interface Category {
  key: DomainKey;
  name: string;
  color: string;
  icon: string;
}

export type View = 'home' | 'profile' | 'badges';

export interface UserData {
  xp: number;
  completedSkillIds: string[];
  badges: string[];
  firstVisitDate: string;
  currentStreak: number;
  longestStreak: number;
  lastCompletionDate: string | null;
}
