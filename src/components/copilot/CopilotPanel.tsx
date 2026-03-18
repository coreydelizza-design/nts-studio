import React from 'react';
import { useTheme } from '../../theme/useTheme';
import { Chip } from '../shared/Primitives';

const CopilotPanel: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const { t } = useTheme();
  if (!open) return null;

  const insights = [
    { type: 'risk', text: 'Security fragmentation across 5 vendors creates enforcement gaps. Unified SASE eliminates 3 platforms.', ic: '⚠', color: t.rose },
    { type: 'gap', text: 'No observability for cloud workloads — add DEM assessment for Salesforce and SAP.', ic: '❓', color: t.amber },
    { type: 'pattern', text: "Estate matches 'Distributed Enterprise with Legacy Core' archetype.", ic: '💡', color: t.cyan },
    { type: 'action', text: 'Schedule M&A deep-dive with Robert Tanaka — 45 acquired sites are highest-risk.', ic: '✅', color: t.emerald },
    { type: 'risk', text: 'Cisco ASA fleet reaches EoS Q3 2026. Migration should begin in 90-day phase.', ic: '⚠', color: t.rose },
    { type: 'pattern', text: 'Branch standardization has largest maturity gap (Δ3.0) — highest-impact area.', ic: '💡', color: t.cyan },
    { type: 'action', text: 'Align budget to FY27 cycle — procurement window closes in 6 months.', ic: '✅', color: t.emerald },
  ];

  return (
    <div style={{ width: 310, background: t.bgCard, borderLeft: `1px solid ${t.border}`, display: 'flex', flexDirection: 'column', flexShrink: 0, backdropFilter: 'blur(16px)' }}>
      <div style={{ padding: '16px 18px', borderBottom: `1px solid ${t.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="animate-pulse-glow" style={{ width: 8, height: 8, borderRadius: '50%', background: t.cyan }} />
          <span style={{ fontFamily: t.fontD, fontSize: 13, fontWeight: 700, color: t.text }}>AI Workshop Copilot</span>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: t.textDim, fontSize: 16 }}>×</button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span style={{ fontFamily: t.fontM, fontSize: 9, color: t.textDim, letterSpacing: 2 }}>WORKSHOP INSIGHTS</span>
        {insights.map((ins, i) => (
          <div key={i} style={{ padding: '10px 12px', borderRadius: t.r.md, background: `${ins.color}06`, border: `1px solid ${ins.color}12` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span style={{ fontSize: 12 }}>{ins.ic}</span><Chip color={ins.color}>{ins.type}</Chip>
            </div>
            <div style={{ fontFamily: t.fontB, fontSize: 12, color: t.textSoft, lineHeight: 1.55 }}>{ins.text}</div>
          </div>
        ))}
      </div>
      <div style={{ padding: 14, borderTop: `1px solid ${t.border}` }}>
        <textarea placeholder="Ask the copilot..." rows={2} style={{ width: '100%', background: t.bgGlass, border: `1px solid ${t.border}`, borderRadius: t.r.md, color: t.text, fontFamily: t.fontB, fontSize: 12, padding: 10, resize: 'none' }} />
        <button style={{ width: '100%', marginTop: 8, padding: 10, borderRadius: t.r.sm, border: 'none', background: `linear-gradient(135deg, ${t.accent}, ${t.cyan})`, color: '#fff', fontFamily: t.fontD, fontSize: 12, fontWeight: 600 }}>Generate Insight</button>
      </div>
    </div>
  );
};

export default CopilotPanel;
