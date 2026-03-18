import type {
  Customer, MaturityDomain, MaturityMap, PainItem, PaletteItem,
  RoadmapTrack, RoadmapItem, ArchTemplate, ArchNode, ArchEdge, NavItem, NodeMeta,
} from '../types';

/* ═══════════════════════════════════════════════════
   CUSTOMER PROFILE
   ═══════════════════════════════════════════════════ */
export const CUSTOMER: Customer = {
  name: 'Meridian Financial Group',
  shortName: 'MFG',
  industry: 'Financial Services & Insurance',
  revenue: '$4.2B',
  employees: '12,500+',
  sites: 187,
  countries: 14,
  regions: ['North America', 'EMEA', 'APAC'],
  workshopDate: 'March 11, 2026',
  workshopId: 'WS-2026-0311-MFG',
  workshopLead: 'Sarah Chen',
  workshopLeadTitle: 'Principal Solutions Architect',
  stakeholders: [
    { name: 'James Morrison', title: 'Chief Information Officer', focus: 'Digital transformation & modernization mandate', avatar: 'JM', tier: 'executive' },
    { name: 'Dr. Lisa Park', title: 'Chief Information Security Officer', focus: 'Zero trust migration & regulatory compliance', avatar: 'LP', tier: 'executive' },
    { name: 'Robert Tanaka', title: 'VP Network & Infrastructure', focus: 'Network modernization & carrier consolidation', avatar: 'RT', tier: 'leader' },
    { name: 'Maria Santos', title: 'VP IT Operations', focus: 'Service delivery & operational efficiency', avatar: 'MS', tier: 'leader' },
    { name: 'David Kim', title: 'Director, Cloud Engineering', focus: 'Multi-cloud strategy & connectivity', avatar: 'DK', tier: 'technical' },
    { name: 'Aisha Patel', title: 'Head of IT Procurement', focus: 'Vendor consolidation & TCO optimization', avatar: 'AP', tier: 'technical' },
  ],
};

/* ═══════════════════════════════════════════════════
   NAVIGATION
   ═══════════════════════════════════════════════════ */
export const NAV: NavItem[] = [
  { id: 0, label: 'Command Center', short: 'Command', icon: '◆', phase: null },
  { id: 1, label: 'Executive Context', short: 'Context', icon: '◎', phase: 1 },
  { id: 2, label: 'Current-State Estate', short: 'Estate', icon: '▦', phase: 2 },
  { id: 3, label: 'Pain & Constraints', short: 'Pain', icon: '▲', phase: 3 },
  { id: 4, label: 'Maturity Assessment', short: 'Maturity', icon: '◉', phase: 4 },
  { id: 5, label: 'Future-State Vision', short: 'Vision', icon: '◈', phase: 5 },
  { id: 6, label: 'Architecture Studio', short: 'Studio', icon: '✦', phase: 6 },
  { id: 7, label: 'Value & Tradeoffs', short: 'Value', icon: '⬡', phase: 7 },
  { id: 8, label: 'Transformation Roadmap', short: 'Roadmap', icon: '▸', phase: 8 },
  { id: 9, label: 'Workshop Deliverables', short: 'Deliver', icon: '◧', phase: 9 },
];

/* ═══════════════════════════════════════════════════
   MATURITY MODEL
   ═══════════════════════════════════════════════════ */
export const MATURITY_DOMAINS: MaturityDomain[] = [
  { key: 'netArch', label: 'Network Architecture', short: 'Network' },
  { key: 'secArch', label: 'Security Architecture', short: 'Security' },
  { key: 'cloudConn', label: 'Cloud Connectivity', short: 'Cloud' },
  { key: 'resilience', label: 'Resilience & Availability', short: 'Resilience' },
  { key: 'observability', label: 'Observability & Analytics', short: 'Observability' },
  { key: 'automation', label: 'Automation & Orchestration', short: 'Automation' },
  { key: 'branchStd', label: 'Branch Standardization', short: 'Branch' },
  { key: 'supportModel', label: 'Support Operating Model', short: 'Support' },
  { key: 'governance', label: 'Governance & Compliance', short: 'Governance' },
  { key: 'aiEdge', label: 'AI & Edge Readiness', short: 'AI/Edge' },
];

