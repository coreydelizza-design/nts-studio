import React from 'react';
import { useTheme } from '../../theme/useTheme';
import { NAV } from '../../data/seed';
import { useWorkshopStore } from '../../store/useWorkshopStore';

const Sidebar: React.FC = () => {
  const { t, isDark } = useTheme();
  const { activeTab: tab, setActiveTab: setTab, sidebarCollapsed: collapsed, toggleSidebar } = useWorkshopStore();

  return (
    <div style={{
      width: collapsed ? 58 : 230, background: t.bgPanel, borderRight: `1px solid ${t.border}`,
      display: 'flex', flexDirection: 'column', transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1)',
      flexShrink: 0, overflow: 'hidden',
      boxShadow: isDark ? '4px 0 24px rgba(0,0,0,0.2)' : '4px 0 24px rgba(0,0,0,0.04)',
    }}>
      {/* Brand */}
      <div style={{ padding: collapsed ? '16px 8px' : '20px 18px', borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', gap: 11, minHeight: 64 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 9, flexShrink: 0,
          background: `linear-gradient(135deg, ${t.emerald}, #059669)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: t.fontD, fontSize: 10, fontWeight: 900, color: '#fff', letterSpacing: 0.5,
          boxShadow: `0 0 14px ${t.emerald}30`,
        }}>GTT</div>
        {!collapsed && (
          <div>
            <div style={{ fontFamily: t.fontD, fontSize: 13, fontWeight: 800, color: t.text, lineHeight: 1.1, letterSpacing: -0.3 }}>NETWORK</div>
            <div style={{ fontFamily: t.fontM, fontSize: 8, color: t.accent, letterSpacing: 2.5, fontWeight: 600 }}>TRANSFORM STUDIO</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <div style={{ flex: 1, padding: '8px 6px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
        {collapsed && <div style={{ fontFamily: t.fontM, fontSize: 7, color: t.textDim, textAlign: 'center', letterSpacing: 2, marginBottom: 4 }}>NAV</div>}
        {NAV.map(item => (
          <div key={item.id} onClick={() => setTab(item.id)} title={item.label}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: collapsed ? '9px 0' : '9px 13px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              borderRadius: t.r.sm, cursor: 'pointer', transition: 'all 0.2s',
              background: tab === item.id ? `${t.accent}12` : 'transparent',
              borderLeft: tab === item.id ? `2px solid ${t.accent}` : '2px solid transparent',
              color: tab === item.id ? t.accent : t.textMuted,
            }}>
            <span style={{ fontSize: 13, fontFamily: t.fontD, width: 17, textAlign: 'center', flexShrink: 0, filter: tab === item.id ? `drop-shadow(0 0 4px ${t.accent}60)` : 'none' }}>{item.icon}</span>
            {!collapsed && <span style={{ fontFamily: t.fontD, fontSize: 12, fontWeight: tab === item.id ? 600 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>}
          </div>
        ))}
      </div>

      {/* Collapse */}
      <div style={{ padding: 7, borderTop: `1px solid ${t.border}` }}>
        <button onClick={toggleSidebar} style={{ width: '100%', padding: 7, borderRadius: t.r.sm, border: 'none', background: t.bgHover, color: t.textDim, fontFamily: t.fontB, fontSize: 11 }}>
          {collapsed ? '›' : '‹ Collapse'}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
