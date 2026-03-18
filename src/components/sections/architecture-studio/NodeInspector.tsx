import React from 'react';
import type { ThemeTokens } from '../../../theme/tokens';
import { STATUS_COLORS, CRIT_COLORS, PHASE_COLORS, PHASE_LABELS } from '../../../theme/tokens';
import { palItem, PAIN_ITEMS } from '../../../data/seed';
import type { ArchNode, ArchEdge, PainScores } from '../../../types';
import { Chip, Mono } from '../../shared/Primitives';
import type { GttOverlay } from './constants';
import { NODE_RISK, GTT_NODES } from './constants';

interface NodeInspectorProps {
  t: ThemeTokens;
  selectedNode: ArchNode | null;
  selGtt: GttOverlay | null;
  edges: ArchEdge[];
  painScores: PainScores;
  visionSliders: Record<string, number>;
  nodeRisk: (id: string) => number;
  nodeGap: (id: string) => number;
  nd: (id: string) => ArchNode | undefined;
  updateMeta: (key: string, val: string | number) => void;
  removeNode: (id: string) => void;
  setConnectFrom: (id: string | null) => void;
}

const NodeInspector: React.FC<NodeInspectorProps> = ({
  t, selectedNode, selGtt, edges, painScores, visionSliders,
  nodeRisk, nodeGap, nd, updateMeta, removeNode, setConnectFrom,
}) => (
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
          {(risk > 0 || gap > 0) && (
            <div style={{ display: 'flex', gap: 6 }}>
              {risk > 0 && <div style={{ flex: 1, padding: '6px 8px', borderRadius: 5, background: (risk >= 8 ? t.rose : t.amber) + '08', border: `1px solid ${(risk >= 8 ? t.rose : t.amber)}20`, textAlign: 'center' }}><Mono size={7}>RISK</Mono><div style={{ fontFamily: t.fontD, fontSize: 16, fontWeight: 800, color: risk >= 8 ? t.rose : t.amber }}>{risk}</div></div>}
              {gap > 0 && <div style={{ flex: 1, padding: '6px 8px', borderRadius: 5, background: t.amber + '08', border: `1px solid ${t.amber}20`, textAlign: 'center' }}><Mono size={7}>GAP</Mono><div style={{ fontFamily: t.fontD, fontSize: 16, fontWeight: 800, color: gap >= 3 ? t.rose : t.amber }}>Δ{gap}</div></div>}
            </div>
          )}
          {riskData && riskData.painIds.length > 0 && (
            <div style={{ padding: '6px 8px', borderRadius: 5, background: t.bgGlass, border: `1px solid ${t.borderSubtle}` }}>
              <Mono size={7} color={t.rose}>RELATED PAINS</Mono>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginTop: 4 }}>
                {riskData.painIds.map(id => { const pi = PAIN_ITEMS.find(p => p.id === id); return pi ? <Chip key={id} color={(painScores[id] || 0) >= 7 ? t.rose : t.amber} small>{pi.icon} {painScores[id] || 0}</Chip> : null; })}
              </div>
            </div>
          )}
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
);

export default NodeInspector;
