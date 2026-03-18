/**
 * useTheme — reactive access to the current theme.
 *
 * Returns:
 *   t       — resolved ThemeTokens for current mode
 *   mode    — 'dark' | 'light'
 *   toggle  — flip dark ↔ light
 *   setMode — set a specific mode
 *   isDark  — convenience boolean
 *   isLight — convenience boolean
 *   isSystemDefault — whether mode matches OS preference
 *
 * Example:
 *   const { t, isDark, toggle } = useTheme();
 *   <div style={{ background: t.bg, color: t.text }}>
 */

import { useContext } from 'react';
import { ThemeContext } from './ThemeProvider';
import type { ThemeContextValue } from './ThemeProvider';

export interface UseThemeReturn extends ThemeContextValue {
  isDark: boolean;
  isLight: boolean;
}

export function useTheme(): UseThemeReturn {
  const ctx = useContext(ThemeContext);

  return {
    ...ctx,
    isDark: ctx.mode === 'dark',
    isLight: ctx.mode === 'light',
  };
}

export default useTheme;
