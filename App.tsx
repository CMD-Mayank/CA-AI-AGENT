import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import Dashboard from './components/Dashboard';
import TaxFiling from './components/TaxFiling';
import Compliance from './components/Compliance';
import Forecasting from './components/Forecasting';
import { View } from './types';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>(View.Advisory);

  const renderContent = () => {
    switch (activeView) {
      case View.Dashboard:
        return <Dashboard />;
      case View.TaxFiling:
        return <TaxFiling />;
      case View.Compliance:
        return <Compliance />;
      case View.Forecasting:
        return <Forecasting />;
      case View.Advisory:
      default:
        return <ChatInterface />;
    }
  };

  return (
    <div className="flex h-screen font-sans bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-slate-100">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <main className="flex-1 flex flex-col h-screen">
         <div className="flex-1 overflow-y-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
