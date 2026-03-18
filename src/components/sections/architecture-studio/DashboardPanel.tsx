import React from 'react';
import type { ThemeTokens } from '../../../theme/tokens';
import type { PainScores, MaturityMap, MaturityDomain } from '../../../types';
import { Chip, Mono } from '../../shared/Primitives';
import type { GttOverlay } from './constants';

interface PainWithScore {
  id: string;
  label: string;
  icon: string;
  score: number;
}

interface GapDomain extends MaturityDomain {
  gap: number;
}

interface DashboardPanelProps {
  t: ThemeTokens;
  topPains: PainWithScore[];
  bigGaps: GapDomain[];
  maturity: MaturityMap;
  visionPosture: string;
  visionSliders: Record<string, number>;
  activeGtt: Set<string>;
  gttNodes: GttOverlay[];
  setSelectedId: (id: string | null) => void;
  setRightTab: (v: 'inspector' | 'notes' | 'dashboard' | 'ucref') => void;
}

const DashboardPanel: React.FC<DashboardPanelProps> = ({
  t, topPains, bigGaps, maturity, visionPosture, visionSliders,
  activeGtt, gttNodes, setSelectedId, setRightTab,
}) => (
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
    <div><Mono size={8} color={t.cyan}>GTT COMPONENTS ({activeGtt.size}/{gttNodes.length})</Mono>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 6 }}>
        {gttNodes.map(g => {
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
);

export default DashboardPanel;
