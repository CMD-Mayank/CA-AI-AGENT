import React from 'react';
import { DashboardIcon } from './icons/DashboardIcon';
import { DocumentIcon } from './icons/DocumentIcon';
import { BriefcaseIcon } from './icons/BriefcaseIcon';
import { ChartIcon } from './icons/ChartIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { View } from '../types';


interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  const navItems = [
    { name: 'Dashboard', icon: <DashboardIcon />, view: View.Dashboard },
    { name: 'Tax Filing & Optimization', icon: <DocumentIcon />, view: View.TaxFiling },
    { name: 'GST, TDS & ROC', icon: <BriefcaseIcon />, view: View.Compliance },
    { name: 'Conversational Advisory', icon: <SparklesIcon />, view: View.Advisory },
    { name: 'Financial Forecasting', icon: <ChartIcon />, view: View.Forecasting },
  ];

  return (
    <aside className="w-72 bg-white dark:bg-slate-800 p-6 flex-shrink-0 flex flex-col border-r border-gray-200 dark:border-slate-700">
      <div className="flex items-center space-x-3 mb-10">
        <span className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md">
          CA
        </span>
        <span className="font-bold text-xl text-gray-800 dark:text-white">AI Agent</span>
      </div>
      <nav className="flex-1">
        <p className="px-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">Modules</p>
        <ul>
          {navItems.map((item) => (
            <li key={item.name} className="mb-2">
              <button
                onClick={() => setActiveView(item.view)}
                className={`w-full flex items-center p-3 rounded-lg text-sm font-medium transition-colors ${
                  activeView === item.view
                    ? 'bg-teal-50 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300'
                    : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700/50'
                }`}
              >
                <span className="mr-4 w-5 h-5">{item.icon}</span>
                {item.name}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-auto p-4 bg-gray-100 dark:bg-slate-700/50 rounded-lg">
          <h4 className="font-semibold text-gray-800 dark:text-slate-100">Unlock Full Potential</h4>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Access CFO-grade insights and enterprise features.</p>
          <button className="mt-4 w-full bg-teal-600 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-teal-700 transition-colors shadow-sm hover:shadow-md">
              Upgrade to Pro
          </button>
      </div>
    </aside>
  );
};

export default Sidebar;
