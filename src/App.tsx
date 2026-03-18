import React from 'react';
import { useWorkshopStore } from './store/useWorkshopStore';
import AppShell from './components/layout/AppShell';
import ErrorBoundary from './components/shared/ErrorBoundary';
import CommandCenter from './components/sections/command-center';
import ExecutiveContext from './components/sections/executive-context';
import EstateMapper from './components/sections/estate-mapper';
import PainEngine from './components/sections/pain-engine';
import MaturityAssessment from './components/sections/maturity-assessment';
import FutureStateVision from './components/sections/future-state';
import ArchitectureStudio from './components/sections/architecture-studio';
import TradeoffLab from './components/sections/tradeoff-lab';
import TransformationRoadmap from './components/sections/roadmap';
import Deliverables from './components/sections/deliverables';

const TABS: Record<number, React.FC> = {
  0: CommandCenter,
  1: ExecutiveContext,
  2: EstateMapper,
  3: PainEngine,
  4: MaturityAssessment,
  5: FutureStateVision,
  6: ArchitectureStudio,
  7: TradeoffLab,
  8: TransformationRoadmap,
  9: Deliverables,
};

const App: React.FC = () => {
  const { activeTab } = useWorkshopStore();
  const TabComponent = TABS[activeTab] || CommandCenter;

  return (
    <AppShell>
      <ErrorBoundary key={activeTab}>
        <TabComponent />
      </ErrorBoundary>
    </AppShell>
  );
};

export default App;
