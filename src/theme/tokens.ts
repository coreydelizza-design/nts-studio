/**
 * Design Token System — Network Transformation Studio
 *
 * Two palettes:
 *   DARK  — "Precision Aerospace" (deep navy, electric cyan)
 *   LIGHT — "Frosted Titanium" (warm off-white, slate blue, teal)
 *
 * Usage:
 *   Static (legacy):  import { T } from './tokens'        → always dark
 *   Reactive:         const { t } = useTheme()            → follows preference
 */

// ═══════════════════════════════════════════════════════
// TOKEN SHAPE
// ═══════════════════════════════════════════════════════

export interface ThemeTokens {
  mode: 'dark' | 'light';

  // Backgrounds
  bg: string;
  bgDeep: string;
  bgCanvas: string;
  bgCard: string;
  bgGlass: string;
  bgPanel: string;
  bgHover: string;
  bgInput: string;
  bgElevated: string;

  // Borders
  border: string;
  borderFocus: string;
  borderSubtle: string;

  // Primary accent
  accent: string;
  accentDim: string;

  // Strategic accent colors (brand-consistent across modes)
  cyan: string;
  blue: string;
  violet: string;
  rose: string;
  amber: string;
  emerald: string;
  lime: string;
  orange: string;
  slate: string;

  // Text hierarchy
  text: string;
  textSoft: string;
  textMuted: string;
  textDim: string;

  // Semantic
  success: string;
  warning: string;
  danger: string;
  info: string;

  // Typography
  fontD: string;
  fontB: string;
  fontM: string;

  // Border radii
  r: { sm: number; md: number; lg: number; xl: number };

  // Shadows
  shadow: string;
  shadowHeavy: string;
  shadowGlow: string;
}

// ═══════════════════════════════════════════════════════
// SHARED (mode-independent)
// ═══════════════════════════════════════════════════════

const shared = {
  cyan:    '#22d3ee',
  blue:    '#3b82f6',
  violet:  '#a78bfa',
  rose:    '#fb7185',
  amber:   '#fbbf24',
  emerald: '#34d399',
  lime:    '#a3e635',
  orange:  '#fb923c',
  slate:   '#64748b',
  success: '#34d399',
  warning: '#fbbf24',
  danger:  '#fb7185',
  info:    '#38bdf8',
  fontD: "'Outfit', sans-serif",
  fontB: "'DM Sans', sans-serif",
  fontM: "'JetBrains Mono', monospace",
  r: { sm: 6, md: 10, lg: 14, xl: 20 },
} as const;

// ═══════════════════════════════════════════════════════
// DARK — "Precision Aerospace"
// ═══════════════════════════════════════════════════════

export const darkTokens: ThemeTokens = {
  mode: 'dark',
  bg:         '#060a13',
  bgDeep:     '#0a0f1c',
  bgCanvas:   '#060a14',
  bgCard:     'rgba(12,19,35,0.75)',
  bgGlass:    'rgba(14,22,40,0.65)',
  bgPanel:    'rgba(10,16,30,0.92)',
  bgHover:    'rgba(30,42,65,0.5)',
  bgInput:    'rgba(12,20,38,0.9)',
  bgElevated: 'rgba(20,30,52,0.8)',
  border:       'rgba(40,55,85,0.45)',
  borderFocus:  'rgba(56,189,248,0.5)',
  borderSubtle: 'rgba(35,48,72,0.3)',
  accent:    '#38bdf8',
  accentDim: 'rgba(56,189,248,0.12)',
  text:      '#e8edf5',
  textSoft:  '#b8c5d8',
  textMuted: '#7a8ba4',
  textDim:   '#475569',
  shadow:      '0 4px 24px rgba(0,0,0,0.25)',
  shadowHeavy: '0 8px 40px rgba(0,0,0,0.4)',
  shadowGlow:  '0 0 20px rgba(56,189,248,0.1)',
  ...shared,
};

// ═══════════════════════════════════════════════════════
// LIGHT — "Frosted Titanium"
// Warm neutral base, slate-blue structure, teal accent.
// Still feels like a strategy cockpit.
// ═══════════════════════════════════════════════════════

export const lightTokens: ThemeTokens = {
  mode: 'light',
  bg:         '#f0f2f5',
  bgDeep:     '#e8ebf0',
  bgCanvas:   '#eceef2',
  bgCard:     'rgba(255,255,255,0.82)',
  bgGlass:    'rgba(255,255,255,0.6)',
  bgPanel:    'rgba(248,250,252,0.95)',
  bgHover:    'rgba(226,232,240,0.6)',
  bgInput:    'rgba(241,245,249,0.95)',
  bgElevated: 'rgba(255,255,255,0.9)',
  border:       'rgba(148,163,184,0.25)',
  borderFocus:  'rgba(14,165,233,0.45)',
  borderSubtle: 'rgba(148,163,184,0.15)',
  accent:    '#0ea5e9',
  accentDim: 'rgba(14,165,233,0.1)',
  text:      '#0f172a',
  textSoft:  '#334155',
  textMuted: '#64748b',
  textDim:   '#94a3b8',
  shadow:      '0 4px 24px rgba(0,0,0,0.06)',
  shadowHeavy: '0 8px 40px rgba(0,0,0,0.1)',
  shadowGlow:  '0 0 20px rgba(14,165,233,0.08)',
  ...shared,
};

// ═══════════════════════════════════════════════════════
// THEME MAP
// ═══════════════════════════════════════════════════════

export type ThemeMode = 'dark' | 'light';

export const themes: Record<ThemeMode, ThemeTokens> = {
  dark: darkTokens,
  light: lightTokens,
};

// ═══════════════════════════════════════════════════════
// BACKWARD-COMPATIBLE DEFAULT
// Every existing `import { T }` still works (dark palette).
// Migrate to `const { t } = useTheme()` for reactivity.
// ═══════════════════════════════════════════════════════

export const T = darkTokens;

// ═══════════════════════════════════════════════════════
// SEMANTIC COLOR MAPS
// ═══════════════════════════════════════════════════════

export const STATUS_COLORS: Record<string, string> = {
  active: shared.emerald,
  planned: darkTokens.accent,
  review: shared.amber,
  'at-risk': shared.rose,
  decommission: shared.slate,
  migrating: shared.violet,
  new: shared.cyan,
};

export const CRIT_COLORS: Record<string, string> = {
  critical: shared.rose,
  high: shared.orange,
  medium: shared.amber,
  low: shared.emerald,
  info: shared.slate,
};

export const PHASE_LABELS = ['—', 'Phase 1: Quick Wins', 'Phase 2: Foundation', 'Phase 3: Scale'];
export const PHASE_COLORS = ['transparent', shared.emerald, darkTokens.accent, shared.violet];

export const CAT_COLORS: Record<string, string> = {
  Sites: shared.violet,
  Network: shared.orange,
  Security: shared.rose,
  Cloud: shared.cyan,
  'Edge / Compute': shared.lime,
  Operations: shared.amber,
};
