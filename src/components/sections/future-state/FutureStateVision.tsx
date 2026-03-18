import React from 'react';
import { useTheme } from '../../../theme/useTheme';
import { useWorkshopStore } from '../../../store/useWorkshopStore';
import { GlassCard, SectionHeader, SliderControl, PageHeader } from '../../shared/Primitives';

const FutureStateVision: React.FC = () => {
  const { t } = useTheme();
  const { visionSliders: sliders, visionPosture: posture, setVisionSlider, setVisionPosture } = useWorkshopStore();

  const postures = [
    { id: 'simplify', label: 'Rationalize & Simplify', desc: 'Reduce sprawl, consolidate carriers', icon: '◉', color: t.amber },
    { id: 'secure', label: 'Secure & Standardize', desc: 'Zero trust, unified policy', icon: '◈', color: t.rose },
    { id: 'cloud_accel', label: 'Cloud Accelerate', desc: 'Cloud-first fabric, SaaS uplift', icon: '◆', color: t.cyan },
    { id: 'scale_global', label: 'Scale Globally', desc: 'Multi-region, consistent experience', icon: '◇', color: t.emerald },
    { id: 'ma_integrate', label: 'M&A Integration', desc: 'Rapid onboarding, harmonization', icon: '▣', color: t.violet },
    { id: 'edge_ai', label: 'Edge Intelligence', desc: 'AI-ready edge, distributed compute', icon: '✦', color: t.lime },
    { id: 'reduce_drag', label: 'Reduce Op Drag', desc: 'AIOps, self-healing, managed svc', icon: '⚡', color: t.blue },
  ];
  const defs = [
    { key: 'secModel', label: 'Security Model', desc: 'Centralized ← → Distributed' },
    { key: 'netModel', label: 'Network Model', desc: 'Internet-First ← → Private' },
    { key: 'branchCtrl', label: 'Branch Model', desc: 'Central ← → Autonomy' },
    { key: 'cloudAdj', label: 'Cloud Adjacency', desc: 'Low ← → Critical' },
    { key: 'zeroTrust', label: 'Zero Trust', desc: 'Basic ← → Full ZT' },
    { key: 'observ', label: 'Observability', desc: 'Basic ← → Full-Stack' },
    { key: 'auto', label: 'Automation', desc: 'Manual ← → Intent-Based' },
    { key: 'resil', label: 'Resilience', desc: 'Standard ← → Always-On' },
    { key: 'aiEdge', label: 'AI/Edge', desc: 'None ← → Production' },
    { key: 'supportModel', label: 'Support', desc: 'In-House ← → Managed' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader title="Future-State Vision Builder" subtitle="Select transformation strategy and configure capability preferences." phase="5" accent={t.emerald} />
      <GlassCard className="animate-fade-up delay-1">
        <SectionHeader tag="STRATEGY" sub="Select primary posture">Transformation Posture</SectionHeader>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 10 }}>
          {postures.map(p => (
            <div key={p.id} onClick={() => setVisionPosture(p.id)} style={{ padding: '18px', borderRadius: t.r.lg, cursor: 'pointer', transition: 'all 0.3s', background: posture === p.id ? p.color + '12' : t.bgGlass, border: `1px solid ${posture === p.id ? p.color + '50' : t.borderSubtle}`, boxShadow: posture === p.id ? `0 0 20px ${p.color}12` : 'none' }}>
              <div style={{ fontFamily: t.fontD, fontSize: 20, color: posture === p.id ? p.color : t.textDim, marginBottom: 8 }}>{p.icon}</div>
              <div style={{ fontFamily: t.fontD, fontSize: 14, fontWeight: 700, color: posture === p.id ? p.color : t.text, marginBottom: 4 }}>{p.label}</div>
              <div style={{ fontFamily: t.fontB, fontSize: 11, color: t.textDim, lineHeight: 1.5 }}>{p.desc}</div>
            </div>
          ))}
        </div>
      </GlassCard>
      <GlassCard className="animate-fade-up delay-2">
        <SectionHeader tag="PREFERENCES" sub="Configure capability targets — changes flow to Architecture Environment">Architecture Sliders</SectionHeader>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 28px' }}>
          {defs.map(s => <SliderControl key={s.key} label={s.label} desc={s.desc} value={sliders[s.key]} onChange={v => setVisionSlider(s.key, v)} color={sliders[s.key] >= 7 ? t.emerald : t.accent} />)}
        </div>
      </GlassCard>
      <GlassCard className="animate-fade-up delay-3" accent={t.emerald} glow>
        <SectionHeader tag="SYNTHESIS" sub="Auto-generated narrative">Target Architecture Narrative</SectionHeader>
        <p style={{ fontFamily: t.fontB, fontSize: 14, color: t.text, lineHeight: 1.8, margin: 0 }}>
          Meridian Financial Group's target architecture envisions a <strong style={{ color: t.cyan }}>cloud-first network fabric</strong> anchored by <strong style={{ color: t.rose }}>zero trust security</strong> at level {sliders.zeroTrust}/10. Cloud adjacency rated critical ({sliders.cloudAdj}/10). Automation targets {sliders.auto >= 7 ? 'intent-based orchestration' : 'standardized runbooks'}. Operating model at level {sliders.supportModel}/10 maturity.
        </p>
      </GlassCard>
    </div>
  );
};

export default FutureStateVision;
