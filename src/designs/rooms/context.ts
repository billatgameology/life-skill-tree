import { createContext, useContext } from 'react';

/** Shared state for the Rooms design, provided by RoomsApp (index.tsx). */
export interface RoomsState {
  completedIds: string[];
  favoriteIds: string[];
  /** skillId -> "YYYY-MM-DD" completion date. */
  completionDates: Record<string, string>;
  /** Mark a skill done. Returns false (and prompts sign-in) when signed out. */
  markDone: (skillId: string) => boolean;
  /** Toggle the corkboard pin. Returns false (and prompts sign-in) when signed out. */
  togglePin: (skillId: string) => boolean;
  openSearch: () => void;
  /** Gentle celebration: a short warm toast. */
  celebrate: (message: string) => void;
}

export const RoomsContext = createContext<RoomsState | null>(null);

export function useRooms(): RoomsState {
  const ctx = useContext(RoomsContext);
  if (!ctx) throw new Error('useRooms must be used inside RoomsApp');
  return ctx;
}
