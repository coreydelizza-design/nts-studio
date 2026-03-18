import React from 'react';
import { useTheme } from '../../theme/useTheme';

/* ═══════════════════════════════════════════════════
   GLASS CARD
   ═══════════════════════════════════════════════════ */
interface GlassCardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  onClick?: () => void;
  accent?: string;
  glow?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, style, className = '', onClick, accent, glow }) => {
  const { t, isDark } = useTheme();
  return (
    <div onClick={onClick} className={`card-hover ${className}`} style={{
      background: t.bgCard, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
      border: `1px solid ${accent ? accent + '30' : t.border}`, borderRadius: t.r.lg, padding: 22,
      position: 'relative', overflow: 'hidden', cursor: onClick ? 'pointer' : 'default',
      boxShadow: glow
        ? `0 0 24px ${(accent || t.accent)}12, inset 0 1px 0 rgba(255,255,255,${isDark ? '0.03' : '0.4'})`
        : isDark ? '0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.03)' : '0 4px 24px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.5)',
      ...style,
    }}>
      {accent && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${accent}60, transparent)` }} />}
      {children}
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   SECTION HEADER
   ═══════════════════════════════════════════════════ */
export const SectionHeader: React.FC<{ children: React.ReactNode; sub?: string; accent?: string; tag?: string }> = ({ children, sub, accent, tag }) => {
  const { t } = useTheme();
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {tag && <span style={{ fontFamily: t.fontM, fontSize: 10, color: accent || t.accent, background: `${accent || t.accent}12`, padding: '2px 8px', borderRadius: 4, letterSpacing: 1.5, fontWeight: 600 }}>{tag}</span>}
        <h3 style={{ fontFamily: t.fontD, fontSize: 15, fontWeight: 700, color: t.text, letterSpacing: 0.3, margin: 0 }}>{children}</h3>
      </div>
      {sub && <p style={{ fontFamily: t.fontB, fontSize: 12, color: t.textDim, margin: '5px 0 0' }}>{sub}</p>}
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   CHIP / BADGE
   ═══════════════════════════════════════════════════ */
export const Chip: React.FC<{ children: React.ReactNode; color?: string; size?: 'sm' | 'md'; small?: boolean; onClick?: () => void }> = ({ children, color, size = 'sm', small, onClick }) => {
  const { t } = useTheme();
  const c = color || t.accent;
  return (
    <span onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: small ? '1px 6px' : size === 'sm' ? '3px 10px' : '5px 14px',
      borderRadius: 20, fontFamily: t.fontB,
      fontSize: small ? 8 : size === 'sm' ? 11 : 12, fontWeight: 600, letterSpacing: 0.3,
      background: `${c}15`, color: c, border: `1px solid ${c}25`,
      cursor: onClick ? 'pointer' : 'default', transition: 'all 0.2s',
    }}>{children}</span>
  );
};

/* ═══════════════════════════════════════════════════
   PHASE TAG
   ═══════════════════════════════════════════════════ */
export const PhaseTag: React.FC<{ children: React.ReactNode; color: string }> = ({ children, color }) => (
  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, fontWeight: 700, color, background: `${color}15`, padding: '2px 7px', borderRadius: 3, letterSpacing: 1, textTransform: 'uppercase' }}>{children}</span>
);

/* ═══════════════════════════════════════════════════
   METRIC BLOCK
   ═══════════════════════════════════════════════════ */
export const MetricBlock: React.FC<{ label: string; value: string; sub?: string; color?: string }> = ({ label, value, sub, color }) => {
  const { t } = useTheme();
  const c = color || t.accent;
  return (
    <div>
      <div style={{ fontFamily: t.fontM, fontSize: 10, color: t.textDim, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: t.fontD, fontSize: 28, fontWeight: 800, color: t.text, lineHeight: 1, letterSpacing: -1 }}>{value}</div>
      {sub && <div style={{ fontFamily: t.fontB, fontSize: 11, color: c, marginTop: 5, fontWeight: 500 }}>{sub}</div>}
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   BAR METER
   ═══════════════════════════════════════════════════ */
export const BarMeter: React.FC<{ value: number; max?: number; color?: string; h?: number; label?: string }> = ({ value, max = 100, color, h = 5, label }) => {
  const { t } = useTheme();
  const c = color || t.accent;
  return (
    <div>
      {label && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontFamily: t.fontB, fontSize: 12, color: t.textMuted }}>{label}</span>
        <span style={{ fontFamily: t.fontM, fontSize: 11, fontWeight: 600, color: c }}>{Math.round((value / max) * 100)}%</span>
      </div>}
      <div style={{ width: '100%', height: h, background: 'rgba(51,65,85,0.3)', borderRadius: h, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${Math.min((value / max) * 100, 100)}%`, background: `linear-gradient(90deg, ${c}cc, ${c})`, borderRadius: h, transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)', boxShadow: `0 0 8px ${c}40` }} />
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   SLIDER CONTROL
   ═══════════════════════════════════════════════════ */
export const SliderControl: React.FC<{ value: number; onChange: (v: number) => void; min?: number; max?: number; label: string; desc?: string; color?: string }> = ({ value, onChange, min = 0, max = 10, label, desc, color }) => {
  const { t } = useTheme();
  const c = color || t.accent;
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
        <div>
          <span style={{ fontFamily: t.fontB, fontSize: 13, color: t.text, fontWeight: 500 }}>{label}</span>
          {desc && <span style={{ fontFamily: t.fontB, fontSize: 11, color: t.textDim, marginLeft: 8 }}>{desc}</span>}
        </div>
        <span style={{ fontFamily: t.fontM, fontSize: 13, fontWeight: 700, color: c, minWidth: 30, textAlign: 'right' }}>{value}</span>
      </div>
      <input type="range" min={min} max={max} value={value} onChange={e => onChange(+e.target.value)} style={{ width: '100%', accentColor: c }} />
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   PAGE HEADER
   ═══════════════════════════════════════════════════ */
export const PageHeader: React.FC<{ title: string; subtitle: string; accent?: string; phase?: string }> = ({ title, subtitle, accent, phase }) => {
  const { t } = useTheme();
  const a = accent || t.accent;
  return (
    <div className="animate-fade-up" style={{
      background: `linear-gradient(135deg, ${a}08, ${t.bgGlass})`,
      border: `1px solid ${a}20`, borderRadius: t.r.xl, padding: '24px 28px',
      position: 'relative', overflow: 'hidden', marginBottom: 4,
    }}>
      <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, background: `radial-gradient(circle, ${a}06, transparent 70%)`, pointerEvents: 'none' }} />
      <div>
        {phase && <PhaseTag color={a}>Phase {phase} of 9</PhaseTag>}
        <h2 style={{ fontFamily: t.fontD, fontSize: 22, fontWeight: 800, color: t.text, margin: phase ? '6px 0 0' : 0, letterSpacing: -0.5 }}>{title}</h2>
        <p style={{ fontFamily: t.fontB, fontSize: 13, color: t.textMuted, margin: '4px 0 0' }}>{subtitle}</p>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   MONO LABEL
   ═══════════════════════════════════════════════════ */
export const Mono: React.FC<{ children: React.ReactNode; color?: string; size?: number }> = ({ children, color, size = 9 }) => {
  const { t } = useTheme();
  return (
    <span style={{ fontFamily: t.fontM, fontSize: size, color: color || t.textDim, letterSpacing: 1.2, textTransform: 'uppercase', fontWeight: 600 }}>{children}</span>
  );
};
