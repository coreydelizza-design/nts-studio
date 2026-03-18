# Section: Architecture Studio (Tab 6)

**Orchestrator**: `src/components/sections/architecture-studio/ArchitectureStudio.tsx` (~160 lines)

## Sub-Components
| File | Purpose |
|------|---------|
| `constants.ts` | NODE_RISK mapping, GTT_NODES/GTT_EDGES overlays, UC_REF use case data |
| `PalettePanel.tsx` | Left sidebar: search, category filter, palette items, templates, UC reference buttons |
| `CanvasToolbar.tsx` | Top toolbar: view mode toggle, connect button, node/edge stats, layer toggles, zoom controls |
| `CanvasRenderer.tsx` | Interactive canvas: SVG edges, current-state nodes, GTT overlay nodes, view badge, minimap |
| `NodeInspector.tsx` | Right panel "Inspect" tab: GTT detail, node metadata editor, risk/gap badges, connections |
| `NotesPanel.tsx` | Right panel "Notes" tab: note list with type chips, add-note form |
| `DashboardPanel.tsx` | Right panel "Data" tab: top pains, maturity gaps, vision posture, GTT activation status |
| `UseCaseReference.tsx` | Right panel "Ref" tab: use case detail cards (requirements, drivers, best-for, not-ideal) |

## Current State
- Orchestrator holds all state/hooks/callbacks, passes props to sub-components
- Interactive canvas with palette, drag, connect, edit
- Pain risk badges, maturity gaps, GTT overlay from vision sliders
- Notes panel, template loading, UC reference cards
- Sub-component split COMPLETE

## Pending Work
- [ ] GTT differentiators rebuild (see prompts/refactor/architecture-gtt.md)
- [ ] VDC representation
- [ ] EnvisionEDGE virtualized edge model
- [ ] Read GTT inventory from store for pre-population
