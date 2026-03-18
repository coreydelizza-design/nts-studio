import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../../theme/useTheme';
import { GlassCard, SectionHeader, BarMeter, PageHeader, PhaseTag, Mono } from '../../shared/Primitives';

const TradeoffLab: React.FC = () => {
  const { t } = useTheme();
  type Scores = Record<string, number>;
  const paths: { name: string; tag: string; color: string; desc: string; scores: Scores }[] = [
    { name: 'Conservative', tag: 'LOW RISK', color: t.amber, desc: 'Incremental. Minimal disruption.', scores: { cost: 4, speed: 3, resil: 5, sec: 5, sup: 4, agil: 3, cloud: 4, ux: 4, branch: 3 } },
    { name: 'Balanced', tag: 'RECOMMENDED', color: t.accent, desc: 'SD-WAN + SASE. Cloud uplift. 18mo.', scores: { cost: 6, speed: 6, resil: 7, sec: 7, sup: 7, agil: 6, cloud: 7, ux: 7, branch: 6 } },
    { name: 'Transformational', tag: 'HIGH IMPACT', color: t.emerald, desc: 'Full modernization. Zero trust. 24mo.', scores: { cost: 9, speed: 9, resil: 9, sec: 9, sup: 9, agil: 9, cloud: 9, ux: 9, branch: 9 } },
  ];
  const levers = [{ k: 'cost', l: 'Cost Reduction' }, { k: 'speed', l: 'Deploy Speed' }, { k: 'resil', l: 'Resilience' }, { k: 'sec', l: 'Security' }, { k: 'sup', l: 'Support' }, { k: 'agil', l: 'Agility' }, { k: 'cloud', l: 'Cloud Perf' }, { k: 'ux', l: 'User Experience' }, { k: 'branch', l: 'Branch Std' }];
  const chartData = levers.map(l => ({ lever: l.l.split(' ')[0], Conservative: paths[0].scores[l.k], Balanced: paths[1].scores[l.k], Transformational: paths[2].scores[l.k] }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader title="Value & Tradeoff Lab" subtitle="Compare transformation paths and understand strategic tradeoffs." phase="7" accent={t.violet} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {paths.map(p => (
          <GlassCard key={p.name} accent={p.color} glow={p.tag === 'RECOMMENDED'}>
            <div style={{ textAlign: 'center', marginBottom: 16 }}><PhaseTag color={p.color}>{p.tag}</PhaseTag><div style={{ fontFamily: t.fontD, fontSize: 20, fontWeight: 800, color: t.text, marginTop: 8 }}>{p.name}</div><p style={{ fontFamily: t.fontB, fontSize: 12, color: t.textDim, marginTop: 6 }}>{p.desc}</p></div>
            {levers.map(l => <div key={l.k} style={{ marginBottom: 8 }}><BarMeter value={p.scores[l.k]} max={10} color={p.color} h={4} label={l.l} /></div>)}
            <div style={{ marginTop: 16, padding: 14, borderRadius: t.r.md, background: p.color + '06', textAlign: 'center' }}>
              <Mono size={9}>COMPOSITE</Mono>
              <div style={{ fontFamily: t.fontD, fontSize: 36, fontWeight: 900, color: p.color }}>{Object.values(p.scores).reduce((a: number, b: number) => a + b, 0)}</div>
            </div>
          </GlassCard>
        ))}
      </div>
      <GlassCard>
        <SectionHeader tag="COMPARISON" sub="Side-by-side value analysis">Value Dimensions</SectionHeader>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" stroke={t.border} />
            <XAxis dataKey="lever" tick={{ fill: t.textDim, fontSize: 10 }} />
            <YAxis domain={[0, 10]} tick={{ fill: t.textDim, fontSize: 10 }} />
            <Tooltip contentStyle={{ background: t.bgPanel, border: `1px solid ${t.border}`, borderRadius: t.r.md, fontSize: 12, color: t.text }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="Conservative" fill={t.amber} radius={[3, 3, 0, 0]} />
            <Bar dataKey="Balanced" fill={t.accent} radius={[3, 3, 0, 0]} />
            <Bar dataKey="Transformational" fill={t.emerald} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </GlassCard>
      <GlassCard accent={t.accent} glow>
        <SectionHeader tag="RECOMMENDATION">Strategic Recommendation</SectionHeader>
        <p style={{ fontFamily: t.fontB, fontSize: 14, color: t.text, lineHeight: 1.8, margin: 0 }}>Based on MFG's ambition (8/10), zero trust mandate, and M&A requirements, the <strong style={{ color: t.accent }}>Balanced path</strong> is recommended. Delivers improvements within 90 days while building toward Transformational posture over 18–24 months.</p>
      </GlassCard>
    </div>
  );
};

export default TradeoffLab;
