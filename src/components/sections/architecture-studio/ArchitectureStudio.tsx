import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useTheme } from '../../../theme/useTheme';
import { STATUS_COLORS, CRIT_COLORS, PHASE_COLORS, PHASE_LABELS, CAT_COLORS } from '../../../theme/tokens';
import { PALETTE, PALETTE_CATS, TEMPLATES, EMPTY_META, palItem, MATURITY_DOMAINS, PAIN_ITEMS } from '../../../data/seed';
import type { ArchNode, WorkshopNote } from '../../../types';
import { Chip, Mono } from '../../shared/Primitives';
import { useWorkshopStore } from '../../../store/useWorkshopStore';

/* ═══════════════════════════════════════════════════════════
   1. NODE → UPSTREAM DATA MAPPING
   Maps TEMPLATES.current node IDs to pain points + maturity
   domains so risk badges and gap indicators flow from tabs 3–4.
   ═══════════════════════════════════════════════════════════ */
const NODE_RISK: Record<string, { painIds: string[]; matKeys: string[] }> = {
  t1:  { painIds: ['outage'],                          matKeys: ['branchStd'] },             // NYC HQ
  t2:  { painIds: ['outage', 'mttr'],                  matKeys: ['resilience'] },             // East DC
  t3:  { painIds: ['mttr'],                            matKeys: ['resilience'] },             // West DC
  t4:  { painIds: ['secFrag'],                         matKeys: ['secArch'] },                // Core FW
  t5:  { painIds: ['cloudPerf'],                       matKeys: ['cloudConn'] },              // AWS
  t6:  { painIds: ['cloudPerf'],                       matKeys: ['cloudConn'] },              // Azure
  t7:  { painIds: ['carrierSprawl', 'deployDelay', 'manualOps'], matKeys: ['branchStd'] },    // NA Branches
  t8:  { painIds: ['carrierSprawl', 'deployDelay'],    matKeys: ['branchStd'] },              // EMEA Branches
  t9:  { painIds: ['deployDelay', 'visibility'],       matKeys: ['branchStd'] },              // APAC Branches
  t10: { painIds: ['manualOps'],                       matKeys: ['netArch', 'automation'] },  // SD-WAN partial
  t11: { painIds: ['secFrag', 'visibility'],           matKeys: ['secArch'] },                // Zscaler
  t12: { painIds: ['secFrag', 'outage'],               matKeys: ['secArch'] },                // Cisco ASA
  t13: { painIds: ['carrierSprawl', 'vendorPerf'],     matKeys: ['netArch'] },                // AT&T MPLS
  t14: { painIds: ['visibility', 'manualOps'],         matKeys: ['observability'] },          // SolarWinds
  t15: { painIds: ['cloudPerf'],                       matKeys: ['cloudConn'] },              // SaaS
};

/* ═══════════════════════════════════════════════════════════
   2. GTT FUTURE-STATE OVERLAY
   Each component appears when its vision slider threshold is met.
   ═══════════════════════════════════════════════════════════ */
interface GttOverlay { id: string; label: string; icon: string; x: number; y: number; detail: string; sliderKey: string; threshold: number; replaces: string[]; }

const GTT_NODES: GttOverlay[] = [
  { id: 'gtt_sdwan',   label: 'GTT SD-WAN Fabric',    icon: '📡', x: 280, y: 335, detail: 'Managed overlay — all 187 sites',    sliderKey: 'netModel',    threshold: 5, replaces: ['t10', 't13'] },
  { id: 'gtt_sase',    label: 'GTT SASE / SSE',       icon: '🔒', x: 440, y: 130, detail: 'SWG + CASB + ZTNA + FWaaS',         sliderKey: 'zeroTrust',   threshold: 6, replaces: ['t11', 't12'] },
  { id: 'gtt_backbone', label: 'GTT Tier-1 Backbone', icon: '🌐', x: 440, y: 270, detail: 'AS3257 — global SLA-grade underlay', sliderKey: 'resil',       threshold: 6, replaces: [] },
  { id: 'gtt_cloud',   label: 'GTT Cloud On-Ramp',    icon: '☁',  x: 700, y: 50,  detail: 'Direct Connect + ExpressRoute',     sliderKey: 'cloudAdj',    threshold: 6, replaces: [] },
  { id: 'gtt_envision', label: 'GTT Envision (DEM)',   icon: '📊', x: 720, y: 370, detail: 'Full-stack observability',           sliderKey: 'observ',      threshold: 6, replaces: ['t14'] },
  { id: 'gtt_noc',     label: 'GTT Managed NOC',      icon: '👁', x: 720, y: 460, detail: '24/7 follow-the-sun operations',    sliderKey: 'supportModel', threshold: 6, replaces: [] },
  { id: 'gtt_orch',    label: 'GTT Orchestrator',      icon: '⚙',  x: 840, y: 340, detail: 'Automation + NetOps CI/CD',         sliderKey: 'auto',        threshold: 7, replaces: [] },
  { id: 'gtt_edge',    label: 'GTT Edge Compute',      icon: '⚡', x: 160, y: 460, detail: 'Distributed compute at branch',     sliderKey: 'aiEdge',      threshold: 5, replaces: [] },
];