export const INIT_MATURITY: MaturityMap = {
  netArch: { current: 2, target: 4 }, secArch: { current: 2, target: 5 },
  cloudConn: { current: 3, target: 5 }, resilience: { current: 3, target: 4 },
  observability: { current: 1, target: 4 }, automation: { current: 1, target: 4 },
  branchStd: { current: 2, target: 5 }, supportModel: { current: 2, target: 4 },
  governance: { current: 3, target: 4 }, aiEdge: { current: 1, target: 3 },
};

/* ═══════════════════════════════════════════════════
   PAIN POINTS
   ═══════════════════════════════════════════════════ */
export const PAIN_ITEMS: PainItem[] = [
  { id: 'outage', label: 'Outage Frequency', desc: 'Unplanned downtime events per quarter', icon: '⚡', cat: 'Reliability' },
  { id: 'mttr', label: 'Mean Time to Resolve', desc: 'Hours to restore service after incident', icon: '⏱', cat: 'Reliability' },
  { id: 'cloudPerf', label: 'Cloud Application Performance', desc: 'Latency and throughput to SaaS/IaaS', icon: '☁', cat: 'Performance' },
  { id: 'secFrag', label: 'Security Tool Fragmentation', desc: 'Overlapping, siloed security platforms', icon: '🛡', cat: 'Security' },
  { id: 'carrierSprawl', label: 'Carrier & Circuit Sprawl', desc: 'Multi-vendor complexity and cost leakage', icon: '🔗', cat: 'Operations' },
  { id: 'visibility', label: 'Network Visibility Gaps', desc: 'Blind spots in traffic and performance', icon: '👁', cat: 'Operations' },
  { id: 'deployDelay', label: 'Site Deployment Velocity', desc: 'Weeks/months to provision new locations', icon: '🚀', cat: 'Agility' },
  { id: 'maIntegration', label: 'M&A Integration Friction', desc: 'Time and complexity to integrate acquisitions', icon: '🏢', cat: 'Strategic' },
  { id: 'ticketVolume', label: 'Ticket Volume & Escalations', desc: 'Operational overhead from manual processes', icon: '🎫', cat: 'Operations' },
  { id: 'manualOps', label: 'Manual Operations Burden', desc: 'CLI-driven changes, no automation pipeline', icon: '🔧', cat: 'Operations' },
  { id: 'vendorPerf', label: 'Vendor SLA Performance', desc: 'Missed SLAs and accountability gaps', icon: '📉', cat: 'Vendor' },
];

export const INIT_PAIN_SCORES: Record<string, number> = {
  outage: 8, mttr: 7, cloudPerf: 6, secFrag: 9, carrierSprawl: 7,
  visibility: 5, deployDelay: 6, maIntegration: 8, ticketVolume: 4, manualOps: 7, vendorPerf: 3,
};

/* ═══════════════════════════════════════════════════
   ARCHITECTURE PALETTE
   ═══════════════════════════════════════════════════ */
