import { createContext, useContext } from 'react';

/** Shared state for the Trail design, provided by TrailApp (index.tsx). */
export interface TrailState {
  completedIds: string[];
  favoriteIds: string[];
  /** skillId -> "YYYY-MM-DD" completion date (for the blaze date). */
  completionDates: Record<string, string>;
  /** Blaze (complete) a waypoint. Returns false (and prompts sign-in) when signed out. */
  blaze: (skillId: string) => boolean;
  /** Toggle the flagged (favorite) mark. Returns false (and prompts sign-in) when signed out. */
  toggleFlag: (skillId: string) => boolean;
  openFinder: () => void;
  openLegIndex: () => void;
  /**
   * Element id the trail page should scroll to once it is showing
   * (e.g. "wp-boil-pasta" or "leg-3"). Consumed by TrailPage.
   */
  jumpTarget: string | null;
  requestJump: (elementId: string) => void;
  clearJump: () => void;
}

export const TrailContext = createContext<TrailState | null>(null);

export function useTrail(): TrailState {
  const ctx = useContext(TrailContext);
  if (!ctx) throw new Error('useTrail must be used inside TrailApp');
  return ctx;
}
