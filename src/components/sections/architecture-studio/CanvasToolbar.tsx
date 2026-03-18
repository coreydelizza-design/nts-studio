import React from 'react';
import type { ThemeTokens } from '../../../theme/tokens';
import { CAT_COLORS } from '../../../theme/tokens';
import { PALETTE_CATS } from '../../../data/seed';
import { Chip, Mono } from '../../shared/Primitives';

export type ViewMode = 'current' | 'future' | 'overlay';

interface CanvasToolbarProps {
  t: ThemeTokens;
  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;
  connectFrom: string | null;
  setConnectFrom: (v: string | null) => void;
  visibleNodeCount: number;
  edgeCount: number;
  showFuture: boolean;
  activeGttCount: number;
  zoom: number;
  setZoom: (fn: (z: number) => number) => void;
  setPan: (v: { x: number; y: number }) => void;
  showLayers: Record<string, boolean>;
  setShowLayers: (fn: (p: Record<string, boolean>) => Record<string, boolean>) => void;
}

const CanvasToolbar: React.FC<CanvasToolbarProps> = ({
  t, viewMode, setViewMode, connectFrom, setConnectFrom,
  visibleNodeCount, edgeCount, showFuture, activeGttCount,
  zoom, setZoom, setPan, showLayers, setShowLayers,
}) => (
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
      <Mono size={9}>{visibleNodeCount} nodes · {edgeCount} edges</Mono>
      {showFuture && <Chip color={t.emerald} small>{activeGttCount} GTT</Chip>}
      <Mono size={9}>{Math.round(zoom * 100)}%</Mono>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      {PALETTE_CATS.map(cat => (<button key={cat} onClick={() => setShowLayers(p => ({ ...p, [cat]: !p[cat] }))} title={cat} style={{ width: 22, height: 22, borderRadius: 4, border: `1px solid ${showLayers[cat] ? (CAT_COLORS[cat] || t.accent) + '50' : t.borderSubtle}`, background: showLayers[cat] ? (CAT_COLORS[cat] || t.accent) + '15' : 'transparent', fontSize: 9, color: showLayers[cat] ? CAT_COLORS[cat] : t.textDim, fontFamily: t.fontM, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{cat[0]}</button>))}
      <div style={{ width: 1, height: 18, background: t.border, margin: '0 2px' }} />
      <button onClick={() => setZoom(z => Math.min(3, z + 0.2))} style={{ width: 24, height: 24, borderRadius: 5, border: `1px solid ${t.border}`, background: t.bgInput, color: t.textMuted, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
      <button onClick={() => setZoom(z => Math.max(0.25, z - 0.2))} style={{ width: 24, height: 24, borderRadius: 5, border: `1px solid ${t.border}`, background: t.bgInput, color: t.textMuted, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
      <button onClick={() => { setZoom(() => 1); setPan({ x: 0, y: 0 }); }} style={{ padding: '3px 8px', borderRadius: 5, border: `1px solid ${t.border}`, background: t.bgInput, color: t.textMuted, fontFamily: t.fontM, fontSize: 8 }}>FIT</button>
    </div>
  </div>
);

export default CanvasToolbar;