export const PALETTE: PaletteItem[] = [
  { type: 'hq', label: 'Headquarters', icon: '🏛', cat: 'Sites', color: '#3b82f6', defaultMeta: { role: 'Primary HQ', status: 'active', criticality: 'critical' } },
  { type: 'branch', label: 'Branch Office', icon: '🏢', cat: 'Sites', color: '#6366f1', defaultMeta: { role: 'Regional branch', status: 'active', criticality: 'medium' } },
  { type: 'retail', label: 'Retail / Advisory', icon: '🏪', cat: 'Sites', color: '#8b5cf6', defaultMeta: { role: 'Customer-facing site', status: 'active', criticality: 'medium' } },
  { type: 'plant', label: 'Manufacturing', icon: '🏭', cat: 'Sites', color: '#a855f7', defaultMeta: { role: 'Production facility', status: 'active', criticality: 'high' } },
  { type: 'warehouse', label: 'Warehouse / Logistics', icon: '📦', cat: 'Sites', color: '#c084fc', defaultMeta: { role: 'Distribution hub', status: 'active', criticality: 'medium' } },
  { type: 'callcenter', label: 'Contact Center', icon: '📞', cat: 'Sites', color: '#e879f9', defaultMeta: { role: 'Customer support', status: 'active', criticality: 'high' } },
  { type: 'sdwan', label: 'SD-WAN Node', icon: '📡', cat: 'Network', color: '#f97316', defaultMeta: { role: 'SD-WAN edge device', status: 'active', criticality: 'high' } },
  { type: 'router', label: 'Core Router', icon: '🔀', cat: 'Network', color: '#f59e0b', defaultMeta: { role: 'Core routing', status: 'active', criticality: 'critical' } },
  { type: 'lb', label: 'Load Balancer', icon: '⚖️', cat: 'Network', color: '#ec4899', defaultMeta: { role: 'Traffic distribution', status: 'active', criticality: 'high' } },
  { type: 'vpn', label: 'VPN Gateway', icon: '🔐', cat: 'Network', color: '#f43f5e', defaultMeta: { role: 'Encrypted tunnel', status: 'active', criticality: 'high' } },
  { type: 'mpls', label: 'MPLS PE', icon: '🔗', cat: 'Network', color: '#d97706', defaultMeta: { role: 'MPLS provider edge', status: 'decommission', criticality: 'medium' } },
  { type: 'internet', label: 'Internet Edge', icon: '🌐', cat: 'Network', color: '#10b981', defaultMeta: { role: 'Internet breakout', status: 'active', criticality: 'high' } },
  { type: 'firewall', label: 'Firewall / NGFW', icon: '🧱', cat: 'Security', color: '#ef4444', defaultMeta: { role: 'Perimeter security', status: 'active', criticality: 'critical' } },
  { type: 'sase', label: 'SASE / SSE', icon: '🔒', cat: 'Security', color: '#dc2626', defaultMeta: { role: 'Secure access service edge', status: 'planned', criticality: 'critical' } },
  { type: 'ztna', label: 'ZTNA Broker', icon: '🛡️', cat: 'Security', color: '#b91c1c', defaultMeta: { role: 'Zero trust access', status: 'planned', criticality: 'critical' } },
  { type: 'waf', label: 'WAF', icon: '🌊', cat: 'Security', color: '#fca5a5', defaultMeta: { role: 'Web application firewall', status: 'active', criticality: 'high' } },
  { type: 'cloud_aws', label: 'AWS Region', icon: '☁️', cat: 'Cloud', color: '#f97316', defaultMeta: { role: 'AWS cloud region', status: 'active', criticality: 'critical' } },
  { type: 'cloud_azure', label: 'Azure Region', icon: '☁️', cat: 'Cloud', color: '#3b82f6', defaultMeta: { role: 'Azure cloud region', status: 'active', criticality: 'critical' } },
  { type: 'cloud_gcp', label: 'GCP Region', icon: '☁️', cat: 'Cloud', color: '#22d3ee', defaultMeta: { role: 'GCP cloud region', status: 'active', criticality: 'high' } },
  { type: 'saas', label: 'SaaS Platform', icon: '💻', cat: 'Cloud', color: '#06b6d4', defaultMeta: { role: 'SaaS application', status: 'active', criticality: 'high' } },
  { type: 'colo', label: 'Colocation', icon: '🔌', cat: 'Cloud', color: '#2dd4bf', defaultMeta: { role: 'Colo facility', status: 'active', criticality: 'high' } },
  { type: 'dc', label: 'Data Center', icon: '🖥️', cat: 'Cloud', color: '#14b8a6', defaultMeta: { role: 'Enterprise data center', status: 'active', criticality: 'critical' } },
  { type: 'ai_edge', label: 'AI / Edge Node', icon: '🤖', cat: 'Edge / Compute', color: '#84cc16', defaultMeta: { role: 'Edge compute / AI', status: 'planned', criticality: 'medium' } },
  { type: 'iot_gw', label: 'IoT Gateway', icon: '📲', cat: 'Edge / Compute', color: '#65a30d', defaultMeta: { role: 'IoT aggregation', status: 'planned', criticality: 'medium' } },
  { type: 'vdc', label: 'Virtual Data Center', icon: '💾', cat: 'Edge / Compute', color: '#4ade80', defaultMeta: { role: 'Virtual DC / VPC', status: 'active', criticality: 'high' } },
  { type: 'cdn', label: 'CDN / Edge Cache', icon: '⚡', cat: 'Edge / Compute', color: '#a3e635', defaultMeta: { role: 'Content delivery', status: 'active', criticality: 'medium' } },
  { type: 'noc', label: 'NOC / SOC', icon: '👁️', cat: 'Operations', color: '#eab308', defaultMeta: { role: 'Operations center', status: 'active', criticality: 'high' } },
  { type: 'observability', label: 'Observability Stack', icon: '📊', cat: 'Operations', color: '#facc15', defaultMeta: { role: 'Monitoring & analytics', status: 'active', criticality: 'high' } },
  { type: 'automation', label: 'Automation Engine', icon: '⚙️', cat: 'Operations', color: '#a3a3a3', defaultMeta: { role: 'Orchestration', status: 'planned', criticality: 'medium' } },
  { type: 'managed', label: 'Managed Service', icon: '🛠️', cat: 'Operations', color: '#94a3b8', defaultMeta: { role: 'MSP layer', status: 'planned', criticality: 'medium' } },
];

