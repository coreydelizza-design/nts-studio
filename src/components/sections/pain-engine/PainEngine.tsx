import React from 'react';
import { useTheme } from '../../../theme/useTheme';
import { useWorkshopStore } from '../../../store/useWorkshopStore';
import { PAIN_ITEMS } from '../../../data/seed';
import { GlassCard, SectionHeader, Chip, SliderControl, PageHeader, Mono } from '../../shared/Primitives';

const PainEngine: React.FC = () => {
  const { t } = useTheme();
  const { painScores, setPainScore } = useWorkshopStore();
  const sorted = [...PAIN_ITEMS].map(p => ({ ...p, score: painScores[p.id] || 0 })).sort((a, b) => b.score - a.score);
  const critical = sorted.filter(p => p.score >= 7);
  const cats = [...new Set(PAIN_ITEMS.map(p => p.cat))];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader title="Pain Point & Constraint Engine" subtitle="Rate each area to surface the highest-impact constraints." phase="3" accent={t.rose} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <GlassCard className="animate-fade-up delay-1" style={{ maxHeight: 620, overflowY: 'auto' }}>
          <SectionHeader tag="ASSESSMENT" sub="Rate 0 (no issue) to 10 (critical)">Pain Intensity</SectionHeader>
          {cats.map(cat => (
            <div key={cat} style={{ marginBottom: 16 }}>
              <Mono color={t.textDim} size={9}>{cat}</Mono>
              <div style={{ marginTop: 6 }}>{PAIN_ITEMS.filter(p => p.cat === cat).map(p => {
                const v = painScores[p.id] || 0;
                return <SliderControl key={p.id} label={`${p.icon} ${p.label}`} desc={p.desc} value={v} onChange={val => setPainScore(p.id, val)} color={v >= 7 ? t.rose : v >= 4 ? t.amber : t.emerald} />;
              })}</div>
            </div>
          ))}
        </GlassCard>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <GlassCard className="animate-fade-up delay-2" accent={t.rose} glow={critical.length > 0}>
            <SectionHeader tag="CRITICAL" sub={critical.length > 0 ? `${critical.length} at severity ≥ 7` : 'Adjust sliders to surface constraints'}>Top Friction Zones</SectionHeader>
            {critical.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center' }}><div style={{ fontSize: 28, opacity: 0.3, marginBottom: 8 }}>▲</div><p style={{ fontFamily: t.fontB, fontSize: 13, color: t.textDim }}>Items rated ≥ 7 surface here.</p></div>
            ) : critical.map((p, i) => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderRadius: t.r.md, background: t.rose + '08', border: `1px solid ${t.rose}20`, marginBottom: 8 }}>
                <div style={{ fontFamily: t.fontD, fontSize: 20, fontWeight: 900, color: t.rose, minWidth: 28 }}>#{i + 1}</div>
                <div style={{ flex: 1 }}><div style={{ fontFamily: t.fontD, fontSize: 13, fontWeight: 600, color: t.text }}>{p.icon} {p.label}</div><div style={{ fontFamily: t.fontB, fontSize: 11, color: t.textDim }}>{p.desc}</div></div>
                <div style={{ fontFamily: t.fontD, fontSize: 26, fontWeight: 900, color: t.rose }}>{p.score}</div>
              </div>
            ))}
          </GlassCard>
          <GlassCard className="animate-fade-up delay-3">
            <SectionHeader tag="HEATMAP" sub="Severity distribution">Constraint Grid</SectionHeader>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
              {sorted.map(p => {
                const c = p.score >= 8 ? t.rose : p.score >= 6 ? t.amber : p.score >= 3 ? t.cyan : t.textDim;
                return <div key={p.id} style={{ padding: '10px 6px', borderRadius: t.r.sm, background: c + '10', border: `1px solid ${c}20`, textAlign: 'center' }}>
                  <div style={{ fontSize: 18 }}>{p.icon}</div><div style={{ fontFamily: t.fontD, fontSize: 18, fontWeight: 800, color: c, marginTop: 4 }}>{p.score}</div>
                  <div style={{ fontFamily: t.fontM, fontSize: 8, color: t.textDim, marginTop: 2 }}>{p.label.split(' ').slice(0, 2).join(' ')}</div>
                </div>;
              })}
            </div>
          </GlassCard>
        </div>
      </div>
      <GlassCard className="animate-fade-up delay-4" accent={t.accent} glow>
        <SectionHeader tag="SYNTHESIS" sub="Problem statement for proposal">Constraint Narrative</SectionHeader>
        <textarea rows={4} defaultValue="Meridian Financial Group operates a fragmented multi-carrier network across 187 sites in 14 countries, with 5+ overlapping security platforms, 45 acquired sites pending integration, and critical Cisco ASA fleet at end-of-life. Carrier sprawl, manual operations, and poor visibility inhibit cloud acceleration and zero trust timelines."
          style={{ width: '100%', background: t.bgGlass, border: `1px solid ${t.border}`, borderRadius: t.r.md, color: t.text, fontFamily: t.fontB, fontSize: 13, padding: 14, resize: 'vertical', lineHeight: 1.65 }} />
      </GlassCard>
    </div>
  );
};

export default PainEngine;
