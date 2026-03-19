# Architecture Studio — Multi-File Repository

## Overview
Enterprise network transformation design workspace, part of the Network Transformation Studio (NTS). Built as modular React components with dark/light theme support, cascading scoring engine, and AI-driven traceability.

## Repository Structure

```
architecture-studio/
├── src/
│   ├── theme/
│   │   └── index.js                    # Shared DARK/LIGHT theme objects
│   ├── components/
│   │   └── Primitives.jsx              # Tag, Bar, MiniBar, Slider, PriorityBadge,
│   │                                   # EditField, ToggleSwitch, AddButton, StarInput
│   ├── data/
│   │   ├── assessmentMetrics.js        # METRIC_GROUPS, METRIC_NAMES, DEFAULT_ASSESSMENT
│   │   ├── painPoints.js               # INITIAL_ITEMS (pain points & constraints)
│   │   ├── sites.js                    # REGIONS, INITIAL_SITES (25 sites, 4 regions)
│   │   ├── circuits.js                 # INITIAL_CIRCUITS
│   │   ├── providers.js                # INITIAL_PROVIDERS
│   │   ├── security.js                 # INITIAL_SECURITY (firewalls, SWG, VPN, DDoS)
│   │   ├── cloud.js                    # INITIAL_CLOUD (AWS, Azure connections)
│   │   ├── patterns.js                 # PATTERNS_DATA (SD-WAN, SASE, Multi-Cloud, etc.)
│   │   ├── architectureLayers.js       # ARCH_LAYERS (5 layers, 15+ elements)
│   │   ├── gttCatalog.js              # GTT_CATALOG (products by category)
│   │   ├── migration.js               # MIGRATION_DATA (3 phases)
│   │   ├── confidence.js              # CONFIDENCE_DATA, OPEN_QUESTIONS, ASSUMPTIONS
│   │   └── traceability.js            # TRACEABILITY, PRODUCT_MAP, DIFF_BLOCKS
│   └── modules/
│       ├── ScoringEngine.js            # createScoringEngine(assessment) → {deriveScore, getScores, calcPriority}
│       ├── PainConstraintEngine.jsx    # STANDALONE — Assessment + Pains + Constraints + AI
│       ├── IntakeModule.jsx            # TSA Intake questionnaire
│       ├── EstateModule.jsx            # Current-state estate (sites, circuits, providers, security, cloud, cost)
│       ├── PatternsModule.jsx          # Architecture pattern selection & comparison
│       ├── FutureStateModule.jsx       # Target-state architecture composer (5 layers)
│       ├── GTTProductsModule.jsx       # GTT product catalog, inventory, solution mapping
│       ├── MigrationModule.jsx         # Migration phases, dependencies, blockers
│       ├── ConfidenceModule.jsx        # Confidence scores, open questions, assumptions
│       ├── OverlayModule.jsx           # GTT differentiation & traceability
│       └── InspectorPanel.jsx          # Context-sensitive right rail editor
├── PainEngine.jsx                      # Standalone artifact (renders independently)
└── ArchitectureStudio.jsx              # Full 9-tab workspace artifact (renders independently)
```

## Module Integration Map

