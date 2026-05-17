import { createContext } from 'react';

export type ThemeId = 'gold' | 'twilight' | 'sunset' | 'plum';

export interface ThemeOption {
  id: ThemeId;
  name: string;
  /** primary accent (replaces glow-gold) */
  accent: string;
  /** secondary accent, used for gradients */
  accent2: string;
  /** space-separated rgb channels for the Tailwind CSS variable */
  rgb: string;
}

export const THEMES: ThemeOption[] = [
  { id: 'gold', name: 'Gold', accent: '#D4AF37', accent2: '#E0B84D', rgb: '212 175 55' },
  { id: 'twilight', name: 'Twilight', accent: '#7FD0C5', accent2: '#5FB4D3', rgb: '127 208 197' },
  { id: 'sunset', name: 'Sunset', accent: '#F0B260', accent2: '#E87766', rgb: '240 178 96' },
  { id: 'plum', name: 'Plum', accent: '#B884E0', accent2: '#7A8FE0', rgb: '184 132 224' },
];

export const THEME_STORAGE_KEY = 'lifeskilltree_theme';

export interface ThemeContextValue {
  theme: ThemeOption;
  themes: ThemeOption[];
  setThemeId: (id: ThemeId) => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function resolveTheme(id: string | null): ThemeOption {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}
