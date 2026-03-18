import React from 'react';
import { useTheme } from '../../../theme/useTheme';
import { GlassCard, SectionHeader, PageHeader } from '../../shared/Primitives';

const Deliverables: React.FC = () => {
  const { t } = useTheme();
  const outputs = [
    { title: 'Executive Readout', desc: 'C-level findings, alignment, path', icon: '📋', color: t.accent },
    { title: 'Technical Summary', desc: 'Estate, pain, maturity analysis', icon: '📄', color: t.cyan },
    { title: 'Architecture Brief', desc: 'Current/target with rationale', icon: '🏗', color: t.violet },
    { title: 'Action Plan', desc: 'Next steps, owners, quick wins', icon: '✅', color: t.emerald },
    { title: 'Discovery Gaps', desc: 'Open questions, assumptions', icon: '❓', color: t.amber },
    { title: 'Proposal Input', desc: 'Requirements, scope, commercial', icon: '📝', color: t.rose },
    { title: 'Roadmap Summary', desc: '10-workstream phased plan', icon: '🗺', color: t.lime },
    { title: 'Stakeholder Briefs', desc: 'Per-stakeholder action items', icon: '👥', color: t.orange },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader title="Workshop Deliverables" subtitle="Generate polished end-of-session outputs." phase="9" accent={t.emerald} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
        {outputs.map((o, i) => (
          <GlassCard key={i} accent={o.color} className={`animate-fade-up delay-${Math.min(i + 1, 5)}`}>
            <div style={{ display: 'flex', gap: 14 }}>
              <span style={{ fontSize: 30 }}>{o.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: t.fontD, fontSize: 15, fontWeight: 700, color: t.text }}>{o.title}</div>
                <div style={{ fontFamily: t.fontB, fontSize: 12, color: t.textDim, marginTop: 4 }}>{o.desc}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button style={{ flex: 1, padding: '10px 14px', borderRadius: t.r.sm, border: `1px solid ${o.color}35`, background: o.color + '10', color: o.color, fontFamily: t.fontD, fontSize: 12, fontWeight: 600 }}>Generate</button>
              <button style={{ padding: '10px 14px', borderRadius: t.r.sm, border: `1px solid ${t.border}`, background: t.bgGlass, color: t.textMuted, fontFamily: t.fontD, fontSize: 12 }}>↓</button>
            </div>
          </GlassCard>
        ))}
      </div>
      <GlassCard accent={t.accent} glow>
        <SectionHeader tag="PREVIEW" sub="Auto-generated from session">Executive Readout — MFG</SectionHeader>
        <div style={{ padding: '20px 24px', background: t.bgGlass, borderRadius: t.r.md, border: `1px solid ${t.borderSubtle}` }}>
          <p style={{ fontFamily: t.fontB, fontSize: 14, color: t.text, lineHeight: 1.8, margin: '0 0 14px' }}>Meridian Financial Group operates 187 sites across 14 countries with critical legacy dependencies, 45 acquired sites pending integration, and board-mandated zero trust. Security fragmentation (5 platforms), carrier sprawl, and manual operations are top constraints.</p>
          <p style={{ fontFamily: t.fontB, fontSize: 14, color: t.text, lineHeight: 1.8, margin: '0 0 14px' }}>A Balanced path is recommended: SD-WAN pilot and SASE PoC in 90 days, zero trust and multi-cloud NaaS over 12 months, complete standardization within 24 months.</p>
          <p style={{ fontFamily: t.fontB, fontSize: 13, color: t.textMuted, margin: 0, fontStyle: 'italic' }}>Next: (1) Technical deep-dives (2) PoC scope (3) Commercial proposal (4) Executive alignment.</p>
        </div>
      </GlassCard>
    </div>
  );
};

export default Deliverables;
