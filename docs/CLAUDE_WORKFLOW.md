# Claude Code Workflow Guide

## Session Management

### Before Every Session

1. Start with this prompt:
```
Read docs/SESSION_CONTEXT.md and docs/APP_STRUCTURE.md before making any changes.
I'm working on [describe what you want to do].
```

2. Create a feature branch:
```bash
git checkout dev
git pull origin dev
git checkout -b feat/[feature-name]
```

### During Every Session

- **Commit after every working change** — not at the end
- **Push every 3-4 commits** — protects against session loss
- **Update SESSION_CONTEXT.md** before the session ends

### Commit Convention

```
[section-name] brief description

Examples:
[estate-mapper] move GTT services to Zustand store
[architecture-studio] add upstream pain risk badges
[store] add visionSliders state and setters
[theme] fix dark mode contrast on sidebar
[deploy] update Dockerfile for Railway
```

### If Session Maxes Out

Your work is safe if you committed and pushed. Start a new session:
```
I'm continuing work on branch feat/[feature-name].
Read docs/SESSION_CONTEXT.md for where I left off.
Current branch has these changes: [list what was done].
Next steps: [what still needs to happen].
```

## Branching Strategy

```
main                     ← production (Railway/Vercel deploys from here)
├── dev                  ← integration branch
│   ├── feat/[name]      ← one branch per Claude Code session
│   ├── fix/[name]       ← bug fix branches
│   └── refactor/[name]  ← refactoring branches
```

### Rules
- Never push directly to `main`
- Merge feature branches → `dev` first
- Test on `dev`, then merge `dev` → `main`
- One feature branch per Claude Code session

## Prompt Templates

### Single Tab Work
```
Working on the [Tab Name] tab (src/components/sections/[folder]/).
Read the current file first. Then:
1. [Specific change]
2. [Specific change]
After each change, run npm run build to verify.
Commit after each working change.
```

### Cross-Tab Work
```
I need to wire data from [Tab A] to [Tab B].
1. Read src/store/useWorkshopStore.ts for current state shape
2. Read src/types/index.ts for current interfaces
3. Read both tab components
Then: [describe the data flow needed]
```

### Universal Changes
```
I need to change [theme/layout/store/types] which affects multiple tabs.
1. Read the file being changed
2. Search for all imports/usages across src/
3. Make the change
4. Verify no tabs break: npm run build
```

## File Size Guidelines

- **Under 200 lines**: Single file is fine
- **200-400 lines**: Consider extracting sub-components
- **Over 400 lines**: Must split into sub-components in same folder

When splitting, keep the main file as the orchestrator and extract
self-contained pieces into the same section folder:

```
sections/architecture-studio/
├── ArchitectureStudio.tsx          # Main orchestrator
├── CanvasRenderer.tsx              # Canvas drawing logic
├── NodeInspector.tsx               # Node editing panel
├── PalettePanel.tsx                # Component palette
└── index.ts                        # Barrel export
```
