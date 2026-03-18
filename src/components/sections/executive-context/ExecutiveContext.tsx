import React, { useState } from 'react';
import { useTheme } from '../../../theme/useTheme';
import { GlassCard, SectionHeader, Chip, PageHeader, SliderControl, Mono } from '../../shared/Primitives';

const ExecutiveContext: React.FC = () => {
  const { t } = useTheme();
  const drivers = [
    { id: 'growth', label: 'Revenue Growth', color: t.emerald, on: true },
    { id: 'cost', label: 'Cost Optimization', color: t.amber, on: true },
    { id: 'resilience', label: 'Resilience', color: t.cyan, on: false },
    { id: 'security', label: 'Security & Compliance', color: t.rose, on: true },
    { id: 'ma', label: 'M&A Integration', color: t.violet, on: true },
    { id: 'global', label: 'Global Expansion', color: t.blue, on: false },
    { id: 'cloud', label: 'Cloud Acceleration', color: t.cyan, on: true },
    { id: 'ai', label: 'AI / ML Readiness', color: t.lime, on: true },
    { id: 'branch', label: 'Branch Simplification', color: t.orange, on: false },
  ];
  const [active, setActive] = useState(drivers.map(d => d.on));
  const [ambition, setAmbition] = useState(8);
  const [changes, setChanges] = useState('• Acquired Pinnacle Insurance (2024) and NorthStar Wealth Advisors (2025)\n• Board-mandated zero trust initiative — 18-month deadline\n• New CTO (ex-AWS) driving cloud-first strategy\n• 40% YoY cloud workload growth straining legacy MPLS\n• Regulatory pressure (SOX, PCI-DSS) requiring unified security');
  const risks = [
    { area: 'Legacy MPLS Dependencies', sev: 'critical' as const, impact: 'Blocking cloud-first execution' },
    { area: 'M&A Network Integration', sev: 'critical' as const, impact: 'Two acquisitions pending' },
    { area: 'Security Fragmentation', sev: 'high' as const, impact: '5 overlapping vendors' },
    { area: 'Regulatory Gap', sev: 'high' as const, impact: 'SOX/PCI audit findings Q4 2025' },
    { area: 'Talent Gap', sev: 'medium' as const, impact: 'Team lacks cloud-native skills' },
    { area: 'Budget Timing', sev: 'medium' as const, impact: 'FY27 cycle closes in 6 months' },
  ];
  const sc: Record<string, string> = { critical: t.rose, high: t.amber, medium: t.cyan };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader title="Executive Context Alignment" subtitle="Align to business outcomes and strategic priorities before discussing technology." phase="1" accent={t.violet} />
      <GlassCard className="animate-fade-up delay-1">
        <SectionHeader tag="PRIORITIES" sub="Toggle strategic imperatives driving this engagement">Business Drivers</SectionHeader>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(195px, 1fr))', gap: 10 }}>
          {drivers.map((d, i) => (
            <div key={d.id} onClick={() => { const n = [...active]; n[i] = !n[i]; setActive(n); }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderRadius: t.r.md, cursor: 'pointer', transition: 'all 0.25s', background: active[i] ? d.color + '12' : t.bgGlass, border: `1px solid ${active[i] ? d.color + '40' : t.borderSubtle}` }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: active[i] ? d.color : t.textDim, boxShadow: active[i] ? `0 0 8px ${d.color}60` : 'none' }} />
              <span style={{ fontFamily: t.fontD, fontSize: 13, color: active[i] ? t.text : t.textMuted, fontWeight: active[i] ? 600 : 400 }}>{d.label}</span>
            </div>
          ))}
        </div>
      </GlassCard>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <GlassCard className="animate-fade-up delay-2">
          <SectionHeader tag="CONTEXT" sub="Key shifts in the last 24 months">What Changed?</SectionHeader>
          <textarea value={changes} onChange={e => setChanges(e.target.value)} rows={8} style={{ width: '100%', background: t.bgGlass, border: `1px solid ${t.border}`, borderRadius: t.r.md, color: t.text, fontFamily: t.fontB, fontSize: 13, padding: 14, resize: 'vertical', lineHeight: 1.6 }} />
        </GlassCard>
        <GlassCard className="animate-fade-up delay-3" accent={t.rose}>
          <SectionHeader tag="RISK MAP" sub="Risk factors impacting transformation">Business Risk Assessment</SectionHeader>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {risks.map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 14px', borderRadius: t.r.md, background: sc[r.sev] + '06', border: `1px solid ${sc[r.sev]}15` }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: sc[r.sev], marginTop: 5, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: t.fontD, fontSize: 13, fontWeight: 600, color: t.text }}>{r.area}</span>
                    <Chip color={sc[r.sev]}>{r.sev}</Chip>
                  </div>
                  <div style={{ fontFamily: t.fontB, fontSize: 11, color: t.textDim, marginTop: 3 }}>{r.impact}</div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
      <GlassCard className="animate-fade-up delay-4" accent={t.accent}>
        <SectionHeader tag="AMBITION" sub="How aggressively transform?">Transformation Ambition Scale</SectionHeader>
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <div style={{ flex: 1 }}>
            <input type="range" min={1} max={10} value={ambition} onChange={e => setAmbition(+e.target.value)} style={{ width: '100%', accentColor: ambition >= 7 ? t.accent : t.amber }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
              {['Incremental', 'Measured', 'Moderate', 'Ambitious', 'Aggressive'].map((l, i) => <span key={i} style={{ fontFamily: t.fontM, fontSize: 9, color: t.textDim }}>{l}</span>)}
            </div>
          </div>
          <div style={{ textAlign: 'center', minWidth: 80 }}>
            <div style={{ fontFamily: t.fontD, fontSize: 52, fontWeight: 900, color: ambition >= 7 ? t.accent : t.amber, lineHeight: 1, letterSpacing: -2 }}>{ambition}</div>
            <Mono size={9}>OF 10</Mono>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default ExecutiveContext;
