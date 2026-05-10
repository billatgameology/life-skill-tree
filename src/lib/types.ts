export type DomainKey =
  | 'digital-basics'
  | 'navigation'
  | 'money-finance'
  | 'food-cooking'
  | 'home-care'
  | 'communication'
  | 'health-safety'
  | 'organization';

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
  prerequisites: string[];
  xp: number;
  estimatedMinutes: number;
  youWillLearn: string[];
  miniChallenge: string;
  steps: string[];
  completionCriteria: string[];
  commonProblems?: string[];
  tips?: string[];
  tags?: string[];
  x: number;
  y: number;
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
}
