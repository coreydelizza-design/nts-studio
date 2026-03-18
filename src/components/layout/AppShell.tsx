import React from 'react';
import { useTheme } from '../../theme/useTheme';
import { useWorkshopStore } from '../../store/useWorkshopStore';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import CopilotPanel from '../copilot/CopilotPanel';

interface Props {
  children: React.ReactNode;
}

const AppShell: React.FC<Props> = ({ children }) => {
  const { t } = useTheme();
  const { activeTab: tab, copilotOpen, toggleCopilot } = useWorkshopStore();

  return (
    <div style={{ display: 'flex', height: '100vh', background: t.bg, fontFamily: t.fontB, color: t.text, overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TopBar />
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <div
            key={tab}
            className={tab === 6 ? '' : 'animate-fade-up'}
            style={{ flex: 1, overflowY: tab === 6 ? 'hidden' : 'auto', padding: tab === 6 ? 0 : 20 }}
          >
            {children}
          </div>
          <CopilotPanel open={copilotOpen} onClose={toggleCopilot} />
        </div>
      </div>
    </div>
  );
};

export default AppShell;
