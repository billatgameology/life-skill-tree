import { useEffect, useState, useCallback, type ReactNode } from 'react';
import {
  ThemeContext,
  THEMES,
  THEME_STORAGE_KEY,
  resolveTheme,
  type ThemeId,
  type ThemeOption,
} from '@/context/theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeOption>(() =>
    resolveTheme(typeof window !== 'undefined' ? window.localStorage.getItem(THEME_STORAGE_KEY) : null)
  );

  useEffect(() => {
    document.documentElement.style.setProperty('--accent-rgb', theme.rgb);
    document.documentElement.style.setProperty('--accent-2', theme.accent2);
  }, [theme]);

  const setThemeId = useCallback((id: ThemeId) => {
    const next = resolveTheme(id);
    setTheme(next);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next.id);
    } catch {
      /* localStorage unavailable — theme still applies for the session */
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, themes: THEMES, setThemeId }}>
      {children}
    </ThemeContext.Provider>
  );
}
