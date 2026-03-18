/**
 * ThemeProvider — manages mode state, persistence, system detection, and CSS variable injection.
 *
 * Wrap your app:
 *   <ThemeProvider>
 *     <App />
 *   </ThemeProvider>
 *
 * Then in any component:
 *   const { t, mode, toggle } = useTheme();
 */

import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { themes, darkTokens } from './tokens';
import type { ThemeTokens, ThemeMode } from './tokens';
import { tokensToCSSVars } from './themeUtils';

// ═══════════════════════════════════════════════════════
// CONTEXT SHAPE
// ═══════════════════════════════════════════════════════

export interface ThemeContextValue {
  /** Resolved token object for the current mode */
  t: ThemeTokens;
  /** Current mode string */
  mode: ThemeMode;
  /** Toggle between dark and light */
  toggle: () => void;
  /** Set a specific mode */
  setMode: (mode: ThemeMode) => void;
  /** Whether the current mode matches the OS preference */
  isSystemDefault: boolean;
}

const STORAGE_KEY = 'nts-theme-mode';

// Detect OS preference
function getSystemPreference(): ThemeMode {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

// Read persisted preference, fall back to OS, fall back to dark
function getInitialMode(): ThemeMode {
  if (typeof window === 'undefined') return 'dark';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return getSystemPreference();
}

export const ThemeContext = createContext<ThemeContextValue>({
  t: darkTokens,
  mode: 'dark',
  toggle: () => {},
  setMode: () => {},
  isSystemDefault: true,
});

// ═══════════════════════════════════════════════════════
// PROVIDER
// ═══════════════════════════════════════════════════════

export const ThemeProvider: React.FC<{ children: React.ReactNode; defaultMode?: ThemeMode }> = ({
  children,
  defaultMode,
}) => {
  const [mode, setModeState] = useState<ThemeMode>(defaultMode ?? getInitialMode);

  const tokens = useMemo(() => themes[mode], [mode]);

  // ── Persist + apply class + CSS vars ──
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, mode);

    // Set data attribute on <html> for Tailwind / CSS selectors
    const root = document.documentElement;
    root.setAttribute('data-theme', mode);
    root.classList.remove('dark', 'light');
    root.classList.add(mode);

    // Inject CSS custom properties from token values
    const vars = tokensToCSSVars(tokens);
    for (const [prop, val] of Object.entries(vars)) {
      root.style.setProperty(prop, val);
    }

    // Update <meta> theme-color for mobile browser chrome
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', tokens.bg);
  }, [mode, tokens]);

  // ── Listen for OS preference changes ──
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    const handler = (e: MediaQueryListEvent) => {
      // Only follow system if user hasn't manually overridden
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        setModeState(e.matches ? 'light' : 'dark');
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const toggle = useCallback(() => {
    setModeState(prev => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
  }, []);

  const isSystemDefault = mode === getSystemPreference();

  const value = useMemo<ThemeContextValue>(
    () => ({ t: tokens, mode, toggle, setMode, isSystemDefault }),
    [tokens, mode, toggle, setMode, isSystemDefault],
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
