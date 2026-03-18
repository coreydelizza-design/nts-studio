import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useTheme } from '../../../theme/useTheme';
import { useWorkshopStore } from '../../../store/useWorkshopStore';
import { MATURITY_DOMAINS } from '../../../data/seed';
import { GlassCard, SectionHeader, Chip, MetricBlock, PageHeader, Mono } from '../../shared/Primitives';

const MaturityAssessment: React.FC = () => {
  const { t } = useTheme();
  const { maturity, setMaturityScore } = useWorkshopStore();
  const tiers = ['Ad Hoc', 'Developing', 'Defined', 'Managed', 'Optimized'];
  const arr = MATURITY_DOMAINS.map(d => ({ ...d, ...maturity[d.key] }));
  const avgC = (arr.reduce((s, d) => s + d.current, 0) / arr.length).toFixed(1);
  const avgT = (arr.reduce((s, d) => s + d.target, 0) / arr.length).toFixed(1);
  const radar = arr.map(d => ({ domain: d.short, Current: d.current, Target: d.target }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader title="Maturity Assessment" subtitle="Evaluate maturity across ten strategic domains." phase="4" accent={t.amber} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        <GlassCard accent={t.amber} style={{ padding: 18 }}><MetricBlock label="Current Avg" value={avgC} sub={tiers[Math.round(+avgC) - 1] + ' tier'} color={t.amber} /></GlassCard>
        <GlassCard accent={t.emerald} style={{ padding: 18 }}><MetricBlock label="Target Avg" value={avgT} sub={tiers[Math.round(+avgT) - 1] + ' tier'} color={t.emerald} /></GlassCard>
        <GlassCard accent={t.cyan} style={{ padding: 18 }}><MetricBlock label="Gap" value={(+avgT - +avgC).toFixed(1)} sub="points to close" color={t.cyan} /></GlassCard>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <GlassCard>
          <SectionHeader tag="RADAR" sub="Current vs Target overlay">Maturity Radar</SectionHeader>
          <ResponsiveContainer width="100%" height={340}>
            <RadarChart data={radar}>
              <PolarGrid stroke={t.border} />
              <PolarAngleAxis dataKey="domain" tick={{ fill: t.textDim, fontSize: 10 }} />
              <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fill: t.textDim, fontSize: 9 }} />
              <Radar name="Current" dataKey="Current" stroke={t.amber} fill={t.amber} fillOpacity={0.15} strokeWidth={2} />
              <Radar name="Target" dataKey="Target" stroke={t.emerald} fill={t.emerald} fillOpacity={0.08} strokeWidth={2} strokeDasharray="6 3" />
              <Tooltip contentStyle={{ background: t.bgPanel, border: `1px solid ${t.border}`, borderRadius: t.r.md, fontSize: 12, color: t.text }} />
              <Legend wrapperStyle={{ fontSize: 11, color: t.textMuted }} />
            </RadarChart>
          </ResponsiveContainer>
        </GlassCard>
        <GlassCard style={{ maxHeight: 430, overflowY: 'auto' }}>
          <SectionHeader tag="SCORING" sub="Adjust per domain">Scoring</SectionHeader>
          {arr.map((d, i) => {
            const gap = d.target - d.current;
            const gc = gap >= 3 ? t.rose : gap >= 2 ? t.amber : t.emerald;
            return (
              <div key={d.key} style={{ marginBottom: 18, paddingBottom: 14, borderBottom: i < arr.length - 1 ? `1px solid ${t.borderSubtle}` : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontFamily: t.fontD, fontSize: 13, fontWeight: 600, color: t.text }}>{d.label}</span>
                  <Chip color={gc}>Gap: {gap}</Chip>
                </div>
                <div style={{ display: 'flex', gap: 14 }}>
                  <div style={{ flex: 1 }}><Mono color={t.amber} size={9}>Current: {d.current}</Mono><input type="range" min={1} max={5} value={d.current} style={{ width: '100%', accentColor: t.amber, marginTop: 4 }} onChange={e => setMaturityScore(d.key, 'current', +e.target.value)} /></div>
                  <div style={{ flex: 1 }}><Mono color={t.emerald} size={9}>Target: {d.target}</Mono><input type="range" min={1} max={5} value={d.target} style={{ width: '100%', accentColor: t.emerald, marginTop: 4 }} onChange={e => setMaturityScore(d.key, 'target', +e.target.value)} /></div>
                </div>
              </div>
            );
          })}
        </GlassCard>
      </div>
    </div>
  );
};

export default MaturityAssessment;