export const PALETTE_CATS = ['Sites', 'Network', 'Security', 'Cloud', 'Edge / Compute', 'Operations'];

export const EMPTY_META: NodeMeta = { name: '', role: '', status: 'active', owner: '', notes: '', criticality: 'medium', phase: 0 };

export const palItem = (type: string) => PALETTE.find(p => p.type === type) || PALETTE[0];

/* ═══════════════════════════════════════════════════
   ARCHITECTURE TEMPLATES
   ═══════════════════════════════════════════════════ */
const currentNodes: ArchNode[] = [
  { id: 't1', type: 'hq', label: 'NYC Headquarters', x: 440, y: 50, meta: { name: 'NYC Headquarters', role: 'Primary HQ — 2,500 users', status: 'active', owner: 'Robert Tanaka', notes: 'Dual ISP, MPLS primary', criticality: 'critical', phase: 0 } },
  { id: 't2', type: 'dc', label: 'East Data Center', x: 180, y: 200, meta: { name: 'East Data Center', role: 'Primary DC — Equinix NY5', status: 'active', owner: 'Robert Tanaka', notes: 'Core compute + storage', criticality: 'critical', phase: 0 } },
  { id: 't3', type: 'dc', label: 'West Data Center', x: 180, y: 340, meta: { name: 'West Data Center', role: 'DR site — Equinix SV5', status: 'active', owner: 'Robert Tanaka', notes: 'Disaster recovery', criticality: 'high', phase: 0 } },
  { id: 't4', type: 'firewall', label: 'Core FW Cluster', x: 440, y: 200, meta: { name: 'Core Firewall Cluster', role: 'PA-5260 HA pair', status: 'active', owner: 'Dr. Lisa Park', notes: 'Primary perimeter', criticality: 'critical', phase: 0 } },
  { id: 't5', type: 'cloud_aws', label: 'AWS us-east-1', x: 700, y: 130, meta: { name: 'AWS us-east-1', role: 'Primary cloud region', status: 'active', owner: 'David Kim', notes: 'Direct Connect 10G', criticality: 'critical', phase: 0 } },
  { id: 't6', type: 'cloud_azure', label: 'Azure East US', x: 700, y: 280, meta: { name: 'Azure East US', role: 'Secondary cloud', status: 'active', owner: 'David Kim', notes: 'ExpressRoute 5G', criticality: 'high', phase: 0 } },
  { id: 't7', type: 'branch', label: 'NA Branches (52)', x: 60, y: 460, meta: { name: 'NA Branch Offices', role: '52 sites — MPLS + Internet', status: 'active', owner: 'Robert Tanaka', notes: 'Mixed connectivity', criticality: 'high', phase: 0 } },
  { id: 't8', type: 'branch', label: 'EMEA Branches (24)', x: 280, y: 460, meta: { name: 'EMEA Branches', role: '24 sites', status: 'active', owner: 'Robert Tanaka', notes: 'London hub', criticality: 'high', phase: 0 } },
  { id: 't9', type: 'branch', label: 'APAC Branches (11)', x: 500, y: 460, meta: { name: 'APAC Branches', role: '11 sites', status: 'active', owner: 'Robert Tanaka', notes: 'Singapore hub', criticality: 'medium', phase: 0 } },
  { id: 't10', type: 'sdwan', label: 'SD-WAN Controller', x: 280, y: 330, meta: { name: 'Viptela vManage', role: 'SD-WAN orchestration', status: 'active', owner: 'Robert Tanaka', notes: 'Partial — 34 sites', criticality: 'high', phase: 0 } },
  { id: 't11', type: 'sase', label: 'Zscaler ZIA/ZPA', x: 560, y: 360, meta: { name: 'Zscaler', role: 'Cloud security — partial', status: 'review', owner: 'Dr. Lisa Park', notes: '34 sites enrolled', criticality: 'high', phase: 0 } },
  { id: 't12', type: 'firewall', label: 'Cisco ASA (Legacy)', x: 60, y: 330, meta: { name: 'Cisco ASA 5500-X', role: 'Legacy branch FW', status: 'at-risk', owner: 'Dr. Lisa Park', notes: '45 units — EoS Q3 2026!', criticality: 'critical', phase: 0 } },
  { id: 't13', type: 'mpls', label: 'AT&T MPLS Core', x: 160, y: 460, meta: { name: 'AT&T MPLS', role: 'Primary WAN underlay', status: 'decommission', owner: 'Aisha Patel', notes: '78 circuits', criticality: 'high', phase: 0 } },
  { id: 't14', type: 'observability', label: 'SolarWinds + PRTG', x: 720, y: 440, meta: { name: 'Legacy Monitoring', role: 'Fragmented monitoring', status: 'at-risk', owner: 'Maria Santos', notes: 'No cloud visibility', criticality: 'medium', phase: 0 } },
  { id: 't15', type: 'saas', label: 'Salesforce / M365', x: 840, y: 200, meta: { name: 'SaaS Platforms', role: 'Salesforce + M365', status: 'active', owner: 'David Kim', notes: 'Performance complaints', criticality: 'high', phase: 0 } },
];

