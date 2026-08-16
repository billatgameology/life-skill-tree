import { createContext, useContext } from 'react';
import type { Deal } from './deal';

/** Shared state for the TODAY design, provided by TodayApp (index.tsx). */
export interface TodayState {
  /** Local calendar key for today, "YYYY-MM-DD". */
  dateKey: string;
  completedSet: ReadonlySet<string>;
  favoriteIds: string[];
  /** skillId -> "YYYY-MM-DD" completion date. */
  completionDates: Record<string, string>;
  /** Today's dealt card — stable for the whole day. */
  deal: Deal;
  /** Active "What's today like?" mood, if any. */
  moodId: string | null;
  /** "Not today" redeals remaining in today's hand. */
  redealsLeft: number;
  redeal: () => void;
  setMood: (id: string | null) => void;
  /** Mark complete. Returns false (and prompts sign-in) when signed out. */
  markDone: (skillId: string) => boolean;
  /** Toggle keep (favorite). Returns false (and prompts sign-in) when signed out. */
  toggleKeep: (skillId: string) => boolean;
}

export const TodayContext = createContext<TodayState | null>(null);

export function useToday(): TodayState {
  const ctx = useContext(TodayContext);
  if (!ctx) throw new Error('useToday must be used inside TodayApp');
  return ctx;
}
