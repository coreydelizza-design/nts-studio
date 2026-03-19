# Architecture Studio Module

Standalone module for the Architecture Studio tab of Network Transformation Studio.

## Folder Structure

```
src/modules/architecture-studio/
├── theme/
│   └── index.js              # DARK and LIGHT theme token objects
├── components/               # React components (future)
├── data/
│   └── assessmentMetrics.js  # 11 metrics across 7 domains + defaults
├── modules/
│   └── ScoringEngine.js      # Cascading scoring engine
├── artifacts/                # Generated outputs (exports, snapshots)
└── README.md
```

## Scoring Engine

The scoring engine (`modules/ScoringEngine.js`) derives **impact**, **likelihood**, and **urgency** scores from raw assessment metrics.

### How It Works

1. **Metric-level scoring** — Each of the 11 metrics produces three derived scores:
   - **Impact**: Direct mapping from the raw value, weighted by the metric's importance within its domain
   - **Likelihood**: Logarithmic curve that rises quickly then flattens (high pain ≠ certainty)
   - **Urgency**: Weighted composite of impact (60%) and likelihood (40%)

2. **Domain aggregation** — Metric scores roll up into 7 domain summaries using per-metric weights

3. **Composite score** — Domain scores average into a single composite (equal domain weighting)

### Manual Overrides

Any derived score can be manually overridden per metric. Overrides are tracked so the UI can distinguish derived vs. analyst-set values.

```js
import { createScoringEngine } from './modules/ScoringEngine.js';

const engine = createScoringEngine();

// Pure derived scores
const result = engine.score({ outageFrequency: 8, mttr: 6, cloudLatency: 7, /* ... */ });

// With manual override on one metric
const adjusted = engine.score(
  { outageFrequency: 8, mttr: 6 },
  { outageFrequency: { impact: 9 } }  // override only impact; likelihood + urgency still derived
);

console.log(adjusted.metrics.outageFrequency.overridden); // true
console.log(adjusted.overriddenKeys);                      // ['outageFrequency']
```

### Assessment Domains

| Domain | Metrics | Description |
|--------|---------|-------------|
| Reliability | Outage Frequency, MTTR | Service availability and recovery |
| Performance | Cloud Latency, Branch Throughput | Application and network performance |
| Security | Tool Fragmentation, Policy Consistency | Security posture and policy |
| Operations | Manual Effort | Operational overhead and automation |
| Agility | Deployment Velocity | Speed of network changes |
| Strategic | Cloud Readiness, M&A Integration | Business transformation alignment |
| Vendor | Concentration Risk | Carrier/vendor dependency |
