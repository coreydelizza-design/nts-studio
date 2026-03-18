/**
 * Theme Utilities
 *
 * - tokensToCSSVars: convert a ThemeTokens object into --nts-* CSS custom properties
 * - alpha: append opacity to any hex color (#38bdf8 → rgba(56,189,248,0.2))
 * - blend: mix two hex colors at a ratio
 * - hexToRgb / rgbToHex: format conversion
 * - themed: pick a value based on current mode
 * - glassBg: generate a backdrop-filter glass background string
 */

import type { ThemeTokens, ThemeMode } from './tokens';
import type { CSSProperties } from 'react';

// ═══════════════════════════════════════════════════════
// CSS VARIABLE INJECTION
// ═══════════════════════════════════════════════════════

/**
 * Converts a ThemeTokens object into a flat map of CSS custom properties.
 * Nested objects (like `r`) are flattened with dashes: --nts-r-sm, --nts-r-md, etc.
 * Only string and number values are included.
 */
export function tokensToCSSVars(tokens: ThemeTokens): Record<string, string> {
  const vars: Record<string, string> = {};

  for (const [key, value] of Object.entries(tokens)) {
    if (key === 'mode') continue;

    if (typeof value === 'string') {
      vars[`--nts-${camelToDash(key)}`] = value;
    } else if (typeof value === 'number') {
      vars[`--nts-${camelToDash(key)}`] = String(value);
    } else if (typeof value === 'object' && value !== null) {
      // Flatten nested objects (e.g., `r: { sm: 6 }` → `--nts-r-sm: 6`)
      for (const [subKey, subVal] of Object.entries(value)) {
        if (typeof subVal === 'number') {
          vars[`--nts-${camelToDash(key)}-${camelToDash(subKey)}`] = `${subVal}px`;
        } else if (typeof subVal === 'string') {
          vars[`--nts-${camelToDash(key)}-${camelToDash(subKey)}`] = subVal;
        }
      }
    }
  }

  return vars;
}

function camelToDash(str: string): string {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase();
}

// ═══════════════════════════════════════════════════════
// COLOR MANIPULATION
// ═══════════════════════════════════════════════════════

/**
 * Parse a hex color (#rgb, #rrggbb, #rrggbbaa) into [r, g, b, a?].
 */
export function hexToRgb(hex: string): [number, number, number, number] {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
  return [r, g, b, a];
}

/**
 * Format [r, g, b] back to #rrggbb hex.
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return `#${[r, g, b].map(v => clamp(v).toString(16).padStart(2, '0')).join('')}`;
}

/**
 * Return a hex color with alpha as an rgba() string.
 * Works with hex input only (#38bdf8).
 *
 *   alpha('#38bdf8', 0.2) → 'rgba(56,189,248,0.2)'
 */
export function alpha(hex: string, opacity: number): string {
  // If it's already rgba/rgb, try to replace alpha
  if (hex.startsWith('rgba')) {
    return hex.replace(/,\s*[\d.]+\)$/, `,${opacity})`);
  }
  if (hex.startsWith('rgb(')) {
    return hex.replace('rgb(', 'rgba(').replace(')', `,${opacity})`);
  }
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${opacity})`;
}

/**
 * Blend two hex colors by ratio (0 = colorA, 1 = colorB).
 *
 *   blend('#000000', '#ffffff', 0.5) → '#808080'
 */
export function blend(hexA: string, hexB: string, ratio: number): string {
  const [r1, g1, b1] = hexToRgb(hexA);
  const [r2, g2, b2] = hexToRgb(hexB);
  const t = Math.max(0, Math.min(1, ratio));
  return rgbToHex(
    r1 + (r2 - r1) * t,
    g1 + (g2 - g1) * t,
    b1 + (b2 - b1) * t,
  );
}

/**
 * Lighten a hex color by amount (0–1).
 */
export function lighten(hex: string, amount: number): string {
  return blend(hex, '#ffffff', amount);
}

/**
 * Darken a hex color by amount (0–1).
 */
export function darken(hex: string, amount: number): string {
  return blend(hex, '#000000', amount);
}

// ═══════════════════════════════════════════════════════
// CONDITIONAL THEMING
// ═══════════════════════════════════════════════════════

/**
 * Return value A for dark mode, value B for light mode.
 *
 *   themed(mode, '#060a13', '#f0f2f5')
 */
export function themed<V>(mode: ThemeMode, dark: V, light: V): V {
  return mode === 'dark' ? dark : light;
}

/**
 * Generate a glass-morphism background style object.
 * Adjusts opacity and blur for each mode.
 */
export function glassBg(mode: ThemeMode): CSSProperties {
  return mode === 'dark'
    ? { background: 'rgba(14,22,40,0.65)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }
    : { background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' };
}

/**
 * Generate mode-appropriate card shadow.
 */
export function cardShadow(mode: ThemeMode, glow?: string): string {
  const base = mode === 'dark'
    ? '0 4px 24px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.03)'
    : '0 4px 24px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.5)';
  if (glow) {
    const glowShadow = mode === 'dark'
      ? `0 0 24px ${alpha(glow, 0.07)}`
      : `0 0 20px ${alpha(glow, 0.06)}`;
    return `${glowShadow}, ${base}`;
  }
  return base;
}

/**
 * Adjust an accent color for light mode readability.
 * Light backgrounds need slightly deeper / more saturated accents.
 */
export function modeAccent(hex: string, mode: ThemeMode, amount = 0.12): string {
  return mode === 'light' ? darken(hex, amount) : hex;
}
