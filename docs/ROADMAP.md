# Development Roadmap

## Phase 1 — MVP ✅ COMPLETE
- [x] All 10 tabs rendering with seed data
- [x] Zustand store wired across tabs
- [x] Dark/light theme system
- [x] Architecture Studio (builder + upstream data + GTT overlays)
- [x] Estate Mapper (sites, carriers, security, GTT services)
- [x] Deployment configs (Docker, Vercel, CI)
- [x] Documentation (structure, workflow, handover)

## Phase 2 — Interactive Data Flow
- [ ] Editable customer profile in Command Center → store
- [ ] GTT services from Estate Mapper → store → Architecture Studio
- [ ] Executive Context persisted to store
- [ ] Manual Entry mode on Estate Mapper (expandable context panels)
- [ ] All upstream data flowing correctly to Architecture Studio
- [ ] Architecture Studio sub-component split (625 lines → 4-5 files)

## Phase 3 — AI Integration
- [ ] Serverless function for Gemini AI proxy
- [ ] Estate Mapper AI Analysis mode
- [ ] AI-powered recommendations in Architecture Studio
- [ ] Copilot panel wired to Gemini
- [ ] Feature flags controlling AI features
- [ ] Fallback data when API unavailable

## Phase 4 — Enterprise Features
- [ ] Authentication (Azure AD / Okta)
- [ ] PostgreSQL database for session storage
- [ ] Save/load workshop sessions
- [ ] Multi-user support
- [ ] PDF/PPTX export from Deliverables tab
- [ ] Audit logging

## Phase 5 — GTT Product Integration
- [ ] GTT product catalog API
- [ ] Pricing engine integration
- [ ] CRM data pull (customer info)
- [ ] Architecture Studio GTT differentiators rebuild
- [ ] VDC, EnvisionEDGE, Backbone visual layers
