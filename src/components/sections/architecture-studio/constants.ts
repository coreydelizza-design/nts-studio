import type { ArchNode } from '../../../types';

/* ═══════════════════════════════════════════════════════════
   NODE → UPSTREAM DATA MAPPING
   Maps TEMPLATES.current node IDs to pain points + maturity
   domains so risk badges and gap indicators flow from tabs 3–4.
   ═══════════════════════════════════════════════════════════ */
export const NODE_RISK: Record<string, { painIds: string[]; matKeys: string[] }> = {
  t1:  { painIds: ['outage'],                          matKeys: ['branchStd'] },
  t2:  { painIds: ['outage', 'mttr'],                  matKeys: ['resilience'] },
  t3:  { painIds: ['mttr'],                            matKeys: ['resilience'] },
  t4:  { painIds: ['secFrag'],                         matKeys: ['secArch'] },
  t5:  { painIds: ['cloudPerf'],                       matKeys: ['cloudConn'] },
  t6:  { painIds: ['cloudPerf'],                       matKeys: ['cloudConn'] },
  t7:  { painIds: ['carrierSprawl', 'deployDelay', 'manualOps'], matKeys: ['branchStd'] },
  t8:  { painIds: ['carrierSprawl', 'deployDelay'],    matKeys: ['branchStd'] },
  t9:  { painIds: ['deployDelay', 'visibility'],       matKeys: ['branchStd'] },
  t10: { painIds: ['manualOps'],                       matKeys: ['netArch', 'automation'] },
  t11: { painIds: ['secFrag', 'visibility'],           matKeys: ['secArch'] },
  t12: { painIds: ['secFrag', 'outage'],               matKeys: ['secArch'] },
  t13: { painIds: ['carrierSprawl', 'vendorPerf'],     matKeys: ['netArch'] },
  t14: { painIds: ['visibility', 'manualOps'],         matKeys: ['observability'] },
  t15: { painIds: ['cloudPerf'],                       matKeys: ['cloudConn'] },
};

/* ═══════════════════════════════════════════════════════════
   GTT FUTURE-STATE OVERLAY
   Each component appears when its vision slider threshold is met.
   ═══════════════════════════════════════════════════════════ */
export interface GttOverlay {
  id: string;
  label: string;
  icon: string;
  x: number;
  y: number;
  detail: string;
  sliderKey: string;
  threshold: number;
  replaces: string[];
}

export const GTT_NODES: GttOverlay[] = [
  { id: 'gtt_sdwan',   label: 'GTT SD-WAN Fabric',    icon: '📡', x: 280, y: 335, detail: 'Managed overlay — all 187 sites',    sliderKey: 'netModel',    threshold: 5, replaces: ['t10', 't13'] },
  { id: 'gtt_sase',    label: 'GTT SASE / SSE',       icon: '🔒', x: 440, y: 130, detail: 'SWG + CASB + ZTNA + FWaaS',         sliderKey: 'zeroTrust',   threshold: 6, replaces: ['t11', 't12'] },
  { id: 'gtt_backbone', label: 'GTT Tier-1 Backbone', icon: '🌐', x: 440, y: 270, detail: 'AS3257 — global SLA-grade underlay', sliderKey: 'resil',       threshold: 6, replaces: [] },
  { id: 'gtt_cloud',   label: 'GTT Cloud On-Ramp',    icon: '☁',  x: 700, y: 50,  detail: 'Direct Connect + ExpressRoute',     sliderKey: 'cloudAdj',    threshold: 6, replaces: [] },
  { id: 'gtt_envision', label: 'GTT Envision (DEM)',   icon: '📊', x: 720, y: 370, detail: 'Full-stack observability',           sliderKey: 'observ',      threshold: 6, replaces: ['t14'] },
  { id: 'gtt_noc',     label: 'GTT Managed NOC',      icon: '👁', x: 720, y: 460, detail: '24/7 follow-the-sun operations',    sliderKey: 'supportModel', threshold: 6, replaces: [] },
  { id: 'gtt_orch',    label: 'GTT Orchestrator',      icon: '⚙',  x: 840, y: 340, detail: 'Automation + NetOps CI/CD',         sliderKey: 'auto',        threshold: 7, replaces: [] },
  { id: 'gtt_edge',    label: 'GTT Edge Compute',      icon: '⚡', x: 160, y: 460, detail: 'Distributed compute at branch',     sliderKey: 'aiEdge',      threshold: 5, replaces: [] },
];

