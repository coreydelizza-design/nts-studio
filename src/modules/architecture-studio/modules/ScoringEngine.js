/**
 * Scoring Engine — Architecture Studio
 *
 * Cascading scoring engine that derives impact, likelihood, and urgency
 * from the 11 assessment metrics defined in assessmentMetrics.js.
 *
 * Design principles:
 *   1. Scores are derived automatically from assessment inputs
 *   2. Manual overrides take precedence and are tracked separately
 *   3. Recalculation is idempotent — same inputs always produce same outputs
 *   4. Domain weights cascade: metric → domain → composite score
 *
 * Usage:
 *   const engine = createScoringEngine();
 *   const results = engine.score(assessmentValues);
 *   const withOverrides = engine.score(assessmentValues, { outageFrequency: { impact: 9 } });
 */

import { METRIC_GROUPS, DOMAINS } from '../data/assessmentMetrics.js';

// ─── Internal Helpers ──────────────────────────────────────

/** Clamp a value to [0, 10] */
const clamp = (v) => Math.max(0, Math.min(10, v));

/** Round to one decimal place */
const round1 = (v) => Math.round(v * 10) / 10;

/**
 * Derive impact score for a single metric.
 * Higher assessment value → higher impact (direct mapping with weight).
 */
const deriveImpact = (value, metric) => {
  return round1(clamp(value * metric.weight + value * (1 - metric.weight) * 0.5));
};

/**
 * Derive likelihood score for a single metric.
 * Likelihood increases with the metric value but is softened
 * to reflect that high pain doesn't always mean high probability.
 */
const deriveLikelihood = (value, _metric) => {
  // Logarithmic curve: rises quickly at low values, flattens at high
  if (value <= 0) return 0;
  return round1(clamp(Math.log2(value + 1) * 2.5));
};

/**
 * Derive urgency as a composite of impact and likelihood.
 * Urgency = weighted combination biased toward impact.
 */
const deriveUrgency = (impact, likelihood) => {
  return round1(clamp(impact * 0.6 + likelihood * 0.4));
};

// ─── Domain Aggregation ────────────────────────────────────

/**
 * Aggregate metric-level scores into domain-level summaries.
 * Uses the weight of each metric within its domain.
 */
const aggregateDomains = (metricScores) => {
  const domainMap = {};

  for (const domain of DOMAINS) {
    const metrics = METRIC_GROUPS.filter((m) => m.domain === domain);
    if (metrics.length === 0) continue;

    let impactSum = 0;
    let likelihoodSum = 0;
    let urgencySum = 0;
    let weightSum = 0;

    for (const metric of metrics) {
      const scores = metricScores[metric.key];
      if (!scores) continue;
      impactSum += scores.impact * metric.weight;
      likelihoodSum += scores.likelihood * metric.weight;
      urgencySum += scores.urgency * metric.weight;
      weightSum += metric.weight;
    }

    if (weightSum > 0) {
      domainMap[domain] = {
        impact: round1(impactSum / weightSum),
        likelihood: round1(likelihoodSum / weightSum),
        urgency: round1(urgencySum / weightSum),
        metricCount: metrics.length,
      };
    }
  }

  return domainMap;
};

// ─── Public API ────────────────────────────────────────────

/**
 * Create a scoring engine instance.
 *
 * @returns {{ score: (assessment: Record<string, number>, overrides?: Record<string, Partial<{impact: number, likelihood: number, urgency: number}>>) => ScoringResult }}
 *
 * ScoringResult shape:
 *   {
 *     metrics: Record<string, { value, impact, likelihood, urgency, overridden }>,
 *     domains: Record<string, { impact, likelihood, urgency, metricCount }>,
 *     composite: { impact, likelihood, urgency },
 *     overriddenKeys: string[],
 *   }
 */
export function createScoringEngine() {
  return {
    /**
     * Score an assessment.
     *
     * @param {Record<string, number>} assessment — metric key → raw value (0–10)
     * @param {Record<string, Partial<{impact: number, likelihood: number, urgency: number}>>} [overrides]
     *        Optional manual overrides per metric. Only the provided fields are overridden;
     *        unspecified fields still use the derived value.
     */
    score(assessment, overrides = {}) {
      const metricScores = {};
      const overriddenKeys = [];

      for (const metric of METRIC_GROUPS) {
        const value = clamp(assessment[metric.key] ?? 0);
        const ov = overrides[metric.key];

        // Derive base scores
        let impact = deriveImpact(value, metric);
        let likelihood = deriveLikelihood(value, metric);

        // Apply manual overrides (partial — only override what's specified)
        const hasOverride = ov && (ov.impact != null || ov.likelihood != null || ov.urgency != null);
        if (ov?.impact != null) impact = clamp(ov.impact);
        if (ov?.likelihood != null) likelihood = clamp(ov.likelihood);

        // Urgency: override if explicitly set, otherwise derive from (possibly overridden) impact + likelihood
        let urgency = ov?.urgency != null ? clamp(ov.urgency) : deriveUrgency(impact, likelihood);

        if (hasOverride) overriddenKeys.push(metric.key);

        metricScores[metric.key] = {
          value,
          impact,
          likelihood,
          urgency,
          overridden: !!hasOverride,
        };
      }

      // Aggregate to domains
      const domains = aggregateDomains(metricScores);

      // Composite: average across all domains (equal domain weighting)
      const domainValues = Object.values(domains);
      const composite =
        domainValues.length > 0
          ? {
              impact: round1(domainValues.reduce((s, d) => s + d.impact, 0) / domainValues.length),
              likelihood: round1(domainValues.reduce((s, d) => s + d.likelihood, 0) / domainValues.length),
              urgency: round1(domainValues.reduce((s, d) => s + d.urgency, 0) / domainValues.length),
            }
          : { impact: 0, likelihood: 0, urgency: 0 };

      return {
        metrics: metricScores,
        domains,
        composite,
        overriddenKeys,
      };
    },
  };
}
