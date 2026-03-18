/** Core data model for Network Transformation Studio */

export interface Customer {
  name: string;
  shortName: string;
  industry: string;
  revenue: string;
  employees: string;
  sites: number;
  countries: number;
  regions: string[];
  workshopDate: string;
  workshopId: string;
  workshopLead: string;
  workshopLeadTitle: string;
  stakeholders: Stakeholder[];
}

export interface Stakeholder {
  name: string;
  title: string;
  focus: string;
  avatar: string;
  tier: 'executive' | 'leader' | 'technical';
}

export interface MaturityDomain {
  key: string;
  label: string;
  short: string;
}

export interface MaturityScore {
  current: number;
  target: number;
}

export type MaturityMap = Record<string, MaturityScore>;

export interface PainItem {
  id: string;
  label: string;
  desc: string;
  icon: string;
  cat: string;
}

export type PainScores = Record<string, number>;

export interface PaletteItem {
  type: string;
  label: string;
  icon: string;
  cat: string;
  color: string;
  defaultMeta?: Partial<NodeMeta>;
}

export interface NodeMeta {
  name: string;
  role: string;
  status: string;
  owner: string;
  notes: string;
  criticality: string;
  phase: number;
}

export interface ArchNode {
  id: string;
  type: string;
  label: string;
  x: number;
  y: number;
  meta: NodeMeta;
}

export interface ArchEdge {
  from: string;
  to: string;
}

export interface ArchTemplate {
  label: string;
  desc: string;
  nodes: ArchNode[];
  edges: ArchEdge[];
}

export interface RoadmapTrack {
  id: string;
  label: string;
  color: string;
}

export interface RoadmapItem {
  track: string;
  phase: number;
  label: string;
  type: 'quickwin' | 'milestone';
}

export interface WorkshopNote {
  id: number;
  type: 'note' | 'assumption' | 'question' | 'decision';
  text: string;
}

export interface NavItem {
  id: number;
  label: string;
  short: string;
  icon: string;
  phase: number | null;
}
