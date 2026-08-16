import { createContext, useContext } from 'react';

/** The most recent completion, kept so the camp can show the migration. */
export interface Advance {
  skillId: string;
  /** Skills that slid into the frontier because of this advance. */
  unlockedIds: string[];
  at: number;
}

/** Shared state for the Frontier design, provided by FrontierApp (index.tsx). */
export interface FrontierState {
  completedIds: string[];
  favoriteIds: string[];
  /** skillId -> "YYYY-MM-DD" completion date (the expedition chronology). */
  completionDates: Record<string, string>;
  /** Mark ground covered. Returns false (and prompts sign-in) when signed out. */
  advance: (skillId: string) => boolean;
  /** Toggle a waypoint flag. Returns false (and prompts sign-in) when signed out. */
  toggleWaypoint: (skillId: string) => boolean;
  /** The latest advance, until the next reshuffle/advance replaces it. */
  lastAdvance: Advance | null;
  clearLastAdvance: () => void;
  /** Seed for the frontier hand; reshuffle deals different ground. */
  handSeed: number;
  reshuffleHand: () => void;
  openScout: () => void;
  signedIn: boolean;
  openAuth: () => void;
}

export const FrontierContext = createContext<FrontierState | null>(null);

export function useFrontier(): FrontierState {
  const ctx = useContext(FrontierContext);
  if (!ctx) throw new Error('useFrontier must be used inside FrontierApp');
  return ctx;
}
