# Application Structure

## File Map

```
src/
├── App.tsx                           # Tab routing + ErrorBoundary per tab
├── main.tsx                          # React root + ThemeProvider
├── index.css                         # Global CSS, animations, scrollbar
│
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx              # Main layout wrapper
│   │   ├── Sidebar.tsx               # Navigation sidebar with tab list
│   │   └── TopBar.tsx                # Header bar with customer info
│   │
│   ├── shared/
│   │   ├── ErrorBoundary.tsx         # Per-tab error isolation
│   │   ├── Primitives.tsx            # Reusable UI components
│   │   └── ThemeToggle.tsx           # Dark/light mode switch
│   │
│   ├── copilot/
│   │   └── CopilotPanel.tsx          # AI assistant sidebar (Phase 3)
│   │
│   └── sections/                     # ONE FOLDER PER TAB
│       ├── command-center/
│       │   ├── CommandCenter.tsx
│       │   └── index.ts
│       ├── executive-context/
│       │   ├── ExecutiveContext.tsx
│       │   └── index.ts
│       ├── estate-mapper/
│       │   ├── EstateMapper.tsx
│       │   └── index.ts
│       ├── pain-engine/
│       │   ├── PainEngine.tsx
│       │   └── index.ts
│       ├── maturity-assessment/
│       │   ├── MaturityAssessment.tsx
│       │   └── index.ts
│       ├── future-state/
│       │   ├── FutureStateVision.tsx
│       │   └── index.ts
│       ├── architecture-studio/
│       │   ├── ArchitectureStudio.tsx  # Slim orchestrator (~160 lines)
│       │   ├── constants.ts            # NODE_RISK, GTT_NODES, GTT_EDGES, UC_REF
│       │   ├── PalettePanel.tsx        # Left sidebar palette + templates
│       │   ├── CanvasToolbar.tsx       # Top toolbar (view mode, zoom, layers)
│       │   ├── CanvasRenderer.tsx      # Canvas with nodes, edges, minimap
│       │   ├── NodeInspector.tsx       # Right panel inspector tab
│       │   ├── NotesPanel.tsx          # Right panel notes tab
│       │   ├── DashboardPanel.tsx      # Right panel dashboard tab
│       │   ├── UseCaseReference.tsx    # Right panel UC reference tab
│       │   └── index.ts
│       ├── tradeoff-lab/
│       │   ├── TradeoffLab.tsx
│       │   └── index.ts
│       ├── roadmap/
│       │   ├── TransformationRoadmap.tsx
│       │   └── index.ts
│       └── deliverables/
│           ├── Deliverables.tsx
│           └── index.ts
│
├── data/
│   └── seed.ts                       # Static seed data (customer, nav, templates)
│
├── store/
│   └── useWorkshopStore.ts           # Zustand global state
│
├── state/
│   └── index.ts                      # Barrel export
│
├── types/
│   └── index.ts                      # All TypeScript interfaces
│
├── theme/
│   ├── tokens.ts                     # Design tokens (colors, spacing, etc.)
│   ├── ThemeProvider.tsx              # Theme context provider
│   ├── useTheme.ts                   # Theme hook
│   └── themeUtils.ts                 # Theme utilities
│
├── services/
│   ├── api.ts                        # API client
│   ├── ai.ts                         # Gemini AI integration + fallback
│   └── index.ts                      # Barrel export
│
├── hooks/
│   └── useFeatureFlag.ts             # Feature flag hook
│
└── utils/
    ├── config.ts                     # Feature flags from env vars
    └── index.ts                      # Barrel export
```

## Naming Conventions

- **Folders**: kebab-case (`command-center/`, `estate-mapper/`)
- **Components**: PascalCase (`CommandCenter.tsx`, `EstateMapper.tsx`)
- **Hooks**: camelCase with `use` prefix (`useWorkshopStore.ts`)
- **Utils/services**: camelCase (`config.ts`, `api.ts`)
- **Barrel exports**: Always `index.ts`

## Import Rules

- App.tsx imports from section barrels: `from './components/sections/estate-mapper'`
- Sections import store directly: `from '../../store/useWorkshopStore'`
- Sections import types directly: `from '../../types'`
- Sections import seed data directly: `from '../../data/seed'`
- Shared components import from theme: `from '../../theme/useTheme'`

## Adding a New Section

1. Create folder: `src/components/sections/new-section/`
2. Create component: `NewSection.tsx`
3. Create barrel: `index.ts` with `export { NewSection } from './NewSection'`
4. Add to `App.tsx` tab routing
5. Add to `src/data/seed.ts` NAV_ITEMS array
6. Add types to `src/types/index.ts` if needed
7. Add store state to `src/store/useWorkshopStore.ts` if needed

## Adding Store State

1. Add interface to `src/types/index.ts`
2. Add state + setter to `src/store/useWorkshopStore.ts`
3. Import in consuming components: `const { newState } = useWorkshopStore()`
