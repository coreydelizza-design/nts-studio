/**
 * Architecture Studio — Theme Tokens
 *
 * Two palettes designed for extended analytical work:
 *   DARK  — "Precision Aerospace" (deep navy, electric cyan accents)
 *   LIGHT — "Frosted Titanium" (warm off-white, slate-blue structure)
 */

const shared = {
  // Accent palette
  cyan: '#22d3ee',
  blue: '#3b82f6',
  violet: '#a78bfa',
  rose: '#fb7185',
  amber: '#fbbf24',
  emerald: '#34d399',
  lime: '#a3e635',
  orange: '#fb923c',
  slate: '#64748b',

  // Semantic
  success: '#34d399',
  warning: '#fbbf24',
  danger: '#fb7185',
  info: '#38bdf8',

  // Typography
  fontDisplay: "'Outfit', sans-serif",
  fontBody: "'DM Sans', sans-serif",
  fontMono: "'JetBrains Mono', monospace",

  // Border radii
  radius: { sm: 6, md: 10, lg: 14, xl: 20 },
};

export const DARK = {
  mode: 'dark',

  // Backgrounds
  bg: '#060a13',
  bgDeep: '#0a0f1c',
  bgCanvas: '#060a14',
  bgCard: 'rgba(12,19,35,0.75)',
  bgGlass: 'rgba(14,22,40,0.65)',
  bgPanel: 'rgba(10,16,30,0.92)',
  bgHover: 'rgba(30,42,65,0.5)',
  bgInput: 'rgba(12,20,38,0.9)',
  bgElevated: 'rgba(20,30,52,0.8)',

  // Borders
  border: 'rgba(40,55,85,0.45)',
  borderFocus: 'rgba(56,189,248,0.5)',
  borderSubtle: 'rgba(35,48,72,0.3)',

  // Primary accent
  accent: '#38bdf8',
  accentDim: 'rgba(56,189,248,0.12)',

  // Text hierarchy
  text: '#e8edf5',
  textSoft: '#b8c5d8',
  textMuted: '#7a8ba4',
  textDim: '#475569',

  // Shadows
  shadow: '0 4px 24px rgba(0,0,0,0.25)',
  shadowHeavy: '0 8px 40px rgba(0,0,0,0.4)',
  shadowGlow: '0 0 20px rgba(56,189,248,0.1)',

  ...shared,
};

export const LIGHT = {
  mode: 'light',

  // Backgrounds
  bg: '#f0f2f5',
  bgDeep: '#e8ebf0',
  bgCanvas: '#eceef2',
  bgCard: 'rgba(255,255,255,0.82)',
  bgGlass: 'rgba(255,255,255,0.6)',
  bgPanel: 'rgba(248,250,252,0.95)',
  bgHover: 'rgba(226,232,240,0.6)',
  bgInput: 'rgba(241,245,249,0.95)',
  bgElevated: 'rgba(255,255,255,0.9)',

  // Borders
  border: 'rgba(148,163,184,0.25)',
  borderFocus: 'rgba(14,165,233,0.45)',
  borderSubtle: 'rgba(148,163,184,0.15)',

  // Primary accent
  accent: '#0ea5e9',
  accentDim: 'rgba(14,165,233,0.1)',

  // Text hierarchy
  text: '#0f172a',
  textSoft: '#334155',
  textMuted: '#64748b',
  textDim: '#94a3b8',

  // Shadows
  shadow: '0 4px 24px rgba(0,0,0,0.06)',
  shadowHeavy: '0 8px 40px rgba(0,0,0,0.1)',
  shadowGlow: '0 0 20px rgba(14,165,233,0.08)',

  ...shared,
};