export const GTT_EDGES: { from: string; to: string; need: string }[] = [
  { from: 'gtt_backbone', to: 'gtt_sdwan', need: 'gtt_sdwan' },
  { from: 'gtt_sdwan', to: 't7', need: 'gtt_sdwan' }, { from: 'gtt_sdwan', to: 't8', need: 'gtt_sdwan' }, { from: 'gtt_sdwan', to: 't9', need: 'gtt_sdwan' },
  { from: 'gtt_sase', to: 'gtt_cloud', need: 'gtt_sase' }, { from: 'gtt_sase', to: 'gtt_backbone', need: 'gtt_sase' },
  { from: 'gtt_cloud', to: 't5', need: 'gtt_cloud' }, { from: 'gtt_cloud', to: 't6', need: 'gtt_cloud' },
  { from: 'gtt_envision', to: 'gtt_sdwan', need: 'gtt_envision' }, { from: 'gtt_noc', to: 'gtt_envision', need: 'gtt_noc' },
  { from: 'gtt_orch', to: 'gtt_sdwan', need: 'gtt_orch' }, { from: 'gtt_edge', to: 'gtt_sdwan', need: 'gtt_edge' },
  { from: 'gtt_backbone', to: 't2', need: 'gtt_backbone' }, { from: 't1', to: 'gtt_sdwan', need: 'gtt_sdwan' },
  { from: 'gtt_sase', to: 't15', need: 'gtt_sase' },
];

/* ═══════════════════════════════════════════════════════════
   USE CASE REFERENCE DATA
   ═══════════════════════════════════════════════════════════ */
export interface UseCaseRef {
  id: string;
  icon: string;
  label: string;
  color: string;
  family: string;
  tagline: string;
  reqs: string[];
  bestFor: string[];
  notIdeal: string[];
  drivers: string[];
  pains: string[];
}

export const UC_REF: UseCaseRef[] = [
  { id: 'on_demand', icon: '⚡', label: 'On-Demand Connectivity', color: '#f59e0b', family: 'Connectivity',
    tagline: 'Rapid, flexible connectivity provisioned in minutes',
    reqs: ['Self-service portal', 'Sub-1-hour activation', 'API-driven provisioning', 'Elastic bandwidth', 'Automated DR failover', 'Usage-based billing'],
    bestFor: ['M&A site integration', 'Seasonal spikes', 'DR activation', 'Branch pilots'],
    notIdeal: ['Off-net locations', 'Dedicated wavelength needs'],
    drivers: ['Cost Optimization', 'M&A Integration', 'Resilience'],
    pains: ['Deployment Delays', 'Carrier Sprawl', 'Manual Operations'] },
  { id: 'multi_cloud', icon: '☁️', label: 'Multi-Cloud Connectivity', color: '#22d3ee', family: 'Cloud',
    tagline: 'Dedicated SLA-backed interconnects to every major cloud',
    reqs: ['Dedicated interconnects (AWS/Azure/GCP)', 'Multi-cloud fabric', 'App-aware routing', 'Cloud-edge security', 'SaaS optimization', 'NaaS billing'],
    bestFor: ['Multi-cloud production', 'SaaS performance issues', 'Data sovereignty', 'Cloud migration'],
    notIdeal: ['Single-cloud only', 'Dev/test only workloads'],
    drivers: ['Cloud Acceleration', 'Resilience', 'Cost Optimization'],
    pains: ['Cloud Performance', 'Security Fragmentation', 'Visibility Gaps'] },
  { id: 'sdwan', icon: '📡', label: 'SD-WAN', color: '#3b82f6', family: 'WAN',
    tagline: 'Application-aware overlay replacing legacy MPLS',
    reqs: ['Managed SD-WAN overlay', 'App-aware steering', 'Multi-transport underlay', 'Zero-touch provisioning', 'Central orchestration', 'Segmentation', 'Direct cloud breakout', 'MPLS migration support'],
    bestFor: ['20+ sites on MPLS', 'App performance complaints', 'Long provisioning cycles', 'Carrier independence'],
    notIdeal: ['<5 sites', 'Regulatory private-circuit mandate', 'No local breakout permitted'],
    drivers: ['Cost Optimization', 'Branch Simplification', 'Cloud Acceleration'],
    pains: ['Carrier Sprawl', 'Deployment Delays', 'Manual Operations', 'Outage Frequency'] },
  { id: 'sase', icon: '🔒', label: 'SASE', color: '#ef4444', family: 'Security',
    tagline: 'Converged network + security from the cloud',
    reqs: ['Cloud SWG + SSL inspection', 'ZTNA for all users', 'CASB for SaaS', 'FWaaS replacing branch hardware', 'DLP', 'IdP federation', 'Device posture', 'Unified policy across entities'],
    bestFor: ['3+ overlapping security tools', 'Remote workforce', 'Branch FW EOL', 'Zero trust mandate', 'M&A security'],
    notIdeal: ['Recently deployed NGFW everywhere', 'All office-based users', 'Regulatory cloud prohibition'],
    drivers: ['Security & Compliance', 'Cloud Acceleration', 'Cost Optimization'],
    pains: ['Security Fragmentation', 'Manual Operations', 'Cloud Performance', 'M&A Friction'] },
];