const currentEdges: ArchEdge[] = [
  { from: 't1', to: 't4' }, { from: 't4', to: 't2' }, { from: 't4', to: 't5' },
  { from: 't4', to: 't6' }, { from: 't2', to: 't3' }, { from: 't7', to: 't13' },
  { from: 't8', to: 't13' }, { from: 't13', to: 't4' }, { from: 't10', to: 't4' },
  { from: 't7', to: 't10' }, { from: 't8', to: 't10' }, { from: 't9', to: 't11' },
  { from: 't11', to: 't5' }, { from: 't11', to: 't6' }, { from: 't5', to: 't15' },
  { from: 't6', to: 't15' }, { from: 't12', to: 't7' }, { from: 't14', to: 't4' },
];

export const TEMPLATES: Record<string, ArchTemplate> = {
  blank: { label: 'Blank Canvas', desc: 'Start from scratch', nodes: [], edges: [] },
  current: { label: 'Meridian Current-State', desc: 'Pre-loaded estate mapping', nodes: currentNodes, edges: currentEdges },
  future: {
    label: 'Target-State Template', desc: 'Cloud-first SASE architecture',
    nodes: [
      { id: 'f1', type: 'hq', label: 'NYC HQ (Modernized)', x: 420, y: 50, meta: { name: 'NYC HQ', role: 'SASE-enabled HQ', status: 'planned', owner: 'Robert Tanaka', notes: 'Direct-to-cloud', criticality: 'critical', phase: 2 } },
      { id: 'f2', type: 'sase', label: 'Global SASE Fabric', x: 420, y: 200, meta: { name: 'Zscaler ZT Exchange', role: 'Unified SASE', status: 'planned', owner: 'Dr. Lisa Park', notes: 'Replaces legacy FW', criticality: 'critical', phase: 1 } },
      { id: 'f3', type: 'sdwan', label: 'SD-WAN Fabric', x: 180, y: 340, meta: { name: 'SD-WAN Overlay', role: 'Universal underlay', status: 'planned', owner: 'Robert Tanaka', notes: 'All 187 sites', criticality: 'critical', phase: 2 } },
      { id: 'f4', type: 'cloud_aws', label: 'AWS Multi-Region', x: 660, y: 120, meta: { name: 'AWS Multi-Region', role: 'Primary cloud', status: 'planned', owner: 'David Kim', notes: 'NaaS interconnect', criticality: 'critical', phase: 2 } },
      { id: 'f5', type: 'cloud_azure', label: 'Azure Multi-Region', x: 660, y: 260, meta: { name: 'Azure', role: 'Secondary + M365', status: 'planned', owner: 'David Kim', notes: 'ExpressRoute', criticality: 'critical', phase: 2 } },
      { id: 'f6', type: 'cloud_gcp', label: 'GCP us-central', x: 660, y: 400, meta: { name: 'GCP Region', role: 'AI/ML workloads', status: 'planned', owner: 'David Kim', notes: 'Cloud Interconnect', criticality: 'high', phase: 3 } },
      { id: 'f7', type: 'branch', label: 'Standardized Branches', x: 60, y: 460, meta: { name: '187 Branches', role: 'Golden template', status: 'planned', owner: 'Robert Tanaka', notes: 'SD-WAN + SASE', criticality: 'high', phase: 2 } },
      { id: 'f8', type: 'observability', label: 'Full-Stack DEM', x: 420, y: 450, meta: { name: 'Unified Observability', role: 'DEM + NPM + AIOps', status: 'planned', owner: 'Maria Santos', notes: 'ThousandEyes + Datadog', criticality: 'high', phase: 2 } },
      { id: 'f9', type: 'ai_edge', label: 'Edge AI Nodes', x: 180, y: 460, meta: { name: 'Edge AI Compute', role: 'Distributed inference', status: 'planned', owner: 'David Kim', notes: 'Phase 3', criticality: 'medium', phase: 3 } },
      { id: 'f10', type: 'automation', label: 'NetOps Automation', x: 660, y: 460, meta: { name: 'Network-as-Code', role: 'CI/CD pipeline', status: 'planned', owner: 'Maria Santos', notes: 'Terraform + Ansible', criticality: 'high', phase: 2 } },
      { id: 'f11', type: 'ztna', label: 'ZTNA Universal', x: 230, y: 200, meta: { name: 'Zero Trust Access', role: 'Identity-first access', status: 'planned', owner: 'Dr. Lisa Park', notes: 'Replaces VPN', criticality: 'critical', phase: 1 } },
    ],
    edges: [
      { from: 'f1', to: 'f2' }, { from: 'f2', to: 'f4' }, { from: 'f2', to: 'f5' },
      { from: 'f2', to: 'f6' }, { from: 'f7', to: 'f3' }, { from: 'f3', to: 'f2' },
      { from: 'f11', to: 'f2' }, { from: 'f7', to: 'f9' }, { from: 'f8', to: 'f2' },
      { from: 'f8', to: 'f3' }, { from: 'f10', to: 'f3' }, { from: 'f10', to: 'f2' },
      { from: 'f1', to: 'f11' },
    ],
  },
};

