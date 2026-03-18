/**
 * App Configuration — centralized environment and feature flags.
 *
 * Reads from Vite env vars (VITE_*) with sensible defaults.
 * Usage:
 *   import { config } from '../utils/config';
 *   if (config.features.aiAnalysis) { ... }
 */

export const config = {
  api: {
    baseUrl: import.meta.env.VITE_GEMINI_API_URL || '/api',
    hasKey: !!import.meta.env.VITE_GEMINI_API_KEY,
  },
  features: {
    aiAnalysis: import.meta.env.VITE_ENABLE_AI_ANALYSIS !== 'false',
    pdfExport: import.meta.env.VITE_ENABLE_PDF_EXPORT === 'true',
    auth: import.meta.env.VITE_ENABLE_AUTH === 'true',
  },
  auth: {
    provider: (import.meta.env.VITE_AUTH_PROVIDER || 'none') as 'none' | 'azure-ad' | 'okta',
    clientId: import.meta.env.VITE_AUTH_CLIENT_ID || '',
    tenantId: import.meta.env.VITE_AUTH_TENANT_ID || '',
  },
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const;
