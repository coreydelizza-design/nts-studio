# Network Transformation Studio (NTS)

Premium interactive workshop platform for network transformation engagements. Built for solution architects to run live customer discovery and solution design workshops.

## Quick Start

```bash
npm install
npm run dev          # http://localhost:5173
```

## Production Build

```bash
npm run build        # outputs to dist/
npm start            # serves on port 3000
```

## Docker

```bash
docker build -t nts .
docker run -p 3000:3000 nts
```

## Stack

- **Frontend**: React 18 + TypeScript + Vite 5
- **State**: Zustand
- **Charts**: Recharts
- **Styling**: Tailwind CSS + custom theme system
- **Fonts**: Outfit, DM Sans, JetBrains Mono (Google Fonts)

## Workshop Tabs

| # | Tab | Purpose |
|---|-----|---------|
| 0 | Command Center | Customer profile, workshop config |
| 1 | Executive Context | Business drivers, stakeholder mapping |
| 2 | Estate Mapper | Current infrastructure inventory |
| 3 | Pain Engine | Pain point scoring and prioritization |
| 4 | Maturity Assessment | Network maturity across domains |
| 5 | Future State Vision | Target state sliders and posture |
| 6 | Architecture Studio | Interactive network design canvas |
| 7 | Tradeoff Lab | Build vs buy, cost vs performance |
| 8 | Transformation Roadmap | Phased implementation timeline |
| 9 | Deliverables | Export workshop outputs |

## Data Flow

```
Tab 3 (Pain) → store.painScores → Tab 6 (Architecture risk badges)
Tab 4 (Maturity) → store.maturity → Tab 6 (Architecture gap badges)
Tab 5 (Vision) → store.visionSliders → Tab 6 (GTT overlay activation)
```

## Project Structure

See [docs/APP_STRUCTURE.md](docs/APP_STRUCTURE.md) for full file map.

## Development Workflow

See [docs/CLAUDE_WORKFLOW.md](docs/CLAUDE_WORKFLOW.md) for Claude Code session management.

## Deployment

See [docs/HANDOVER.md](docs/HANDOVER.md) for deployment options and IT handover.

## Roadmap

See [docs/ROADMAP.md](docs/ROADMAP.md) for phased feature plan.
