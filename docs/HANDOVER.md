# IT Handover Guide

## What This Is

Network Transformation Studio (NTS) is an interactive workshop platform for
solution architects to run network transformation discovery sessions with
enterprise customers. It is a single-page application (SPA) built with
React, TypeScript, and Vite.

## Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Runtime | Node.js | 20.x |
| Framework | React | 18.3 |
| Language | TypeScript | 5.5 |
| Build | Vite | 5.3 |
| State | Zustand | 4.5 |
| Charts | Recharts | 2.12 |
| CSS | Tailwind CSS | 3.4 |
| Server | Custom Node.js static server | — |

## Build & Run

```bash
# Install dependencies
npm install

# Development (hot reload on localhost:5173)
npm run dev

# Production build (outputs to dist/)
npm run build

# Production server (serves dist/ on PORT or 3000)
npm start

# Type check
npm run typecheck
```

## Docker Deployment

```bash
docker build -t nts .
docker run -p 3000:3000 nts
```

The Dockerfile uses node:20-slim, installs dependencies, builds the app,
and runs server.js. The server listens on the PORT environment variable
(default 3000) and serves the dist/ folder.

## Environment Variables

See `.env.example` for all variables. Currently only feature flags are used.
AI integration (Phase 3) will require GEMINI_API_KEY.

## Deployment Options

### Option A: Static SPA (simplest)
`npm run build` produces a `dist/` folder containing index.html and JS/CSS
bundles. Serve with any static file server, CDN, or load balancer
(Nginx, CloudFront, Azure Static Web Apps, etc.).

SPA routing requires all paths to serve index.html. Example Nginx config:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### Option B: Docker Container
Use the included Dockerfile. Deploys to any container platform
(ECS, AKS, GKE, Docker Compose, etc.).

### Option C: Vercel / Railway (dev/demo only)
Vercel auto-detects Vite. Railway uses the Dockerfile.
These are development and demo hosting — not for production enterprise use.

## Architecture

```
Browser → Static SPA (dist/)
                ↓ (Phase 3)
         API Gateway → Gemini AI Proxy → Google AI
                ↓ (Phase 4)
              Database (PostgreSQL)
```

Current state: frontend only, no backend, no database.
AI features use fallback data when API is unavailable.

## API Contract (Phase 3)

When the backend is built, the frontend expects one endpoint:

```
POST /api/analyze-estate
Content-Type: application/json

Request:  { "prompt": "string" }
Response: {
  "siteAnalysis": "string",
  "carrierAnalysis": "string",
  "securityAnalysis": "string",
  "gttFootprintAnalysis": "string",
  "gttWhitespaceAnalysis": "string",
  "overallRiskAssessment": "string",
  "topRecommendations": "string"
}
```

## Security Notes

- No authentication currently (Phase 4)
- No sensitive data stored — all data is in-memory during session
- Gemini API key must be server-side only (never in browser)
- Feature flags control what is enabled in each environment

## CI Pipeline

`.github/workflows/ci.yml` runs typecheck + build on every push and PR.
Extend this with tests, linting, and deployment as needed.
