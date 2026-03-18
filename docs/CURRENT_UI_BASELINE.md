# Current UI Baseline

Status of each tab as of this repo snapshot.

## Tab 0 — Command Center (116 lines)
**State**: Static display from seed data
**Shows**: Customer name, industry, revenue, employees, workshop date, session ID
**Data source**: `CUSTOMER` from `data/seed.ts`
**Store usage**: None (reads static seed)
**Pending**: Make editable, move customer to store

## Tab 1 — Executive Context (88 lines)
**State**: Local useState only — data lost on tab switch
**Shows**: Business drivers, strategic priorities, stakeholder mapping
**Data source**: Local state with hardcoded defaults
**Store usage**: None
**Pending**: Persist to Zustand store

## Tab 2 — Estate Mapper (350 lines)
**State**: Mixed — some local, some visual-only
**Shows**: 8 site type tiles, 5 carrier bar meters, 6 security stack items, 15 GTT service cards
**Data source**: Seed data + local state for GTT services
**Store usage**: None
**Pending**: GTT services → store, Manual/AI mode toggle

## Tab 3 — Pain Engine (66 lines)
**State**: Connected to store
**Shows**: Pain point cards with scoring sliders
**Data source**: `PAIN_ITEMS` from seed, scores in store
**Store usage**: `painScores` (read/write)
**Pending**: Expand pain categories

## Tab 4 — Maturity Assessment (64 lines)
**State**: Connected to store
**Shows**: Maturity domain cards with rating sliders
**Data source**: `MATURITY_DOMAINS` from seed, ratings in store
**Store usage**: `maturity` (read/write)
**Pending**: Visual maturity radar chart

## Tab 5 — Future State Vision (63 lines)
**State**: Connected to store
**Shows**: Vision sliders (automation, security, cloud, etc.) + posture selector
**Data source**: Store state
**Store usage**: `visionSliders`, `visionPosture` (read/write)
**Pending**: None — working correctly

## Tab 6 — Architecture Studio (~160 lines orchestrator + 7 sub-components)
**State**: Connected to store + local canvas state
**Shows**: Interactive node canvas, component palette, node inspector, notes panel, upstream data dashboard, GTT overlay view modes
**Data source**: Store (archNodes, archEdges, notes, painScores, maturity, visionSliders)
**Store usage**: Full read/write for architecture state, read-only for upstream data
**Structure**: ArchitectureStudio.tsx (orchestrator) → PalettePanel, CanvasToolbar, CanvasRenderer, NodeInspector, NotesPanel, DashboardPanel, UseCaseReference + constants.ts
**Pending**: GTT differentiators rebuild

## Tab 7 — Tradeoff Lab (55 lines)
**State**: Placeholder
**Shows**: Skeleton UI with tradeoff categories
**Pending**: Full implementation

## Tab 8 — Transformation Roadmap (47 lines)
**State**: Static display
**Shows**: Phase timeline from seed data
**Data source**: `ROADMAP_PHASES` from seed
**Pending**: Editable phases, drag-and-drop

## Tab 9 — Deliverables (49 lines)
**State**: Placeholder
**Shows**: Export options (PDF, PPTX, summary)
**Pending**: Full implementation with actual export
