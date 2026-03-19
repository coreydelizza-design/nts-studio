// architecture-studio/src/modules/ScoringEngine.js
// Cascading scoring engine — derives pain/constraint scores from assessment metrics
// This is the core logic that makes priority computation LIVE, not mock.
//
// HOW IT WORKS:
// 1. Assessment sliders (outageFrequency, securityFragmentation, etc.) set domain-level pain intensity
// 2. Each pain/constraint item has `linkedMetrics` — which assessment metrics drive it
// 3. Impact & Likelihood are DERIVED from linked metric averages (unless manually overridden)
// 4. Urgency derives from metrics + severity boost
// 5. Effort is always manual (assessment can't know implementation complexity)
// 6. Priority = weighted combination normalized to 0-100
//
// OVERRIDE MODEL:
// - manualImpact/manualLikelihood/manualUrgency/manualEffort = null → derived from assessment
// - manualImpact/etc = number → override, ignores assessment
// - Setting back to null via RESET → returns to derived mode

export function createScoringEngine(assessment) {

  function deriveScore(item, dimension) {
    // Manual override always takes precedence
    if (dimension === "impact" && item.manualImpact != null) return item.manualImpact;
    if (dimension === "likelihood" && item.manualLikelihood != null) return item.manualLikelihood;
    if (dimension === "urgency" && item.manualUrgency != null) return item.manualUrgency;
    if (dimension === "effort" && item.manualEffort != null) return item.manualEffort;

    // Derive from linked assessment metrics
    var linked = item.linkedMetrics || [];
    if (linked.length === 0) return 5; // neutral default

    var metricAvg = linked.reduce(function (acc, key) {
      return acc + (assessment[key] || 0);
    }, 0) / linked.length;

    switch (dimension) {
      case "impact":
        return Math.round(metricAvg);
      case "likelihood":
        return Math.min(10, Math.round(metricAvg * 0.9 + 1));
      case "urgency":
        var sevBoost = item.severity === "high" ? 2 : item.severity === "medium" ? 0 : -2;
        return Math.max(1, Math.min(10, Math.round(metricAvg + sevBoost)));
      case "effort":
        return 5; // effort must be manually set
      default:
        return 5;
    }
  }

  function getScores(item) {
    return {
      impact: deriveScore(item, "impact"),
      likelihood: deriveScore(item, "likelihood"),
      urgency: deriveScore(item, "urgency"),
      effort: deriveScore(item, "effort"),
      impactSrc: item.manualImpact != null ? "manual" : "derived",
      likelihoodSrc: item.manualLikelihood != null ? "manual" : "derived",
      urgencySrc: item.manualUrgency != null ? "manual" : "derived",
      effortSrc: item.manualEffort != null ? "manual" : "derived",
    };
  }

  function calcPriority(item) {
    var s = getScores(item);
    // Weighted formula:
    // Impact (35%) + Likelihood (25%) + Urgency (25%) + Ease of Resolution (15%)
    // Ease = 10 - effort (so lower effort = higher priority)
    return Math.round(
      (s.impact * 0.35 + s.likelihood * 0.25 + s.urgency * 0.25 + (10 - s.effort) * 0.15) * 10
    );
  }

  return {
    deriveScore: deriveScore,
    getScores: getScores,
    calcPriority: calcPriority,
  };
}
