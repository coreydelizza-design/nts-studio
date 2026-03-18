# API Specification

## Overview

The frontend currently operates without a backend. AI features use fallback
data defined in `src/services/ai.ts`. When the backend is built, the
frontend expects these endpoints.

## Endpoints

### POST /api/analyze-estate

Proxies a prompt to Gemini AI and returns structured analysis.

**Request:**
```json
{
  "prompt": "Analyze the following network estate for a financial services company with 47 sites across North America..."
}
```

**Response:**
```json
{
  "siteAnalysis": "string — analysis of site distribution and types",
  "carrierAnalysis": "string — analysis of carrier mix and dependencies",
  "securityAnalysis": "string — analysis of security stack gaps",
  "gttFootprintAnalysis": "string — analysis of current GTT service usage",
  "gttWhitespaceAnalysis": "string — opportunities for new GTT services",
  "overallRiskAssessment": "string — risk summary",
  "topRecommendations": "string — prioritized action items"
}
```

**Error Response:**
```json
{
  "error": "string — error description"
}
```

**Status Codes:**
- 200: Success
- 400: Bad request (missing prompt)
- 500: Gemini API error or parse failure

### Future Endpoints (Phase 4)

```
POST   /api/sessions              Create new workshop session
GET    /api/sessions/:id          Load session
PUT    /api/sessions/:id          Save session state
DELETE /api/sessions/:id          Delete session
GET    /api/sessions              List all sessions

POST   /api/auth/login            Authenticate
POST   /api/auth/logout           End session
GET    /api/auth/me               Current user info
```

## Implementation Notes

- Gemini API key must be server-side only (environment variable)
- Frontend sets `VITE_GEMINI_API_URL` to point to the API
- Feature flag `VITE_FEATURE_AI_ENABLED` controls whether AI features are shown
- Fallback data is used when the API is unreachable or disabled
