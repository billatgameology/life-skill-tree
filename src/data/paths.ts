export type LearningPath = {
  id: string;
  title: string;
  summary: string;
  learnerGoal: string;
  pathType: 'goal' | 'situation' | 'starter' | 'challenge';
  difficulty: 'easy' | 'medium' | 'hard';
  skillIds: string[];
  realLifeOutcome: string;
  whenThisHelps: string[];
  featured: boolean;
  estimatedTotalMinutes: number;
  color: string;
};

export const LEARNING_PATHS: LearningPath[] = [
  {
    id: 'first-job-readiness',
    title: 'First Job Readiness',
    summary: 'Skills that help you prepare for, land, and succeed in a first job.',
    learnerGoal: 'I want to get my first job.',
    pathType: 'goal',
    difficulty: 'easy',
    skillIds: [
      'write-professional-email',
      'make-phone-call',
      'introduce-yourself',
      'arrive-on-time',
      'ask-for-help',
      'compare-bank-accounts',
    ],
    realLifeOutcome: 'You can communicate professionally, show up on time, and handle basic work tasks.',
    whenThisHelps: [
      'Applying for a part-time or entry-level job',
      'Setting up direct deposit for your first paycheck',
      'Writing a follow-up email after an interview',
    ],
    featured: true,
    estimatedTotalMinutes: 90,
    color: '#8A6B9B',
  },
  {
    id: 'cook-one-meal',
    title: 'Cook One Simple Meal',
    summary: 'Go from raw ingredients to a finished meal you can eat.',
    learnerGoal: 'I want to cook something simple.',
    pathType: 'goal',
    difficulty: 'easy',
    skillIds: [
      'food-safety',
      'make-scrambled-eggs',
      'boil-pasta',
      'cook-rice',
      'shop-for-one-meal',
      'store-food',
    ],
    realLifeOutcome: 'You can plan, shop for, prepare, and store a simple meal safely.',
    whenThisHelps: [
      'You are hungry and want to make breakfast',
      'You need to pack lunch for school or work',
      'You want to eat at home instead of ordering out',
    ],
    featured: true,
    estimatedTotalMinutes: 100,
    color: '#5B8B6B',
  },
  {
    id: 'go-somewhere-on-your-own',
    title: 'Go Somewhere on Your Own',
    summary: 'Navigate to a new place using maps, signs, and transit.',
    learnerGoal: 'I want to go somewhere on my own.',
    pathType: 'goal',
    difficulty: 'easy',
    skillIds: [
      'read-street-map',
      'use-gps',
      'read-signs',
      'read-transit-schedules',
      'plan-multi-stop-trip',
    ],
    realLifeOutcome: 'You can get from home to a new destination using multiple methods.',
    whenThisHelps: [
      'Visiting a friend in another neighborhood',
      'Getting to a job interview on your own',
      'Figuring out a bus route when your phone dies',
    ],
    featured: true,
    estimatedTotalMinutes: 80,
    color: '#5A7D9B',
  },
  {
    id: 'manage-your-money',
    title: 'Manage Your Own Money',
    summary: 'Track spending, compare options, and save toward something you want.',
    learnerGoal: 'I want to manage my money better.',
    pathType: 'goal',
    difficulty: 'easy',
    skillIds: [
      'track-spending',
      'needs-vs-wants',
      'compare-prices',
      'make-budget',
      'compare-bank-accounts',
      'save-for-goal',
    ],
    realLifeOutcome: 'You know where your money goes and can make a plan to save for something specific.',
    whenThisHelps: [
      'You want to buy something expensive like a laptop or trip',
      'You are deciding between two similar products',
      'You want to stop running out of money before payday',
    ],
    featured: true,
    estimatedTotalMinutes: 110,
    color: '#B8964A',
  },
  {
    id: 'take-care-of-your-space',
    title: 'Take Care of Your Space',
    summary: 'Keep your living area clean, organized, and functional.',
    learnerGoal: 'I want to take care of my space.',
    pathType: 'goal',
    difficulty: 'easy',
    skillIds: [
      'reset-messy-room',
      'do-laundry',
      'sort-important-papers',
      'trash-recycling',
      'store-food',
    ],
    realLifeOutcome: 'Your room or apartment stays tidy, organized, and pleasant to live in.',
    whenThisHelps: [
      'Your room has become a mess and you do not know where to start',
      'You need to find an important document quickly',
      'You want to keep food from going bad in the fridge',
    ],
    featured: true,
    estimatedTotalMinutes: 95,
    color: '#9B7E5A',
  },
  {
    id: 'handle-a-small-home-problem',
    title: 'Handle a Small Home Problem',
    summary: 'Fix common small issues around the house safely.',
    learnerGoal: 'I want to handle a small home problem.',
    pathType: 'goal',
    difficulty: 'medium',
    skillIds: [
      'tighten-screw',
      'change-lightbulb',
      'hammer-nail',
      'fix-loose-handle',
      'unclog-drain',
    ],
    realLifeOutcome: 'You can fix minor household issues without calling for help every time.',
    whenThisHelps: [
      'A drawer handle is loose',
      'A light bulb burns out',
      'The sink is draining slowly',
    ],
    featured: true,
    estimatedTotalMinutes: 75,
    color: '#9B5A5A',
  },
];

export const PATH_MAP: Record<string, LearningPath> = Object.fromEntries(
  LEARNING_PATHS.map((p) => [p.id, p])
);