```
┌─────────────────────────────────────────────────────────────────┐
│ NTS App Shell                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Architecture Studio (Tab)                                  │  │
│  │                                                           │  │
│  │  1. TSA Intake ──────────► assessment context             │  │
│  │  2. Current Estate ──────► sites, circuits, providers     │  │
│  │  3. Pain Engine ─────────► assessment scores ─────┐       │  │
│  │       │                    pain items + priority   │       │  │
│  │       │ cascading scores                          │       │  │
│  │       ▼                                           ▼       │  │
│  │  4. Pattern Selection ◄── pain-driven fit scores          │  │
│  │  5. Future State ◄─────── selected patterns               │  │
│  │  6. GTT Products ◄────── architecture → product map       │  │
│  │  7. Migration ◄────────── constraints, dependencies       │  │
│  │  8. Confidence ◄──────── open questions, assumptions      │  │
│  │  9. GTT Overlay ◄────── differentiation traceability      │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Scoring Engine — How Priority Works

### Data Flow
```
Assessment Sliders (11 metrics, 0-10 each)
        │
        ▼
   linkedMetrics on each pain/constraint
        │
        ├── Impact = avg(linked metrics)        [or manual override]
        ├── Likelihood = avg * 0.9 + 1          [or manual override]
        ├── Urgency = avg + severity_boost      [or manual override]
        └── Effort = manual only (default 5)    [assessment can't derive]
        │
        ▼
   Priority = (impact×0.35 + likelihood×0.25 + urgency×0.25 + ease×0.15) × 10
        │
        ▼
   0-100 score → CRITICAL (80+) | HIGH (60-79) | MEDIUM (40-59) | LOW (<40)
```

### Override Model
- `manualImpact = null` → derived from assessment (label: "FROM ASSESSMENT", cyan)
- `manualImpact = 8` → override active (label: "OVERRIDE", amber)
- Click RESET → sets back to null, returns to derived mode
- Changes to assessment sliders immediately cascade to all derived scores

### Assessment → Pain Linkage Examples
| Pain Point | linkedMetrics | Assessment Changes → Effect |
|---|---|---|
| MPLS cost escalation | carrierSprawl, vendorSLA | ↑ Carrier Sprawl → ↑ Impact & Priority |
| Security policy gaps | securityFragmentation | ↑ Security Frag → ↑ Impact & Priority |
| Cloud backhaul latency | cloudAppPerformance | ↑ Cloud Perf → ↑ Impact & Priority |
| VPN capacity issues | securityFragmentation, visibilityGaps | Changes to either → recalculated |

## AI Integration

### AI Traceability (Tab 5)
- Sends: assessment scores, all active pains, all active constraints
- Receives: JSON array mapping each issue to GTT pattern + resolution + priority + phase
- Model: claude-sonnet-4-20250514
- Endpoint: https://api.anthropic.com/v1/messages

### AI Resolution Plan (Tab 6)
- Sends: assessment scores, overall pain intensity, all active items
- Receives: phased plan with GTT products, quick wins, risks
- Same model and endpoint

### Both AI features re-generate when assessment changes, keeping recommendations live.

## Integration with NTS

### What Architecture Studio exports (for other NTS modules):
```javascript
{
  assessment: { outageFrequency: 8, mttr: 7, ... },  // 11 metric scores
  painItems: [...],                                     // with computed priority
  selectedPatterns: ["sdwan", "sase", "mcloud"],       // from Pattern Selection
  architectureConfig: { layers: [...] },                // from Future State
  migrationPhases: [...],                               // from Migration
  confidenceScores: [...],                              // from Confidence
}
```

### What Architecture Studio consumes (from NTS app shell):
```javascript
{
  customerName: "ACME Corp",
  sessionId: "sess_12345",
  savedState: { ... }  // persisted from previous session
}
```

### Integration method: React Context or shared Zustand store at NTS app level.

## Standalone Artifacts

### PainEngine.jsx
- Fully self-contained Pain & Constraint Engine
- Renders independently as a React artifact
- Includes: theme, all primitives, scoring engine, assessment, AI calls, inspector
- 130KB bundled

### ArchitectureStudio.jsx
- Full 9-tab workspace
- Renders independently as a React artifact
- Includes all modules inline
- ~260KB bundled

## Development

```bash
# The standalone artifacts render directly in Claude.ai
# For local dev, use any React setup:

npx create-react-app architecture-studio
# Copy src/ files into the project
# Import ArchitectureStudio or PainEngine as the root component
```

## Design System

- Font: Outfit (display), monospace (data)
- Dark mode default, full light mode
- Color system: accent (blue), ok (green), warn (amber), err (red), purple, cyan, orange
- All colors support transparency variants via string concatenation (color + "18")