/* ═══════════════════════════════════════════════════
   ROADMAP
   ═══════════════════════════════════════════════════ */
export const ROADMAP_TRACKS: RoadmapTrack[] = [
  { id: 'network', label: 'Network Fabric', color: '#3b82f6' },
  { id: 'security', label: 'Security & Zero Trust', color: '#fb7185' },
  { id: 'cloud', label: 'Cloud Connectivity', color: '#22d3ee' },
  { id: 'operations', label: 'Operations & AIOps', color: '#fbbf24' },
  { id: 'support', label: 'Support Model', color: '#a78bfa' },
  { id: 'governance', label: 'Governance & Policy', color: '#34d399' },
  { id: 'branch', label: 'Branch Rollout', color: '#fb923c' },
  { id: 'legacy', label: 'Legacy Retirement', color: '#64748b' },
  { id: 'observability', label: 'Observability Stack', color: '#eab308' },
  { id: 'automation', label: 'Automation Pipeline', color: '#a3e635' },
];

export const SEED_ROADMAP: RoadmapItem[] = [
  { track: 'network', phase: 0, label: 'SD-WAN PoC — 5 pilot branches', type: 'quickwin' },
  { track: 'network', phase: 1, label: 'Regional SD-WAN fabric (NA)', type: 'milestone' },
  { track: 'network', phase: 1, label: 'EMEA & APAC extension', type: 'milestone' },
  { track: 'network', phase: 2, label: 'Full mesh + DIA migration', type: 'milestone' },
  { track: 'security', phase: 0, label: 'SASE/SSE PoC (Zscaler)', type: 'quickwin' },
  { track: 'security', phase: 0, label: 'Zero trust blueprint', type: 'quickwin' },
  { track: 'security', phase: 1, label: 'ZT identity & device trust', type: 'milestone' },
  { track: 'security', phase: 2, label: 'Unified SASE + XDR', type: 'milestone' },
  { track: 'cloud', phase: 0, label: 'Cloud interconnect audit', type: 'quickwin' },
  { track: 'cloud', phase: 1, label: 'Multi-cloud NaaS fabric', type: 'milestone' },
  { track: 'cloud', phase: 2, label: 'Cloud-native net functions', type: 'milestone' },
  { track: 'operations', phase: 0, label: 'Runbook automation (top 20)', type: 'quickwin' },
  { track: 'operations', phase: 1, label: 'AIOps event correlation', type: 'milestone' },
  { track: 'operations', phase: 2, label: 'Self-healing automation', type: 'milestone' },
  { track: 'support', phase: 1, label: 'Managed services onboarding', type: 'milestone' },
  { track: 'support', phase: 2, label: 'Outcome-based SLA model', type: 'milestone' },
  { track: 'governance', phase: 0, label: 'Policy-as-code framework', type: 'quickwin' },
  { track: 'governance', phase: 1, label: 'Automated compliance', type: 'milestone' },
  { track: 'branch', phase: 1, label: 'Golden branch template', type: 'milestone' },
  { track: 'branch', phase: 2, label: '187-site standardization', type: 'milestone' },
  { track: 'legacy', phase: 0, label: 'Legacy circuit audit', type: 'quickwin' },
  { track: 'legacy', phase: 1, label: 'MPLS offload wave 1', type: 'milestone' },
  { track: 'legacy', phase: 2, label: 'Full legacy decommission', type: 'milestone' },
  { track: 'observability', phase: 0, label: 'Unified dashboard', type: 'quickwin' },
  { track: 'observability', phase: 1, label: 'Full-stack DEM + NPM', type: 'milestone' },
  { track: 'automation', phase: 1, label: 'Network-as-code CI/CD', type: 'milestone' },
  { track: 'automation', phase: 2, label: 'Intent-based orchestration', type: 'milestone' },
];

