import React from 'react';
import type { ThemeTokens } from '../../../theme/tokens';
import { Chip, Mono } from '../../shared/Primitives';
import { UC_REF } from './constants';

interface UseCaseReferenceProps {
  t: ThemeTokens;
  ucExpanded: string | null;
}

const UseCaseReference: React.FC<UseCaseReferenceProps> = ({ t, ucExpanded }) => (
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
);

export default UseCaseReference;
