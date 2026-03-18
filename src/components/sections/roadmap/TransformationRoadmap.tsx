import React from 'react';
import { useTheme } from '../../../theme/useTheme';
import { ROADMAP_TRACKS, SEED_ROADMAP } from '../../../data/seed';
import { PageHeader, PhaseTag, Mono } from '../../shared/Primitives';

const TransformationRoadmap: React.FC = () => {
  const { t } = useTheme();
  const phases = [{ label: '0–90 Days', tag: 'Quick Wins', color: t.emerald }, { label: '3–12 Months', tag: 'Foundation', color: t.accent }, { label: '12–24 Months', tag: 'Scale', color: t.violet }];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader title="Transformation Roadmap" subtitle="Phased execution plan by workstream and timeline." phase="8" accent={t.blue} />
      <div style={{ display: 'grid', gridTemplateColumns: '170px repeat(3, 1fr)', gap: 3 }}>
        <div style={{ padding: '10px 14px' }}><Mono>WORKSTREAM</Mono></div>
        {phases.map((p, i) => (
          <div key={i} style={{ textAlign: 'center', padding: 12, background: p.color + '06', borderBottom: `2px solid ${p.color}60`, borderRadius: `${t.r.md}px ${t.r.md}px 0 0` }}>
            <div style={{ fontFamily: t.fontD, fontSize: 14, fontWeight: 700, color: p.color }}>{p.label}</div>
            <PhaseTag color={p.color}>{p.tag}</PhaseTag>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {ROADMAP_TRACKS.map(track => {
          const items = SEED_ROADMAP.filter(r => r.track === track.id);
          return (
            <div key={track.id} style={{ display: 'grid', gridTemplateColumns: '170px repeat(3, 1fr)', gap: 3 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: t.bgCard, borderRadius: `${t.r.sm}px 0 0 ${t.r.sm}px`, borderLeft: `3px solid ${track.color}` }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: track.color, flexShrink: 0 }} />
                <span style={{ fontFamily: t.fontD, fontSize: 12, fontWeight: 600, color: t.text, whiteSpace: 'nowrap' }}>{track.label}</span>
              </div>
              {[0, 1, 2].map(phase => (
                <div key={phase} style={{ padding: '6px 8px', background: t.bgGlass, display: 'flex', flexDirection: 'column', gap: 4, borderRadius: phase === 2 ? `0 ${t.r.sm}px ${t.r.sm}px 0` : 0 }}>
                  {items.filter(i => i.phase === phase).map((item, i) => (
                    <div key={i} style={{ padding: '7px 10px', borderRadius: t.r.sm, fontFamily: t.fontB, fontSize: 11, color: t.text, lineHeight: 1.4, background: item.type === 'quickwin' ? t.emerald + '10' : track.color + '08', border: `1px solid ${item.type === 'quickwin' ? t.emerald + '25' : track.color + '15'}` }}>
                      {item.type === 'quickwin' && <span style={{ fontFamily: t.fontM, fontSize: 8, color: t.emerald, fontWeight: 700, letterSpacing: 1 }}>⚡ QUICK WIN · </span>}{item.label}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TransformationRoadmap;