const GTT_EDGES: { from: string; to: string; need: string }[] = [
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
   3. USE CASE REFERENCE DATA (compact, inline)
   ═══════════════════════════════════════════════════════════ */
const UC_REF = [
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

/* ═══════════════════════════════════════════════════════════
   4. MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */
type RightTab = 'inspector' | 'notes' | 'dashboard' | 'ucref';
type ViewMode = 'current' | 'future' | 'overlay';

const ArchitectureStudio: React.FC = () => {
  const { t, isDark } = useTheme();
  const {
    archNodes: nodes, archEdges: edges, setArchNodes: setNodes, setArchEdges: setEdges, loadTemplate,
    notes, addNote, removeNote, painScores, maturity, visionSliders, visionPosture,
  } = useWorkshopStore();

  // Canvas state
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragging, setDragging] = useState<{ id: string; ox: number; oy: number } | null>(null);
  const [panning, setPanning] = useState<{ sx: number; sy: number; sp: { x: number; y: number } } | null>(null);
  const [connectFrom, setConnectFrom] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // UI state
  const [viewMode, setViewMode] = useState<ViewMode>('overlay');
  const [rightTab, setRightTab] = useState<RightTab>('dashboard');
  const [palSearch, setPalSearch] = useState('');
  const [palCat, setPalCat] = useState('All');
  const [showLayers, setShowLayers] = useState<Record<string, boolean>>({ Sites: true, Network: true, Security: true, Cloud: true, 'Edge / Compute': true, Operations: true });
  const [newNote, setNewNote] = useState('');
  const [newNoteType, setNewNoteType] = useState<WorkshopNote['type']>('note');
  const [showTemplates, setShowTemplates] = useState(false);
  const [ucExpanded, setUcExpanded] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const nc = useRef(100);

  const selectedNode = selectedId ? nodes.find(n => n.id === selectedId) : null;
  const nd = (id: string) => nodes.find(n => n.id === id);

  // ── Derived: upstream data ──
  const activeGtt = useMemo(() => {
    const ids = new Set<string>();
    GTT_NODES.forEach(g => { if ((visionSliders[g.sliderKey] || 0) >= g.threshold) ids.add(g.id); });
    return ids;
  }, [visionSliders]);
  const activeGttNodes = useMemo(() => GTT_NODES.filter(g => activeGtt.has(g.id)), [activeGtt]);
  const supersededIds = useMemo(() => { const s = new Set<string>(); activeGttNodes.forEach(g => g.replaces.forEach(r => s.add(r))); return s; }, [activeGttNodes]);
  const topPains = useMemo(() => [...PAIN_ITEMS].map(p => ({ ...p, score: painScores[p.id] || 0 })).sort((a, b) => b.score - a.score).filter(p => p.score >= 6), [painScores]);
  const bigGaps = useMemo(() => MATURITY_DOMAINS.map(d => ({ ...d, gap: (maturity[d.key]?.target || 0) - (maturity[d.key]?.current || 0) })).sort((a, b) => b.gap - a.gap).slice(0, 5), [maturity]);

  const nodeRisk = useCallback((id: string) => {
    const r = NODE_RISK[id]; if (!r) return 0;
    return Math.max(0, ...r.painIds.map(pid => painScores[pid] || 0));
  }, [painScores]);
  const nodeGap = useCallback((id: string) => {
    const r = NODE_RISK[id]; if (!r) return 0;
    return Math.max(0, ...r.matKeys.map(k => { const m = maturity[k]; return m ? m.target - m.current : 0; }));
  }, [maturity]);

  // ── Palette filter ──
  const filteredPal = useMemo(() => {
    let items = PALETTE;
    if (palCat !== 'All') items = items.filter(p => p.cat === palCat);
    if (palSearch) { const q = palSearch.toLowerCase(); items = items.filter(p => p.label.toLowerCase().includes(q) || p.cat.toLowerCase().includes(q)); }
    return items;
  }, [palCat, palSearch]);
  const visibleNodes = useMemo(() => nodes.filter(n => showLayers[palItem(n.type).cat] !== false), [nodes, showLayers]);

  // ── Canvas interactions ──
  const handleWheel = useCallback((e: WheelEvent) => { e.preventDefault(); setZoom(z => Math.max(0.25, Math.min(3, z + (e.deltaY > 0 ? -0.08 : 0.08)))); }, []);
  useEffect(() => { const el = canvasRef.current; if (!el) return; el.addEventListener('wheel', handleWheel, { passive: false }); return () => el.removeEventListener('wheel', handleWheel); }, [handleWheel]);

  const handleCanvasDown = useCallback((e: React.MouseEvent) => {
    if (e.target !== canvasRef.current && !(e.target as HTMLElement).closest('[data-bg]')) return;
    setPanning({ sx: e.clientX, sy: e.clientY, sp: { ...pan } });
    setSelectedId(null); if (connectFrom) setConnectFrom(null);
  }, [pan, connectFrom]);
  const handleCanvasMove = useCallback((e: React.MouseEvent) => {
    if (panning) { setPan({ x: panning.sp.x + e.clientX - panning.sx, y: panning.sp.y + e.clientY - panning.sy }); return; }
    if (!dragging || !canvasRef.current) return;
    const r = canvasRef.current.getBoundingClientRect();
    setNodes(nodes.map(n => n.id === dragging.id ? { ...n, x: Math.round((e.clientX - r.left - pan.x) / zoom - dragging.ox), y: Math.round((e.clientY - r.top - pan.y) / zoom - dragging.oy) } : n));
  }, [dragging, panning, zoom, pan, nodes, setNodes]);
  const handleCanvasUp = useCallback(() => { setDragging(null); setPanning(null); }, []);

  const handleNodeDown = (e: React.MouseEvent, node: ArchNode) => {
    e.stopPropagation();
    if (connectFrom) {
      if (connectFrom !== node.id && !edges.some(ed => (ed.from === connectFrom && ed.to === node.id) || (ed.from === node.id && ed.to === connectFrom)))
        setEdges([...edges, { from: connectFrom, to: node.id }]);
      setConnectFrom(null); return;
    }
    const r = canvasRef.current!.getBoundingClientRect();
    setDragging({ id: node.id, ox: (e.clientX - r.left - pan.x) / zoom - node.x, oy: (e.clientY - r.top - pan.y) / zoom - node.y });
    setSelectedId(node.id); setRightTab('inspector');
  };

  const addNode = (type: string) => {
    const p = palItem(type); const id = 'n' + (++nc.current);
    setNodes([...nodes, { id, type, label: p.label, x: Math.round((-pan.x + 400) / zoom + (Math.random() - 0.5) * 120), y: Math.round((-pan.y + 250) / zoom + (Math.random() - 0.5) * 80), meta: { ...EMPTY_META, ...p.defaultMeta, name: p.label } }]);
  };
  const removeNode = (id: string) => { setNodes(nodes.filter(n => n.id !== id)); setEdges(edges.filter(e => e.from !== id && e.to !== id)); if (selectedId === id) setSelectedId(null); };
  const updateMeta = (key: string, val: string | number) => {
    if (!selectedId) return;
    setNodes(nodes.map(n => n.id === selectedId ? { ...n, meta: { ...n.meta, [key]: val }, ...(key === 'name' ? { label: val as string } : {}) } : n));
  };
  const doLoadTmpl = (key: string) => { loadTemplate(key); setPan({ x: 0, y: 0 }); setZoom(1); setSelectedId(null); setShowTemplates(false); };

  const drawEdge = (fromId: string, toId: string) => {
    // Check both store nodes and GTT overlay nodes
    const f = nd(fromId) || (() => { const g = GTT_NODES.find(n => n.id === fromId); return g ? { x: g.x, y: g.y } : null; })();
    const to2 = nd(toId) || (() => { const g = GTT_NODES.find(n => n.id === toId); return g ? { x: g.x, y: g.y } : null; })();
    if (!f || !to2) return '';
    const W = 110, H = 72, x1 = f.x + W / 2, y1 = f.y + H / 2, x2 = to2.x + W / 2, y2 = to2.y + H / 2, dx = x2 - x1;
    return `M ${x1} ${y1} C ${x1 + dx * 0.35} ${y1}, ${x2 - dx * 0.35} ${y2}, ${x2} ${y2}`;
  };

  const noteColors: Record<string, string> = { note: t.accent, assumption: t.amber, question: t.rose, decision: t.emerald };
  const gridDot = isDark ? 'rgba(40,55,85,0.25)' : 'rgba(148,163,184,0.2)';
  const showCurrent = viewMode !== 'future';
  const showFuture = viewMode !== 'current';
  const selGtt = selectedId ? GTT_NODES.find(g => g.id === selectedId) : null;

  /* ═══════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════ */
  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>

      {/* ═══ LEFT: PALETTE + UC REFERENCE ═══ */}
      <div style={{ width: 210, background: t.bgPanel, borderRight: `1px solid ${t.border}`, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        {/* Header */}
        <div style={{ padding: '14px 12px 10px', borderBottom: `1px solid ${t.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{ width: 26, height: 26, borderRadius: 7, background: `linear-gradient(135deg, ${t.emerald}, #059669)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: t.fontD, fontSize: 8, fontWeight: 900, color: '#fff', letterSpacing: 0.3 }}>GTT</div>
            <div>
              <div style={{ fontFamily: t.fontD, fontSize: 12, fontWeight: 800, color: t.text }}>Architecture</div>
              <Mono color={t.emerald} size={7}>ENVIRONMENT STUDIO</Mono>
            </div>
          </div>
          <input value={palSearch} onChange={e => setPalSearch(e.target.value)} placeholder="Search components..." style={{ width: '100%', background: t.bgInput, border: `1px solid ${t.border}`, borderRadius: 6, color: t.text, fontFamily: t.fontB, fontSize: 11, padding: '6px 10px' }} />
        </div>

        {/* Category filter */}
        <div style={{ padding: '6px 8px 2px', display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {['All', ...PALETTE_CATS].map(c => (
            <button key={c} onClick={() => setPalCat(c)} style={{ padding: '3px 7px', borderRadius: 4, fontFamily: t.fontM, fontSize: 8, background: palCat === c ? (c === 'All' ? t.accent : CAT_COLORS[c] || t.accent) + '20' : 'transparent', border: `1px solid ${palCat === c ? (c === 'All' ? t.accent : CAT_COLORS[c] || t.accent) + '40' : 'transparent'}`, color: palCat === c ? (c === 'All' ? t.accent : CAT_COLORS[c]) : t.textDim }}>{c === 'Edge / Compute' ? 'Edge' : c}</button>
          ))}
        </div>

        {/* Palette */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 8px 8px' }}>
          {(palCat === 'All' ? PALETTE_CATS : [palCat]).map(cat => {
            const items = filteredPal.filter(p => p.cat === cat);
            if (!items.length) return null;
            return (<div key={cat} style={{ marginBottom: 8 }}><Mono color={CAT_COLORS[cat]} size={8}>{cat}</Mono>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 3 }}>
                {items.map(p => (<div key={p.type} onClick={() => addNode(p.type)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '6px 8px', borderRadius: 5, cursor: 'pointer', background: t.bgGlass, border: `1px solid ${t.borderSubtle}` }}>
                  <span style={{ fontSize: 14, width: 18, textAlign: 'center' }}>{p.icon}</span>
                  <span style={{ fontFamily: t.fontB, fontSize: 11, color: t.textSoft, flex: 1 }}>{p.label}</span>
                  <span style={{ fontFamily: t.fontM, fontSize: 8, color: t.textDim }}>+</span>
                </div>))}
              </div>
            </div>);
          })}
        </div>

        {/* Templates */}
        <div style={{ padding: '6px 8px', borderTop: `1px solid ${t.border}` }}>
          <button onClick={() => setShowTemplates(!showTemplates)} style={{ width: '100%', padding: '7px', borderRadius: 6, border: `1px solid ${t.border}`, background: showTemplates ? t.accent + '12' : t.bgInput, color: showTemplates ? t.accent : t.textMuted, fontFamily: t.fontD, fontSize: 11, fontWeight: 600 }}>{showTemplates ? '▾ Load Template' : '▸ Load Template'}</button>
          {showTemplates && <div style={{ marginTop: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {Object.entries(TEMPLATES).map(([k, tmpl]) => (<button key={k} onClick={() => doLoadTmpl(k)} style={{ padding: '6px 8px', borderRadius: 5, border: `1px solid ${t.borderSubtle}`, background: t.bgGlass, color: t.text, textAlign: 'left', fontFamily: t.fontB, fontSize: 10 }}><div style={{ fontWeight: 600 }}>{tmpl.label}</div><div style={{ fontSize: 9, color: t.textDim }}>{tmpl.desc}</div></button>))}
          </div>}
        </div>

        {/* UC Reference */}
        <div style={{ padding: '6px 8px 8px', borderTop: `1px solid ${t.border}`, maxHeight: 200, overflowY: 'auto' }}>
          <Mono size={8}>USE CASE REFERENCE</Mono>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 5 }}>
            {UC_REF.map(uc => (
              <button key={uc.id} onClick={() => { setUcExpanded(ucExpanded === uc.id ? null : uc.id); setRightTab('ucref'); }}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 8px', borderRadius: 5, textAlign: 'left', width: '100%',
                  border: `1px solid ${ucExpanded === uc.id ? uc.color + '50' : t.borderSubtle}`,
                  background: ucExpanded === uc.id ? uc.color + '10' : 'transparent',
                  color: ucExpanded === uc.id ? uc.color : t.textMuted, fontFamily: t.fontD, fontSize: 10, fontWeight: 600 }}>
                <span style={{ fontSize: 13 }}>{uc.icon}</span>{uc.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ CENTER: TOOLBAR + CANVAS ═══ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Toolbar */}
        <div style={{ height: 44, background: t.bgPanel, borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 14px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* View mode */}
            <div style={{ display: 'flex', background: t.bgInput, borderRadius: 6, border: `1px solid ${t.border}`, overflow: 'hidden' }}>
              {([['current', '● Current', t.amber], ['overlay', '◆ Overlay', t.accent], ['future', '★ GTT', t.emerald]] as const).map(([k, label, c]) => (
                <button key={k} onClick={() => setViewMode(k)} style={{ padding: '5px 12px', border: 'none', fontFamily: t.fontD, fontSize: 10, fontWeight: 600, background: viewMode === k ? c + '20' : 'transparent', color: viewMode === k ? c : t.textDim, borderRight: k !== 'future' ? `1px solid ${t.border}` : 'none' }}>{label}</button>
              ))}
            </div>
            <button onClick={() => setConnectFrom(connectFrom ? null : '__ready')} style={{ padding: '5px 12px', borderRadius: 6, fontFamily: t.fontD, fontSize: 10, fontWeight: 600, background: connectFrom ? t.cyan + '20' : 'transparent', border: `1px solid ${connectFrom ? t.cyan + '50' : t.border}`, color: connectFrom ? t.cyan : t.textMuted }}>{connectFrom ? '● Click nodes...' : '⊕ Connect'}</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Mono size={9}>{visibleNodes.length} nodes · {edges.length} edges</Mono>
            {showFuture && <Chip color={t.emerald} small>{activeGtt.size} GTT</Chip>}
            <Mono size={9}>{Math.round(zoom * 100)}%</Mono>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {PALETTE_CATS.map(cat => (<button key={cat} onClick={() => setShowLayers(p => ({ ...p, [cat]: !p[cat] }))} title={cat} style={{ width: 22, height: 22, borderRadius: 4, border: `1px solid ${showLayers[cat] ? (CAT_COLORS[cat] || t.accent) + '50' : t.borderSubtle}`, background: showLayers[cat] ? (CAT_COLORS[cat] || t.accent) + '15' : 'transparent', fontSize: 9, color: showLayers[cat] ? CAT_COLORS[cat] : t.textDim, fontFamily: t.fontM, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{cat[0]}</button>))}
            <div style={{ width: 1, height: 18, background: t.border, margin: '0 2px' }} />
            <button onClick={() => setZoom(z => Math.min(3, z + 0.2))} style={{ width: 24, height: 24, borderRadius: 5, border: `1px solid ${t.border}`, background: t.bgInput, color: t.textMuted, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
            <button onClick={() => setZoom(z => Math.max(0.25, z - 0.2))} style={{ width: 24, height: 24, borderRadius: 5, border: `1px solid ${t.border}`, background: t.bgInput, color: t.textMuted, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
            <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} style={{ padding: '3px 8px', borderRadius: 5, border: `1px solid ${t.border}`, background: t.bgInput, color: t.textMuted, fontFamily: t.fontM, fontSize: 8 }}>FIT</button>
          </div>
        </div>

        {/* Canvas */}
        <div ref={canvasRef} onMouseDown={handleCanvasDown} onMouseMove={handleCanvasMove} onMouseUp={handleCanvasUp} onMouseLeave={handleCanvasUp}
          style={{ flex: 1, position: 'relative', overflow: 'hidden', cursor: panning ? 'grabbing' : connectFrom ? 'crosshair' : 'grab', background: t.bgCanvas }}>
          <div data-bg="true" style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(circle, ${gridDot} 1px, transparent 1px)`, backgroundSize: `${24 * zoom}px ${24 * zoom}px`, backgroundPosition: `${pan.x % (24 * zoom)}px ${pan.y % (24 * zoom)}px`, pointerEvents: 'none' }} />
          <div data-bg="true" style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 40% 30%, ${viewMode === 'future' ? t.emerald : t.amber}03, transparent 60%)`, pointerEvents: 'none' }} />

          <div style={{ position: 'absolute', left: 0, top: 0, transformOrigin: '0 0', transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}>
            {/* ── SVG edges ── */}
            <svg style={{ position: 'absolute', top: -2000, left: -2000, width: 6000, height: 6000, pointerEvents: 'none', overflow: 'visible' }}>
              <defs>
                <linearGradient id="egC" x1="0%" y1="0%" x2="100%"><stop offset="0%" stopColor={t.amber} stopOpacity="0.5" /><stop offset="100%" stopColor={t.orange} stopOpacity="0.25" /></linearGradient>
                <linearGradient id="egG" x1="0%" y1="0%" x2="100%"><stop offset="0%" stopColor="#34d399" stopOpacity="0.6" /><stop offset="100%" stopColor="#22d3ee" stopOpacity="0.3" /></linearGradient>
                <filter id="eGl"><feGaussianBlur stdDeviation="2" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
              </defs>
              {/* Current edges (from store) */}
              {showCurrent && edges.map((e, i) => {
                const d = drawEdge(e.from, e.to); if (!d) return null;
                const dimmed = viewMode === 'overlay' && (supersededIds.has(e.from) || supersededIds.has(e.to));
                return <path key={`c${i}`} d={d} stroke="url(#egC)" strokeWidth={1.8} fill="none" filter="url(#eGl)" opacity={dimmed ? 0.15 : 0.6} />;
              })}
              {/* GTT edges */}
              {showFuture && GTT_EDGES.map((e, i) => {
                if (!activeGtt.has(e.need)) return null;
                const d = drawEdge(e.from, e.to); if (!d) return null;
                return <path key={`g${i}`} d={d} stroke="url(#egG)" strokeWidth={2.2} fill="none" filter="url(#eGl)" />;
              })}
            </svg>

            {/* ── Current nodes (from store) ── */}
            {showCurrent && visibleNodes.map(node => {
              const p = palItem(node.type); const sel = selectedId === node.id; const m = node.meta;
              const cc = CRIT_COLORS[m.criticality] || t.slate; const sc = STATUS_COLORS[m.status] || t.slate; const pc = PHASE_COLORS[m.phase] || 'transparent';
              const risk = nodeRisk(node.id); const gap = nodeGap(node.id);
              const dimmed = viewMode === 'overlay' && supersededIds.has(node.id);
              return (
                <div key={node.id} className="canvas-node" onMouseDown={e => handleNodeDown(e, node)}
                  style={{ position: 'absolute', left: node.x, top: node.y, width: 110, userSelect: 'none', zIndex: sel ? 50 : 10, borderRadius: 10, background: sel ? p.color + '15' : t.bgCard, border: `1.5px solid ${sel ? p.color : p.color + '35'}`, backdropFilter: 'blur(12px)', boxShadow: sel ? `0 0 24px ${p.color}20, 0 4px 20px rgba(0,0,0,${isDark ? '0.4' : '0.1'})` : `0 2px 12px rgba(0,0,0,${isDark ? '0.35' : '0.08'})`, cursor: connectFrom ? 'crosshair' : 'grab', overflow: 'hidden', opacity: dimmed ? 0.3 : 1, transition: 'opacity 0.3s' }}>
                  <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${p.color}${sel ? 'aa' : '50'}, transparent)` }} />
                  {/* Risk badge */}
                  {risk >= 5 && <div style={{ position: 'absolute', top: 4, right: 5, width: 16, height: 16, borderRadius: 4, background: (risk >= 8 ? t.rose : t.amber) + '25', border: `1px solid ${risk >= 8 ? t.rose : t.amber}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: t.fontM, fontSize: 7, fontWeight: 700, color: risk >= 8 ? t.rose : t.amber }}>{risk}</div>}
                  {/* Maturity gap badge */}
                  {gap >= 2 && <div style={{ position: 'absolute', top: 4, left: 5, fontFamily: t.fontM, fontSize: 6, color: t.amber, background: t.amber + '15', padding: '1px 4px', borderRadius: 3, border: `1px solid ${t.amber}30` }}>Δ{gap}</div>}
                  {/* Phase tag */}
                  {m.phase > 0 && !risk && <div style={{ position: 'absolute', top: 5, left: 6 }}><Chip color={pc} small>P{m.phase}</Chip></div>}
                  <div style={{ padding: '8px 8px 6px', textAlign: 'center' }}>
                    <div style={{ fontSize: 26, lineHeight: 1, filter: sel ? `drop-shadow(0 0 8px ${p.color}50)` : 'none', marginTop: 2 }}>{p.icon}</div>
                    <div style={{ fontFamily: t.fontD, fontSize: 10, fontWeight: 600, color: t.text, marginTop: 5, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', padding: '0 2px' }}>{node.label}</div>
                    <div style={{ fontFamily: t.fontM, fontSize: 7, color: p.color, marginTop: 2, letterSpacing: 0.8, opacity: 0.8 }}>{p.cat.toUpperCase()}</div>
                  </div>
                  <div style={{ height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, background: sc + '10', borderTop: `1px solid ${t.borderSubtle}` }}>
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: sc }} />
                    <span style={{ fontFamily: t.fontM, fontSize: 7, color: sc, letterSpacing: 0.8, fontWeight: 600, textTransform: 'uppercase' }}>{m.status}</span>
                  </div>
                  {dimmed && <div style={{ position: 'absolute', inset: 0, background: t.bgCanvas + '80', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontFamily: t.fontM, fontSize: 7, color: t.emerald, letterSpacing: 1 }}>GTT ▸</span>
                  </div>}
                  {connectFrom && connectFrom !== '__ready' && connectFrom !== node.id && <div style={{ position: 'absolute', inset: -3, borderRadius: 12, border: `2px dashed ${t.cyan}70`, pointerEvents: 'none' }} />}
                </div>
              );
            })}

            {/* ── GTT overlay nodes ── */}
            {showFuture && activeGttNodes.map(gn => {
              const sel = selectedId === gn.id;
              return (
                <div key={gn.id} onClick={() => { setSelectedId(gn.id); setRightTab('inspector'); }}
                  style={{ position: 'absolute', left: gn.x, top: gn.y, width: 110, borderRadius: 10, overflow: 'hidden', userSelect: 'none', cursor: 'pointer', zIndex: sel ? 50 : 20, background: sel ? '#34d39918' : isDark ? 'rgba(6,40,30,0.85)' : 'rgba(236,253,245,0.9)', border: `1.5px solid ${sel ? '#34d399' : '#34d39950'}`, backdropFilter: 'blur(10px)', boxShadow: sel ? '0 0 24px rgba(52,211,153,0.2)' : `0 2px 12px rgba(0,0,0,${isDark ? '0.3' : '0.07'}), 0 0 8px rgba(52,211,153,0.06)` }}>
                  <div style={{ height: 2, background: 'linear-gradient(90deg, transparent, #34d399aa, transparent)' }} />
                  <div style={{ position: 'absolute', top: 4, right: 5 }}><Chip color="#34d399" small>GTT</Chip></div>
                  <div style={{ padding: '8px 8px 6px', textAlign: 'center' }}>
                    <div style={{ fontSize: 26, lineHeight: 1, filter: sel ? 'drop-shadow(0 0 6px rgba(52,211,153,0.4))' : 'none', marginTop: 2 }}>{gn.icon}</div>
                    <div style={{ fontFamily: t.fontD, fontSize: 10, fontWeight: 600, color: t.text, marginTop: 5, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{gn.label}</div>
                  </div>
                  <div style={{ height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#34d39910', borderTop: `1px solid ${t.borderSubtle}` }}>
                    <span style={{ fontFamily: t.fontM, fontSize: 7, color: '#34d399', letterSpacing: 0.8, fontWeight: 600 }}>PROPOSED</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* View badge */}
          <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', alignItems: 'center', gap: 8, padding: '5px 12px', borderRadius: 7, background: t.bgPanel, border: `1px solid ${t.border}`, backdropFilter: 'blur(8px)' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: viewMode === 'current' ? t.amber : viewMode === 'future' ? t.emerald : t.accent }} />
            <span style={{ fontFamily: t.fontD, fontSize: 11, fontWeight: 700, color: viewMode === 'current' ? t.amber : viewMode === 'future' ? t.emerald : t.accent }}>{viewMode === 'current' ? 'Current State' : viewMode === 'future' ? 'GTT Future State' : 'Overlay'}</span>
            {supersededIds.size > 0 && viewMode === 'overlay' && <Chip color={t.amber} small>{supersededIds.size} replaced</Chip>}
          </div>
          {/* Minimap */}
          <div style={{ position: 'absolute', bottom: 10, left: 10, width: 130, height: 80, borderRadius: 7, background: t.bgPanel + 'ee', border: `1px solid ${t.border}`, overflow: 'hidden' }}>
            <svg width="130" height="80" viewBox="-100 -50 1100 700">
              {visibleNodes.map(n => <rect key={n.id} x={n.x} y={n.y} width={10} height={7} rx={2} fill={palItem(n.type).color} opacity={selectedId === n.id ? 1 : 0.4} />)}
              {showFuture && activeGttNodes.map(g => <rect key={g.id} x={g.x} y={g.y} width={10} height={7} rx={2} fill="#34d399" opacity={0.6} />)}
              <rect x={-pan.x / zoom} y={-pan.y / zoom} width={800 / zoom} height={500 / zoom} fill="none" stroke={t.accent} strokeWidth={3} rx={4} opacity={0.3} />
            </svg>
          </div>
        </div>
      </div>

      {/* ═══ RIGHT: INSPECTOR / NOTES / DASHBOARD / UC REF ═══ */}
      <div style={{ width: 260, background: t.bgPanel, borderLeft: `1px solid ${t.border}`, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ display: 'flex', borderBottom: `1px solid ${t.border}` }}>
          {([{ key: 'inspector' as RightTab, label: '✦ Inspect' }, { key: 'notes' as RightTab, label: `📝 Notes (${notes.length})` }, { key: 'dashboard' as RightTab, label: '📊 Data' }, { key: 'ucref' as RightTab, label: '📋 Ref' }]).map(tab => (
            <button key={tab.key} onClick={() => setRightTab(tab.key)} style={{ flex: 1, padding: '10px 4px', border: 'none', background: rightTab === tab.key ? t.accent + '10' : 'transparent', color: rightTab === tab.key ? t.accent : t.textDim, fontFamily: t.fontD, fontSize: 9, fontWeight: 600, borderBottom: rightTab === tab.key ? `2px solid ${t.accent}` : '2px solid transparent' }}>{tab.label}</button>
          ))}
        </div>

        {/* ── INSPECTOR ── */}
        {rightTab === 'inspector' && (
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {selGtt ? (
              /* GTT node detail */
              <div className="animate-fade-in" style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ textAlign: 'center', padding: '14px 10px', background: '#34d39908', borderRadius: 9, border: '1px solid #34d39920' }}>
                  <span style={{ fontSize: 34, filter: 'drop-shadow(0 0 8px rgba(52,211,153,0.3))' }}>{selGtt.icon}</span>
                  <div style={{ fontFamily: t.fontD, fontSize: 13, fontWeight: 700, color: '#34d399', marginTop: 6 }}>{selGtt.label}</div>
                  <Chip color="#34d399" small>GTT SOLUTION</Chip>
                </div>
                <div style={{ padding: '8px 10px', borderRadius: 7, background: t.bgGlass, border: `1px solid ${t.borderSubtle}` }}>
                  <Mono size={8}>DETAIL</Mono>
                  <div style={{ fontFamily: t.fontB, fontSize: 12, color: t.textSoft, marginTop: 4, lineHeight: 1.5 }}>{selGtt.detail}</div>
                </div>
                <div style={{ padding: '8px 10px', borderRadius: 7, background: t.bgGlass, border: `1px solid ${t.borderSubtle}` }}>
                  <Mono size={8}>ACTIVATION</Mono>
                  <div style={{ fontFamily: t.fontB, fontSize: 11, color: t.textSoft, marginTop: 4 }}>Slider: <strong style={{ color: t.accent }}>{selGtt.sliderKey}</strong> = {visionSliders[selGtt.sliderKey]}/{selGtt.threshold} threshold</div>
                  <div style={{ marginTop: 6, height: 4, background: t.bgHover, borderRadius: 2 }}><div style={{ height: '100%', width: `${Math.min((visionSliders[selGtt.sliderKey] || 0) / 10 * 100, 100)}%`, background: '#34d399', borderRadius: 2 }} /></div>
                </div>
                {selGtt.replaces.length > 0 && (
                  <div style={{ padding: '8px 10px', borderRadius: 7, background: t.amber + '06', border: `1px solid ${t.amber}15` }}>
                    <Mono size={8} color={t.amber}>REPLACES</Mono>
                    {selGtt.replaces.map(id => { const cn = nd(id); return cn ? <div key={id} style={{ fontFamily: t.fontB, fontSize: 10, color: t.textSoft, marginTop: 3 }}>{cn.label}</div> : null; })}
                  </div>
                )}
              </div>
            ) : !selectedNode ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: 24, textAlign: 'center' }}>
                <div style={{ fontSize: 32, opacity: 0.15, marginBottom: 10 }}>✦</div>
                <div style={{ fontFamily: t.fontD, fontSize: 13, fontWeight: 600, color: t.textMuted, marginBottom: 4 }}>No Node Selected</div>
                <div style={{ fontFamily: t.fontB, fontSize: 12, color: t.textDim, lineHeight: 1.5 }}>Click a component on canvas to inspect and edit.</div>
              </div>
            ) : (() => {
              const p = palItem(selectedNode.type); const m = selectedNode.meta;
              const inputSt = { width: '100%', background: t.bgInput, border: `1px solid ${t.border}`, borderRadius: 5, color: t.text, fontFamily: t.fontB, fontSize: 12, padding: '6px 9px' } as const;
              const selSt = { ...inputSt, cursor: 'pointer' as const };
              const fl = (label: string) => <div style={{ fontFamily: t.fontM, fontSize: 9, color: t.textDim, letterSpacing: 1, textTransform: 'uppercase' as const, marginBottom: 3, fontWeight: 600 }}>{label}</div>;
              const risk = nodeRisk(selectedNode.id); const gap = nodeGap(selectedNode.id);
              const riskData = NODE_RISK[selectedNode.id];

              return (
                <div className="animate-fade-in" style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ textAlign: 'center', padding: '12px 10px', background: p.color + '08', borderRadius: 9, border: `1px solid ${p.color}20` }}>
                    <span style={{ fontSize: 30, filter: `drop-shadow(0 0 8px ${p.color}40)` }}>{p.icon}</span>
                    <div style={{ fontFamily: t.fontM, fontSize: 8, color: p.color, fontWeight: 600, marginTop: 5, letterSpacing: 1.5 }}>{p.cat.toUpperCase()}</div>
                  </div>
                  {/* Risk + gap row */}
                  {(risk > 0 || gap > 0) && (
                    <div style={{ display: 'flex', gap: 6 }}>
                      {risk > 0 && <div style={{ flex: 1, padding: '6px 8px', borderRadius: 5, background: (risk >= 8 ? t.rose : t.amber) + '08', border: `1px solid ${(risk >= 8 ? t.rose : t.amber)}20`, textAlign: 'center' }}><Mono size={7}>RISK</Mono><div style={{ fontFamily: t.fontD, fontSize: 16, fontWeight: 800, color: risk >= 8 ? t.rose : t.amber }}>{risk}</div></div>}
                      {gap > 0 && <div style={{ flex: 1, padding: '6px 8px', borderRadius: 5, background: t.amber + '08', border: `1px solid ${t.amber}20`, textAlign: 'center' }}><Mono size={7}>GAP</Mono><div style={{ fontFamily: t.fontD, fontSize: 16, fontWeight: 800, color: gap >= 3 ? t.rose : t.amber }}>Δ{gap}</div></div>}
                    </div>
                  )}
                  {/* Related pains */}
                  {riskData && riskData.painIds.length > 0 && (
                    <div style={{ padding: '6px 8px', borderRadius: 5, background: t.bgGlass, border: `1px solid ${t.borderSubtle}` }}>
                      <Mono size={7} color={t.rose}>RELATED PAINS</Mono>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginTop: 4 }}>
                        {riskData.painIds.map(id => { const pi = PAIN_ITEMS.find(p => p.id === id); return pi ? <Chip key={id} color={(painScores[id] || 0) >= 7 ? t.rose : t.amber} small>{pi.icon} {painScores[id] || 0}</Chip> : null; })}
                      </div>
                    </div>
                  )}
                  {/* Editable fields */}
                  <div>{fl('Name')}<input value={m.name} onChange={e => updateMeta('name', e.target.value)} style={{ ...inputSt, fontFamily: t.fontD, fontWeight: 600 }} /></div>
                  <div>{fl('Role')}<input value={m.role} onChange={e => updateMeta('role', e.target.value)} style={inputSt} /></div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div>{fl('Status')}<select value={m.status} onChange={e => updateMeta('status', e.target.value)} style={selSt}>{Object.keys(STATUS_COLORS).map(k => <option key={k} value={k}>{k}</option>)}</select></div>
                    <div>{fl('Criticality')}<select value={m.criticality} onChange={e => updateMeta('criticality', e.target.value)} style={selSt}>{Object.keys(CRIT_COLORS).map(k => <option key={k} value={k}>{k}</option>)}</select></div>
                  </div>
                  <div>{fl('Owner')}<input value={m.owner} onChange={e => updateMeta('owner', e.target.value)} style={inputSt} /></div>
                  <div>{fl('Phase')}<select value={m.phase} onChange={e => updateMeta('phase', +e.target.value)} style={selSt}>{PHASE_LABELS.map((l, i) => <option key={i} value={i}>{l}</option>)}</select></div>
                  <div>{fl('Notes')}<textarea value={m.notes} onChange={e => updateMeta('notes', e.target.value)} rows={3} style={{ ...inputSt, resize: 'vertical' as const }} /></div>
                  <div style={{ padding: '6px 8px', borderRadius: 5, background: t.bgGlass, border: `1px solid ${t.borderSubtle}` }}><Mono size={8}>Connections: {edges.filter(e => e.from === selectedNode.id || e.to === selectedNode.id).length}</Mono></div>
                  <button onClick={() => setConnectFrom(selectedNode.id)} style={{ padding: '8px', borderRadius: 6, border: `1px solid ${t.accent}30`, background: t.accent + '10', color: t.accent, fontFamily: t.fontD, fontSize: 10, fontWeight: 600 }}>⊕ Connect from here</button>
                  <button onClick={() => removeNode(selectedNode.id)} style={{ padding: '8px', borderRadius: 6, border: `1px solid ${t.rose}25`, background: t.rose + '08', color: t.rose, fontFamily: t.fontD, fontSize: 10, fontWeight: 600 }}>Remove</button>
                </div>
              );
            })()}
          </div>
        )}

        {/* ── NOTES ── */}
        {rightTab === 'notes' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, overflowY: 'auto', padding: 10, display: 'flex', flexDirection: 'column', gap: 5 }}>
              {notes.map(n => (
                <div key={n.id} style={{ padding: '8px 10px', borderRadius: 7, background: (noteColors[n.type] || t.accent) + '06', border: `1px solid ${(noteColors[n.type] || t.accent)}15` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}><Chip color={noteColors[n.type]} small>{n.type}</Chip><button onClick={() => removeNote(n.id)} style={{ background: 'none', border: 'none', color: t.textDim, fontSize: 11 }}>×</button></div>
                  <div style={{ fontFamily: t.fontB, fontSize: 11, color: t.textSoft, lineHeight: 1.5 }}>{n.text}</div>
                </div>
              ))}
            </div>
            <div style={{ padding: 10, borderTop: `1px solid ${t.border}` }}>
              <div style={{ display: 'flex', gap: 3, marginBottom: 5 }}>
                {(['note', 'assumption', 'question', 'decision'] as const).map(typ => (<button key={typ} onClick={() => setNewNoteType(typ)} style={{ padding: '2px 7px', borderRadius: 3, border: `1px solid ${newNoteType === typ ? noteColors[typ] + '40' : 'transparent'}`, background: newNoteType === typ ? noteColors[typ] + '15' : 'transparent', color: newNoteType === typ ? noteColors[typ] : t.textDim, fontFamily: t.fontM, fontSize: 8 }}>{typ}</button>))}
              </div>
              <textarea value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Capture a note..." rows={2} style={{ width: '100%', background: t.bgInput, border: `1px solid ${t.border}`, borderRadius: 5, color: t.text, fontFamily: t.fontB, fontSize: 11, padding: '7px 9px', resize: 'none', marginBottom: 5 }} />
              <button onClick={() => { if (newNote.trim()) { addNote(newNoteType, newNote.trim()); setNewNote(''); } }} style={{ width: '100%', padding: 7, borderRadius: 5, border: 'none', background: `linear-gradient(135deg, ${t.accent}, ${t.cyan})`, color: '#fff', fontFamily: t.fontD, fontSize: 11, fontWeight: 600 }}>Add Note</button>
            </div>
          </div>
        )}

        {/* ── DASHBOARD ── */}
        {rightTab === 'dashboard' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Top pains */}
            <div><Mono size={8} color={t.rose}>TOP RISKS (Pain Engine)</Mono>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 6 }}>
                {topPains.slice(0, 5).map(p => (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 8px', borderRadius: 4, background: (p.score >= 8 ? t.rose : t.amber) + '06', border: `1px solid ${(p.score >= 8 ? t.rose : t.amber)}10` }}>
                    <span style={{ fontSize: 11 }}>{p.icon}</span>
                    <span style={{ fontFamily: t.fontB, fontSize: 10, color: t.textSoft, flex: 1 }}>{p.label}</span>
                    <span style={{ fontFamily: t.fontD, fontSize: 13, fontWeight: 800, color: p.score >= 8 ? t.rose : t.amber }}>{p.score}</span>
                  </div>
                ))}
                {topPains.length === 0 && <div style={{ fontFamily: t.fontB, fontSize: 10, color: t.textDim, padding: 6 }}>No pains ≥ 6</div>}
              </div>
            </div>
            {/* Maturity gaps */}
            <div><Mono size={8} color={t.amber}>MATURITY GAPS</Mono>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 6 }}>
                {bigGaps.map(d => (
                  <div key={d.key} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 8px', borderRadius: 4, background: t.bgGlass, border: `1px solid ${t.borderSubtle}` }}>
                    <span style={{ fontFamily: t.fontB, fontSize: 10, color: t.textSoft, flex: 1 }}>{d.short}</span>
                    <span style={{ fontFamily: t.fontM, fontSize: 8, color: t.textDim }}>{maturity[d.key]?.current}→{maturity[d.key]?.target}</span>
                    <span style={{ fontFamily: t.fontD, fontSize: 12, fontWeight: 800, color: d.gap >= 3 ? t.rose : t.amber }}>Δ{d.gap}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Vision posture */}
            <div><Mono size={8} color={t.emerald}>VISION (Tab 5)</Mono>
              <div style={{ marginTop: 6, padding: '6px 8px', borderRadius: 5, background: t.emerald + '06', border: `1px solid ${t.emerald}12` }}>
                <div style={{ fontFamily: t.fontD, fontSize: 11, fontWeight: 700, color: t.emerald }}>{visionPosture.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginTop: 4 }}>
                  {Object.entries(visionSliders).filter(([, v]) => v >= 7).map(([k, v]) => <Chip key={k} color={t.emerald} small>{k.replace(/([A-Z])/g, ' $1').trim()} {v}</Chip>)}
                </div>
              </div>
            </div>
            {/* GTT activation */}
            <div><Mono size={8} color={t.cyan}>GTT COMPONENTS ({activeGtt.size}/{GTT_NODES.length})</Mono>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 6 }}>
                {GTT_NODES.map(g => {
                  const on = activeGtt.has(g.id); const val = visionSliders[g.sliderKey] || 0;
                  return (
                    <div key={g.id} onClick={() => { setSelectedId(g.id); setRightTab('inspector'); }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 6px', borderRadius: 3, opacity: on ? 1 : 0.35, cursor: 'pointer' }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: on ? '#34d399' : t.textDim }} />
                      <span style={{ fontFamily: t.fontB, fontSize: 9, color: on ? t.text : t.textDim, flex: 1 }}>{g.label}</span>
                      <span style={{ fontFamily: t.fontM, fontSize: 7, color: on ? '#34d399' : t.textDim }}>{val}/{g.threshold}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── USE CASE REFERENCE ── */}
        {rightTab === 'ucref' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {!ucExpanded ? (
              <div style={{ textAlign: 'center', padding: 20 }}>
                <div style={{ fontSize: 28, opacity: 0.15, marginBottom: 8 }}>📋</div>
                <div style={{ fontFamily: t.fontB, fontSize: 12, color: t.textDim }}>Select a use case from the left panel</div>
              </div>
            ) : (() => {
              const uc = UC_REF.find(u => u.id === ucExpanded);
              if (!uc) return null;
              return (
                <div className="animate-fade-in">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <span style={{ fontSize: 24 }}>{uc.icon}</span>
                    <div>
                      <div style={{ fontFamily: t.fontD, fontSize: 14, fontWeight: 800, color: uc.color }}>{uc.label}</div>
                      <div style={{ fontFamily: t.fontB, fontSize: 10, color: t.textDim }}>{uc.tagline}</div>
                    </div>
                  </div>
                  {/* Requirements */}
                  <div style={{ marginBottom: 10 }}><Mono size={8} color={uc.color}>REQUIREMENTS</Mono>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 5 }}>
                      {uc.reqs.map((r, i) => <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px', borderRadius: 4, background: uc.color + '06', border: `1px solid ${uc.color}12` }}><span style={{ color: uc.color, fontFamily: t.fontD, fontSize: 10, fontWeight: 700 }}>✓</span><span style={{ fontFamily: t.fontB, fontSize: 10, color: t.textSoft }}>{r}</span></div>)}
                    </div>
                  </div>
                  {/* Drivers + pains */}
                  <div style={{ marginBottom: 10 }}><Mono size={8}>DRIVERS</Mono><div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginTop: 4 }}>{uc.drivers.map((d, i) => <Chip key={i} color={t.cyan} small>{d}</Chip>)}</div></div>
                  <div style={{ marginBottom: 10 }}><Mono size={8} color={t.rose}>PAIN POINTS</Mono><div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginTop: 4 }}>{uc.pains.map((p, i) => <Chip key={i} color={t.rose} small>{p}</Chip>)}</div></div>
                  {/* Best for / Not ideal */}
                  <div style={{ marginBottom: 10 }}><Mono size={8} color={t.emerald}>BEST FOR</Mono>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 4 }}>
                      {uc.bestFor.map((b, i) => <div key={i} style={{ fontFamily: t.fontB, fontSize: 10, color: t.textSoft, padding: '3px 0' }}>✓ {b}</div>)}
                    </div>
                  </div>
                  <div><Mono size={8} color={t.rose}>NOT IDEAL WHEN</Mono>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 4 }}>
                      {uc.notIdeal.map((b, i) => <div key={i} style={{ fontFamily: t.fontB, fontSize: 10, color: t.textDim, padding: '3px 0' }}>✗ {b}</div>)}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};

export default ArchitectureStudio;
