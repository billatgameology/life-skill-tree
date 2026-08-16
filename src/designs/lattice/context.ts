import { createContext, useContext } from 'react';

/** Shared state for the Lattice design, provided by LatticeApp (index.tsx). */
export interface LatticeState {
  completedIds: string[];
  /** Same data as completedIds, as a set for graph derivations. */
  completedSet: ReadonlySet<string>;
  favoriteIds: string[];
  /** skillId → "YYYY-MM-DD" completion date (for the SOLDERED stamp). */
  completionDates: Record<string, string>;
  /** Mark a pad soldered. Returns false (and prompts sign-in) when signed out. */
  solder: (skillId: string) => boolean;
  /** Toggle the pinned flag. Returns false (and prompts sign-in) when signed out. */
  togglePin: (skillId: string) => boolean;
  openProbe: () => void;
}

export const LatticeContext = createContext<LatticeState | null>(null);

export function useLattice(): LatticeState {
  const ctx = useContext(LatticeContext);
  if (!ctx) throw new Error('useLattice must be used inside LatticeApp');
  return ctx;
}
