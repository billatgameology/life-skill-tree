import { createContext, useContext } from 'react';

export type SessionStage = 'plan' | 'run' | 'done';

/** An assembled practice session — 2–3 skills that sum to a minute budget. */
export interface TempoSession {
  budget: number;
  slots: string[];
  stage: SessionStage;
  /** Index of the slot currently being practiced (run stage). */
  current: number;
  /** Slot ids actually logged during this session (for the summary). */
  loggedIds: string[];
}

/** Shared state for the Tempo design, provided by TempoApp (index.tsx). */
export interface TempoState {
  completedIds: string[];
  favoriteIds: string[];
  /** skillId -> "YYYY-MM-DD" completion date. */
  completionDates: Record<string, string>;
  /** Dial budget in minutes (30 = the open "30+" stop). */
  budget: number;
  setBudget: (minutes: number) => void;
  /** Log a skill as done. Returns false (and prompts sign-in) when signed out. */
  logSkill: (skillId: string) => boolean;
  /** Toggle the pinned flag. Returns false (and prompts sign-in) when signed out. */
  togglePin: (skillId: string) => boolean;
  session: TempoSession | null;
  /** Assemble a fresh queue for a budget (deterministic; stage becomes 'plan'). */
  planSession: (budget: number) => void;
  /** Replace one slot with the next same-duration candidate. */
  swapSessionSlot: (index: number) => void;
  /** Begin stepping through the planned queue. Returns the first skill id. */
  startSession: () => string | null;
  /** Log the current slot and advance. nextId is null when the session finished. */
  completeCurrentSlot: () => { ok: boolean; nextId: string | null };
  /** Advance without logging. Returns the next skill id, or null when finished. */
  skipCurrentSlot: () => string | null;
  /** Discard the session entirely. */
  endSession: () => void;
  /** Sessions finished with at least one logged skill, this visit (memory only). */
  sessionsDone: number;
  openFinder: () => void;
}

export const TempoContext = createContext<TempoState | null>(null);

export function useTempo(): TempoState {
  const ctx = useContext(TempoContext);
  if (!ctx) throw new Error('useTempo must be used inside TempoApp');
  return ctx;
}
