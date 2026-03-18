import React from 'react';
import { useTheme } from '../../theme/useTheme';
import { NAV, CUSTOMER } from '../../data/seed';
import { useWorkshopStore } from '../../store/useWorkshopStore';
import { Chip, PhaseTag } from '../shared/Primitives';
import ThemeToggle from '../shared/ThemeToggle';

const TopBar: React.FC = () => {
  const { t } = useTheme();
  const { activeTab: tab, copilotOpen: copilot, toggleCopilot } = useWorkshopStore();

  return (
    <div style={{
      height: 50, background: t.bgPanel, borderBottom: `1px solid ${t.border}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 20px', flexShrink: 0, boxShadow: t.shadow,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontFamily: t.fontD, fontSize: 15, fontWeight: 700, color: t.text }}>{NAV[tab]?.label}</span>
        {NAV[tab]?.phase && <PhaseTag color={t.accent}>Phase {NAV[tab].phase}</PhaseTag>}
        <Chip color={t.emerald}>● Live Session</Chip>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontFamily: t.fontM, fontSize: 11, color: t.textDim }}>{CUSTOMER.shortName} · {CUSTOMER.workshopDate}</span>
        <ThemeToggle size={26} />
        <button onClick={toggleCopilot} style={{
          display: 'flex', alignItems: 'center', gap: 7, padding: '6px 15px', borderRadius: t.r.sm,
          fontFamily: t.fontD, fontSize: 12, fontWeight: 600,
          border: `1px solid ${copilot ? t.cyan + '50' : t.border}`,
          background: copilot ? `${t.cyan}12` : 'transparent',
          color: copilot ? t.cyan : t.textMuted,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: copilot ? t.cyan : t.textDim, boxShadow: copilot ? `0 0 6px ${t.cyan}` : 'none' }} />
          AI Copilot
        </button>
      </div>
    </div>
  );
};

export default TopBar;
