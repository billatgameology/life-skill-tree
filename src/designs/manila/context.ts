import { createContext, useContext } from 'react';

/** Shared state for the Manila design, provided by ManilaApp (index.tsx). */
export interface ManilaState {
  completedIds: string[];
  favoriteIds: string[];
  /** skillId -> "YYYY-MM-DD" completion date (for the FILED stamp + accession log). */
  completionDates: Record<string, string>;
  /** File a card (mark complete). Returns false (and prompts sign-in) when signed out. */
  fileCard: (skillId: string) => boolean;
  /** Toggle the paperclip (favorite). Returns false (and prompts sign-in) when signed out. */
  toggleClip: (skillId: string) => boolean;
  openLookup: () => void;
}

export const ManilaContext = createContext<ManilaState | null>(null);

export function useManila(): ManilaState {
  const ctx = useContext(ManilaContext);
  if (!ctx) throw new Error('useManila must be used inside ManilaApp');
  return ctx;
}
