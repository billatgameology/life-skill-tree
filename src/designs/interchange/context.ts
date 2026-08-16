import { createContext, useContext } from 'react';

/** Shared state for the Interchange design, provided by InterchangeApp (index.tsx). */
export interface InterchangeState {
  completedIds: string[];
  favoriteIds: string[];
  /** skillId -> "YYYY-MM-DD" completion date (for the VISITED stamp). */
  completionDates: Record<string, string>;
  /** Mark a station visited. Returns false (and prompts sign-in) when signed out. */
  markVisited: (skillId: string) => boolean;
  /** Toggle the saved-stop flag. Returns false (and prompts sign-in) when signed out. */
  toggleSaved: (skillId: string) => boolean;
  /** The journey (learning path) currently being ridden, if any. */
  activeJourneyId: string | null;
  startJourney: (journeyId: string) => void;
  clearJourney: () => void;
  openFinder: () => void;
}

export const InterchangeContext = createContext<InterchangeState | null>(null);

export function useInterchange(): InterchangeState {
  const ctx = useContext(InterchangeContext);
  if (!ctx) throw new Error('useInterchange must be used inside InterchangeApp');
  return ctx;
}
