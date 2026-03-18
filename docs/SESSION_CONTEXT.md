# Current Session Context

## Active Branch
main (fresh start — no feature branches yet)

## Last Completed Work
- Clean repo structure with all 10 tabs rendering
- Zustand store wired (painScores, maturity, archNodes, archEdges, notes, visionSliders, visionPosture)
- Dark/light theme system (Precision Aerospace / Frosted Titanium)
- Architecture Studio with interactive builder, upstream data flow, GTT overlays
- Estate Mapper with site tiles, carrier bars, security stack, GTT service inventory
- Deployment configs: Dockerfile, vercel.json, CI pipeline
- Architecture Studio sub-component split complete (625-line monolith → slim orchestrator + 7 sub-components + constants)

## What's Next (Phase 2 — pick one to start)
1. Move customer profile from static seed to editable Zustand store (Command Center)
2. Move GTT services from local state to Zustand store (Estate Mapper)
3. Add Manual/AI toggle to Estate Mapper
4. Wire Executive Context to Zustand store

## Store State Shape (current)
```typescript
{
  activeTab: number
  sidebarCollapsed: boolean
  copilotOpen: boolean
  painScores: Record<string, number>
  maturity: Record<string, number>
  archNodes: ArchNode[]
  archEdges: ArchEdge[]
  notes: Note[]
  visionPosture: string
  visionSliders: Record<string, number>
}
```

## Files Modified This Branch
- `src/components/sections/architecture-studio/ArchitectureStudio.tsx` — rewritten as slim orchestrator (~160 lines)
- `src/components/sections/architecture-studio/constants.ts` — NEW: NODE_RISK, GTT_NODES, GTT_EDGES, UC_REF
- `src/components/sections/architecture-studio/PalettePanel.tsx` — NEW: left sidebar (palette, templates, UC reference)
- `src/components/sections/architecture-studio/CanvasToolbar.tsx` — NEW: top toolbar (view mode, connect, zoom, layers)
- `src/components/sections/architecture-studio/CanvasRenderer.tsx` — NEW: canvas with SVG edges, nodes, GTT overlay, minimap
- `src/components/sections/architecture-studio/NodeInspector.tsx` — NEW: right panel inspector tab
- `src/components/sections/architecture-studio/NotesPanel.tsx` — NEW: right panel notes tab
- `src/components/sections/architecture-studio/DashboardPanel.tsx` — NEW: right panel dashboard tab
- `src/components/sections/architecture-studio/UseCaseReference.tsx` — NEW: right panel use case reference tab

## Open Issues
- Executive Context uses all local state — lost on navigation
- Estate Mapper GTT services use local state — not in store
- Customer profile is static (not editable)
