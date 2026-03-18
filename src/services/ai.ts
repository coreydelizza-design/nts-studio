/**
 * AI Service — Gemini API integration.
 *
 * Handles prompt construction, API calls, response parsing,
 * and fallback data for offline/demo mode.
 *
 * Usage:
 *   import { analyzeEstate } from '../services/ai';
 *   const results = await analyzeEstate(customerData, estateData);
 */

import { api, ApiError } from './api';

export interface EstateAnalysisInput {
  customerName: string;
  industry: string;
  regions: string[];
  sites: { type: string; count: number; detail: string }[];
  carriers: { name: string; circuits: number; pct: number }[];
  securityTools: { tech: string; scope: string; status: string }[];
  gttActive: { product: string; coverage: string; notes: string }[];
  gttNotDeployed: { product: string; notes: string }[];
}

export interface EstateAnalysisResult {
  siteAnalysis: string;
  carrierAnalysis: string;
  securityAnalysis: string;
  gttFootprintAnalysis: string;
  gttWhitespaceAnalysis: string;
  overallRiskAssessment: string;
  topRecommendations: string;
}

function buildEstatePrompt(input: EstateAnalysisInput): string {
  return `You are an enterprise network and infrastructure analyst for GTT Communications, a global Tier-1 managed network service provider.

Analyze the following customer estate and provide a structured assessment for each section. For each section, provide 3-5 bullet points of analysis including risks, opportunities, and recommendations relevant to a GTT solution architect preparing for a transformation workshop.

CUSTOMER: ${input.customerName} (${input.industry})
REGIONS: ${input.regions.join(', ')}

SITE ESTATE:
${input.sites.map(s => `- ${s.count} ${s.type}: ${s.detail}`).join('\n')}

CARRIER LANDSCAPE:
${input.carriers.map(c => `- ${c.name}: ${c.circuits} circuits (${c.pct}%)`).join('\n')}

SECURITY STACK:
${input.securityTools.map(s => `- ${s.tech}: ${s.scope} [${s.status}]`).join('\n')}

GTT CURRENT SERVICES:
${input.gttActive.map(s => `- ${s.product}: ${s.coverage} — ${s.notes}`).join('\n')}

GTT NOT YET DEPLOYED:
${input.gttNotDeployed.map(s => `- ${s.product}: ${s.notes || 'No notes'}`).join('\n')}

Respond in JSON format with these exact keys:
{
  "siteAnalysis": "bullet point analysis of the site estate",
  "carrierAnalysis": "bullet point analysis of the carrier landscape",
  "securityAnalysis": "bullet point analysis of the security stack",
  "gttFootprintAnalysis": "bullet point analysis of existing GTT services",
  "gttWhitespaceAnalysis": "bullet point analysis of GTT expansion opportunities",
  "overallRiskAssessment": "2-3 sentence overall risk summary",
  "topRecommendations": "numbered list of top 5 GTT recommendations"
}`;
}

const FALLBACK_RESULT: EstateAnalysisResult = {
  siteAnalysis: '• 187 sites across 14 countries creates significant management complexity — standardization is critical\n• 45 acquired sites (24% of estate) pending integration represent the highest-risk segment\n• Branch-heavy footprint (87 offices + 42 retail) is ideal for SD-WAN + SASE transformation\n• 3 DCs + 5 colos suggest hybrid cloud optimization opportunity\n• APAC presence (11 sites) likely underserved by current carrier mix',
  carrierAnalysis: '• 5+ carriers with 223 circuits indicates carrier sprawl — consolidation would reduce cost and operational overhead\n• AT&T dominance (35%) creates single-vendor risk for the largest segment\n• No carrier exceeds 35% — no single point of catastrophic failure but management overhead is high\n• Regional ISPs (11%) likely serve remote/acquired sites with inconsistent SLA\n• Circuit count suggests average 1.2 circuits per site — limited redundancy',
  securityAnalysis: '• 5 overlapping firewall/security vendors is a critical fragmentation risk\n• Cisco ASA fleet (45 sites) at End-of-Support is the most urgent remediation item\n• Zscaler ZIA at only 34 of 187 sites shows incomplete cloud security rollout\n• CrowdStrike XDR provides strong endpoint coverage but no network-layer detection\n• Check Point + Fortinet from acquisitions need consolidation into primary platform',
  gttFootprintAnalysis: '• GTT IP Transit + DIA + MPLS provides a connectivity foundation to build on\n• 34-site MPLS footprint is a natural migration base for GTT SD-WAN\n• Cloud Connect (single AWS region) is significantly underdeployed vs customer multi-cloud strategy\n• Envision Platform access exists but is underutilized — no DEM/NPM enabled\n• Managed NOC is monitoring-only — upgrade to proactive operations is low-hanging fruit',
  gttWhitespaceAnalysis: '• GTT SD-WAN: highest-value opportunity — replaces legacy MPLS, enables branch modernization\n• GTT SASE: addresses #1 pain point (security fragmentation score: 9) — replaces 3+ vendors\n• GTT VDC: strategic for EMEA data sovereignty and regulated workload hosting\n• GTT EnvisionEDGE: consolidates branch CPE stack (router + FW + SD-WAN) into single platform\n• GTT MDR: complements CrowdStrike with network-layer detection and 24/7 SOC',
  overallRiskAssessment: 'The customer estate shows a typical pattern of organic growth plus M&A creating infrastructure sprawl. The most critical risks are: (1) Cisco ASA end-of-support across 45 sites with no replacement plan, (2) security tool fragmentation creating policy gaps between 5 vendors, and (3) 45 acquired sites with no integration timeline. The existing GTT footprint provides a strong foundation for a consolidation play.',
  topRecommendations: '1. Deploy GTT SD-WAN across all 187 sites, starting with the 34 existing MPLS sites as wave 1\n2. Implement GTT Secure Connect (SASE) to replace Cisco ASA, consolidate Zscaler, and unify security policy\n3. Expand GTT Cloud Connect to Azure + multi-region AWS for the multi-cloud strategy\n4. Deploy GTT EnvisionEDGE at branch sites to consolidate CPE and reduce hardware vendors from 3 to 1\n5. Activate GTT VDC for EMEA regulated workloads and as a private cloud landing zone',
};

export async function analyzeEstate(input: EstateAnalysisInput): Promise<EstateAnalysisResult> {
  const prompt = buildEstatePrompt(input);

  try {
    const result = await api.post<EstateAnalysisResult>('/analyze-estate', { prompt });
    return result;
  } catch (err) {
    // If API is unavailable (no backend yet, network error, etc.), return fallback
    console.warn('[AI Service] API call failed, using fallback data:', err instanceof ApiError ? `${err.status}: ${err.message}` : 'Network error');
    return { ...FALLBACK_RESULT };
  }
}
