/**
 * Assessment Metrics — Architecture Studio
 *
 * 11 metrics across 7 domains used by the Scoring Engine to derive
 * impact, likelihood, and urgency scores for pain points.
 *
 * Each metric has:
 *   key       — unique identifier (used in store and scoring lookups)
 *   label     — display name
 *   domain    — one of the 7 assessment domains
 *   weight    — relative importance within its domain (0–1)
 *   scale     — { min, max, step } for the input control
 *   desc      — short description shown in tooltips
 */

// ─── Domains ───────────────────────────────────────────────

export const DOMAINS = [
  'Reliability',
  'Performance',
  'Security',
  'Operations',
  'Agility',
  'Strategic',
  'Vendor',
];

// ─── Metric Definitions ────────────────────────────────────

export const METRIC_GROUPS = [
  // Reliability (2 metrics)
  {
    key: 'outageFrequency',
    label: 'Outage Frequency',
    domain: 'Reliability',
    weight: 0.6,
    scale: { min: 0, max: 10, step: 1 },
    desc: 'Average unplanned outages per quarter across all sites',
  },
  {
    key: 'mttr',
    label: 'Mean Time to Restore',
    domain: 'Reliability',
    weight: 0.4,
    scale: { min: 0, max: 10, step: 1 },
    desc: 'Average hours to restore service after an incident',
  },

  // Performance (2 metrics)
  {
    key: 'cloudLatency',
    label: 'Cloud Application Latency',
    domain: 'Performance',
    weight: 0.5,
    scale: { min: 0, max: 10, step: 1 },
    desc: 'User-perceived latency to primary SaaS/cloud workloads',
  },
  {
    key: 'branchThroughput',
    label: 'Branch Throughput Adequacy',
    domain: 'Performance',
    weight: 0.5,
    scale: { min: 0, max: 10, step: 1 },
    desc: 'How well branch bandwidth meets current application demand',
  },

  // Security (2 metrics)
  {
    key: 'securityFragmentation',
    label: 'Security Tool Fragmentation',
    domain: 'Security',
    weight: 0.55,
    scale: { min: 0, max: 10, step: 1 },
    desc: 'Number of overlapping/disjointed security tools in the estate',
  },
  {
    key: 'policyConsistency',
    label: 'Policy Consistency',
    domain: 'Security',
    weight: 0.45,
    scale: { min: 0, max: 10, step: 1 },
    desc: 'Uniformity of security policy enforcement across sites and users',
  },

  // Operations (1 metric)
  {
    key: 'manualEffort',
    label: 'Manual Operational Effort',
    domain: 'Operations',
    weight: 1.0,
    scale: { min: 0, max: 10, step: 1 },
    desc: 'FTE-hours spent on manual network changes, tickets, and troubleshooting',
  },

  // Agility (1 metric)
  {
    key: 'deployVelocity',
    label: 'Deployment Velocity',
    domain: 'Agility',
    weight: 1.0,
    scale: { min: 0, max: 10, step: 1 },
    desc: 'Average weeks to provision a new site or major circuit change',
  },

  // Strategic (2 metrics)
  {
    key: 'cloudReadiness',
    label: 'Cloud Transformation Readiness',
    domain: 'Strategic',
    weight: 0.5,
    scale: { min: 0, max: 10, step: 1 },
    desc: 'How well the network supports multi-cloud and SaaS-first strategy',
  },
  {
    key: 'maIntegration',
    label: 'M&A Integration Friction',
    domain: 'Strategic',
    weight: 0.5,
    scale: { min: 0, max: 10, step: 1 },
    desc: 'Difficulty integrating acquired entities onto the corporate network',
  },

  // Vendor (1 metric)
  {
    key: 'vendorConcentration',
    label: 'Vendor/Carrier Concentration Risk',
    domain: 'Vendor',
    weight: 1.0,
    scale: { min: 0, max: 10, step: 1 },
    desc: 'Over-reliance on a single carrier or vendor for critical connectivity',
  },
];

// ─── Convenience Lookups ───────────────────────────────────

/** Map of key → display label */
export const METRIC_NAMES = Object.fromEntries(
  METRIC_GROUPS.map((m) => [m.key, m.label])
);

/** Default assessment with all metrics at 0 (unscored) */
export const DEFAULT_ASSESSMENT = Object.fromEntries(
  METRIC_GROUPS.map((m) => [m.key, 0])
);
