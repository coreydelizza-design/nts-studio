import { create } from 'zustand';
import type { PainScores, MaturityMap, ArchNode, ArchEdge, WorkshopNote } from '../types';
import { INIT_PAIN_SCORES, INIT_MATURITY, TEMPLATES, EMPTY_META } from '../data/seed';

interface WorkshopState {
  // Navigation
  activeTab: number;
  setActiveTab: (tab: number) => void;

  // UI
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  copilotOpen: boolean;
  toggleCopilot: () => void;

  // Pain scores
  painScores: PainScores;
  setPainScore: (id: string, value: number) => void;

  // Maturity
  maturity: MaturityMap;
  setMaturityScore: (key: string, field: 'current' | 'target', value: number) => void;

  // Architecture canvas
  archNodes: ArchNode[];
  archEdges: ArchEdge[];
  setArchNodes: (nodes: ArchNode[]) => void;
  setArchEdges: (edges: ArchEdge[]) => void;
  loadTemplate: (key: string) => void;

  // Notes
  notes: WorkshopNote[];
  addNote: (type: WorkshopNote['type'], text: string) => void;
  removeNote: (id: number) => void;

  // Future State Vision (tab 5 → tab 6 data flow)
  visionPosture: string;
  visionSliders: Record<string, number>;
  setVisionPosture: (p: string) => void;
  setVisionSlider: (key: string, value: number) => void;
}

export const useWorkshopStore = create<WorkshopState>((set) => ({
  activeTab: 0,
  setActiveTab: (tab) => set({ activeTab: tab }),

  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  copilotOpen: false,
  toggleCopilot: () => set((s) => ({ copilotOpen: !s.copilotOpen })),

  painScores: { ...INIT_PAIN_SCORES },
  setPainScore: (id, value) => set((s) => ({ painScores: { ...s.painScores, [id]: value } })),

  maturity: { ...INIT_MATURITY },
  setMaturityScore: (key, field, value) =>
    set((s) => ({
      maturity: {
        ...s.maturity,
        [key]: { ...s.maturity[key], [field]: value },
      },
    })),

  archNodes: TEMPLATES.current.nodes.map((n) => ({ ...n, meta: { ...EMPTY_META, ...n.meta } })),
  archEdges: [...TEMPLATES.current.edges],
  setArchNodes: (nodes) => set({ archNodes: nodes }),
  setArchEdges: (edges) => set({ archEdges: edges }),
  loadTemplate: (key) => {
    const t = TEMPLATES[key];
    if (!t) return;
    set({
      archNodes: t.nodes.map((n) => ({ ...n, meta: { ...EMPTY_META, ...n.meta } })),
      archEdges: [...t.edges],
    });
  },

  notes: [
    { id: 1, type: 'assumption', text: 'All branches have minimum 100 Mbps broadband for SD-WAN underlay.' },
    { id: 2, type: 'question', text: 'Confirm Pinnacle Insurance sites can support Zscaler Client Connector.' },
    { id: 3, type: 'note', text: 'Robert confirmed: East DC lease expires Q2 2027 — factor into timeline.' },
    { id: 4, type: 'assumption', text: 'SASE PoC targets 5 NA branch sites (mix of urban and remote).' },
    { id: 5, type: 'question', text: 'Current state of identity federation across acquired entities?' },
  ],
  addNote: (type, text) =>
    set((s) => ({ notes: [...s.notes, { id: Date.now(), type, text }] })),
  removeNote: (id) =>
    set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),

  visionPosture: 'cloud_accel',
  visionSliders: { secModel: 7, netModel: 6, branchCtrl: 5, cloudAdj: 8, zeroTrust: 9, observ: 7, auto: 8, resil: 7, aiEdge: 6, supportModel: 7 },
  setVisionPosture: (p) => set({ visionPosture: p }),
  setVisionSlider: (key, value) => set((s) => ({ visionSliders: { ...s.visionSliders, [key]: value } })),
}));
