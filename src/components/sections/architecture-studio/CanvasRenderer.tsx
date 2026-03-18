import React, { RefObject } from 'react';
import type { ThemeTokens } from '../../../theme/tokens';
import { STATUS_COLORS, CRIT_COLORS, PHASE_COLORS, CAT_COLORS } from '../../../theme/tokens';
import { palItem } from '../../../data/seed';
import type { ArchNode, ArchEdge } from '../../../types';
import { Chip } from '../../shared/Primitives';
import type { GttOverlay } from './constants';
import { GTT_EDGES } from './constants';
import type { ViewMode } from './CanvasToolbar';

interface CanvasRendererProps {
  canvasRef: RefObject<HTMLDivElement>;
  t: ThemeTokens;
  isDark: boolean;
  viewMode: ViewMode;
  zoom: number;
  pan: { x: number; y: number };
  panning: { sx: number; sy: number; sp: { x: number; y: number } } | null;
  connectFrom: string | null;
  selectedId: string | null;
  visibleNodes: ArchNode[];
  edges: ArchEdge[];
  activeGtt: Set<string>;
  activeGttNodes: GttOverlay[];
  supersededIds: Set<string>;
  nodeRisk: (id: string) => number;
  nodeGap: (id: string) => number;
  drawEdge: (fromId: string, toId: string) => string;
  handleCanvasDown: (e: React.MouseEvent) => void;
  handleCanvasMove: (e: React.MouseEvent) => void;
  handleCanvasUp: () => void;
  handleNodeDown: (e: React.MouseEvent, node: ArchNode) => void;
  setSelectedId: (id: string | null) => void;
  setRightTab: (v: 'inspector' | 'notes' | 'dashboard' | 'ucref') => void;
}

const CanvasRenderer: React.FC<CanvasRendererProps> = ({
  canvasRef, t, isDark, viewMode, zoom, pan, panning, connectFrom,
  selectedId, visibleNodes, edges, activeGtt, activeGttNodes, supersededIds,
  nodeRisk, nodeGap, drawEdge, handleCanvasDown, handleCanvasMove, handleCanvasUp,
  handleNodeDown, setSelectedId, setRightTab,
}) => {
  const gridDot = isDark ? 'rgba(40,55,85,0.25)' : 'rgba(148,163,184,0.2)';
  const showCurrent = viewMode !== 'future';
  const showFuture = viewMode !== 'current';

  return (
    <div ref={canvasRef} onMouseDown={handleCanvasDown} onMouseMove={handleCanvasMove} onMouseUp={handleCanvasUp} onMouseLeave={handleCanvasUp}
      style={{ flex: 1, position: 'relative', overflow: 'hidden', cursor: panning ? 'grabbing' : connectFrom ? 'crosshair' : 'grab', background: t.bgCanvas }}>
      <div data-bg="true" style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(circle, ${gridDot} 1px, transparent 1px)`, backgroundSize: `${24 * zoom}px ${24 * zoom}px`, backgroundPosition: `${pan.x % (24 * zoom)}px ${pan.y % (24 * zoom)}px`, pointerEvents: 'none' }} />
      <div data-bg="true" style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 40% 30%, ${viewMode === 'future' ? t.emerald : t.amber}03, transparent 60%)`, pointerEvents: 'none' }} />

      <div style={{ position: 'absolute', left: 0, top: 0, transformOrigin: '0 0', transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}>
        {/* SVG edges */}
        <svg style={{ position: 'absolute', top: -2000, left: -2000, width: 6000, height: 6000, pointerEvents: 'none', overflow: 'visible' }}>
          <defs>
            <linearGradient id="egC" x1="0%" y1="0%" x2="100%"><stop offset="0%" stopColor={t.amber} stopOpacity="0.5" /><stop offset="100%" stopColor={t.orange} stopOpacity="0.25" /></linearGradient>
            <linearGradient id="egG" x1="0%" y1="0%" x2="100%"><stop offset="0%" stopColor="#34d399" stopOpacity="0.6" /><stop offset="100%" stopColor="#22d3ee" stopOpacity="0.3" /></linearGradient>
            <filter id="eGl"><feGaussianBlur stdDeviation="2" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          </defs>
          {/* Current edges */}
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

        {/* Current nodes */}
        {showCurrent && visibleNodes.map(node => {
          const p = palItem(node.type); const sel = selectedId === node.id; const m = node.meta;
          const sc = STATUS_COLORS[m.status] || t.slate; const pc = PHASE_COLORS[m.phase] || 'transparent';
          const risk = nodeRisk(node.id); const gap = nodeGap(node.id);
          const dimmed = viewMode === 'overlay' && supersededIds.has(node.id);
          return (
            <div key={node.id} className="canvas-node" onMouseDown={e => handleNodeDown(e, node)}
              style={{ position: 'absolute', left: node.x, top: node.y, width: 110, userSelect: 'none', zIndex: sel ? 50 : 10, borderRadius: 10, background: sel ? p.color + '15' : t.bgCard, border: `1.5px solid ${sel ? p.color : p.color + '35'}`, backdropFilter: 'blur(12px)', boxShadow: sel ? `0 0 24px ${p.color}20, 0 4px 20px rgba(0,0,0,${isDark ? '0.4' : '0.1'})` : `0 2px 12px rgba(0,0,0,${isDark ? '0.35' : '0.08'})`, cursor: connectFrom ? 'crosshair' : 'grab', overflow: 'hidden', opacity: dimmed ? 0.3 : 1, transition: 'opacity 0.3s' }}>
              <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${p.color}${sel ? 'aa' : '50'}, transparent)` }} />
              {risk >= 5 && <div style={{ position: 'absolute', top: 4, right: 5, width: 16, height: 16, borderRadius: 4, background: (risk >= 8 ? t.rose : t.amber) + '25', border: `1px solid ${risk >= 8 ? t.rose : t.amber}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: t.fontM, fontSize: 7, fontWeight: 700, color: risk >= 8 ? t.rose : t.amber }}>{risk}</div>}
              {gap >= 2 && <div style={{ position: 'absolute', top: 4, left: 5, fontFamily: t.fontM, fontSize: 6, color: t.amber, background: t.amber + '15', padding: '1px 4px', borderRadius: 3, border: `1px solid ${t.amber}30` }}>Δ{gap}</div>}
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

        {/* GTT overlay nodes */}
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
  );
};

export default CanvasRenderer;
