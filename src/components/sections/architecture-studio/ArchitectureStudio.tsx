import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useTheme } from '../../../theme/useTheme';
import { PALETTE, PALETTE_CATS, EMPTY_META, palItem, MATURITY_DOMAINS, PAIN_ITEMS } from '../../../data/seed';
import type { ArchNode, WorkshopNote } from '../../../types';
import { useWorkshopStore } from '../../../store/useWorkshopStore';
import { NODE_RISK, GTT_NODES } from './constants';
import PalettePanel from './PalettePanel';
import CanvasToolbar, { type ViewMode } from './CanvasToolbar';
import CanvasRenderer from './CanvasRenderer';
import NodeInspector from './NodeInspector';
import NotesPanel from './NotesPanel';
import DashboardPanel from './DashboardPanel';
import UseCaseReference from './UseCaseReference';

type RightTab = 'inspector' | 'notes' | 'dashboard' | 'ucref';

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
    const f = nd(fromId) || (() => { const g = GTT_NODES.find(n => n.id === fromId); return g ? { x: g.x, y: g.y } : null; })();
    const to2 = nd(toId) || (() => { const g = GTT_NODES.find(n => n.id === toId); return g ? { x: g.x, y: g.y } : null; })();
    if (!f || !to2) return '';
    const W = 110, H = 72, x1 = f.x + W / 2, y1 = f.y + H / 2, x2 = to2.x + W / 2, y2 = to2.y + H / 2, dx = x2 - x1;
    return `M ${x1} ${y1} C ${x1 + dx * 0.35} ${y1}, ${x2 - dx * 0.35} ${y2}, ${x2} ${y2}`;
  };

  const showFuture = viewMode !== 'current';
  const selGtt = selectedId ? GTT_NODES.find(g => g.id === selectedId) : null;

  /* ═══════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════ */
  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>

      {/* LEFT: PALETTE */}
      <PalettePanel
        t={t} palSearch={palSearch} setPalSearch={setPalSearch}
        palCat={palCat} setPalCat={setPalCat} filteredPal={filteredPal}
        addNode={addNode} showTemplates={showTemplates} setShowTemplates={setShowTemplates}
        doLoadTmpl={doLoadTmpl} ucExpanded={ucExpanded} setUcExpanded={setUcExpanded}
        setRightTab={setRightTab}
      />

      {/* CENTER: TOOLBAR + CANVAS */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <CanvasToolbar
          t={t} viewMode={viewMode} setViewMode={setViewMode}
          connectFrom={connectFrom} setConnectFrom={setConnectFrom}
          visibleNodeCount={visibleNodes.length} edgeCount={edges.length}
          showFuture={showFuture} activeGttCount={activeGtt.size}
          zoom={zoom} setZoom={setZoom} setPan={setPan}
          showLayers={showLayers} setShowLayers={setShowLayers}
        />
        <CanvasRenderer
          canvasRef={canvasRef} t={t} isDark={isDark} viewMode={viewMode}
          zoom={zoom} pan={pan} panning={panning} connectFrom={connectFrom}
          selectedId={selectedId} visibleNodes={visibleNodes} edges={edges}
          activeGtt={activeGtt} activeGttNodes={activeGttNodes} supersededIds={supersededIds}
          nodeRisk={nodeRisk} nodeGap={nodeGap} drawEdge={drawEdge}
          handleCanvasDown={handleCanvasDown} handleCanvasMove={handleCanvasMove}
          handleCanvasUp={handleCanvasUp} handleNodeDown={handleNodeDown}
          setSelectedId={setSelectedId} setRightTab={setRightTab}
        />
      </div>

      {/* RIGHT: INSPECTOR / NOTES / DASHBOARD / UC REF */}
      <div style={{ width: 260, background: t.bgPanel, borderLeft: `1px solid ${t.border}`, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ display: 'flex', borderBottom: `1px solid ${t.border}` }}>
          {([{ key: 'inspector' as RightTab, label: '✦ Inspect' }, { key: 'notes' as RightTab, label: `📝 Notes (${notes.length})` }, { key: 'dashboard' as RightTab, label: '📊 Data' }, { key: 'ucref' as RightTab, label: '📋 Ref' }]).map(tab => (
            <button key={tab.key} onClick={() => setRightTab(tab.key)} style={{ flex: 1, padding: '10px 4px', border: 'none', background: rightTab === tab.key ? t.accent + '10' : 'transparent', color: rightTab === tab.key ? t.accent : t.textDim, fontFamily: t.fontD, fontSize: 9, fontWeight: 600, borderBottom: rightTab === tab.key ? `2px solid ${t.accent}` : '2px solid transparent' }}>{tab.label}</button>
          ))}
        </div>

        {rightTab === 'inspector' && (
          <NodeInspector
            t={t} selectedNode={selectedNode ?? null} selGtt={selGtt ?? null}
            edges={edges} painScores={painScores} visionSliders={visionSliders}
            nodeRisk={nodeRisk} nodeGap={nodeGap} nd={nd}
            updateMeta={updateMeta} removeNode={removeNode} setConnectFrom={setConnectFrom}
          />
        )}

        {rightTab === 'notes' && (
          <NotesPanel
            t={t} notes={notes} removeNote={removeNote} addNote={addNote}
            newNote={newNote} setNewNote={setNewNote}
            newNoteType={newNoteType} setNewNoteType={setNewNoteType}
          />
        )}

        {rightTab === 'dashboard' && (
          <DashboardPanel
            t={t} topPains={topPains} bigGaps={bigGaps} maturity={maturity}
            visionPosture={visionPosture} visionSliders={visionSliders}
            activeGtt={activeGtt} gttNodes={GTT_NODES}
            setSelectedId={setSelectedId} setRightTab={setRightTab}
          />
        )}

        {rightTab === 'ucref' && (
          <UseCaseReference t={t} ucExpanded={ucExpanded} />
        )}
      </div>
    </div>
  );
};

export default ArchitectureStudio;
