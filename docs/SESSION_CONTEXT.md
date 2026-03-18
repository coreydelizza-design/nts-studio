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
(none yet — fresh start)

## Open Issues
- Architecture Studio is 625 lines — candidate for sub-component split
- Executive Context uses all local state — lost on navigation
- Estate Mapper GTT services use local state — not in store
- Customer profile is static (not editable)
