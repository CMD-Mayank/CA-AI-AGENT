
import React from 'react';
import { DashboardIcon } from './icons/DashboardIcon';
import { DocumentIcon } from './icons/DocumentIcon';
import { BriefcaseIcon } from './icons/BriefcaseIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { CreditCardIcon } from './icons/CreditCardIcon';
import { ClipboardCheckIcon } from './icons/ClipboardCheckIcon';
import { NewsIcon } from './icons/NewsIcon';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import { HomeIcon } from './icons/HomeIcon';
import { ClockIcon } from './icons/ClockIcon';
import { QuestionMarkIcon } from './icons/QuestionMarkIcon';
import { BuildingIcon } from './icons/BuildingIcon';
import { View, Client, FirmProfile } from '../types';


interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
  clients: Client[];
  selectedClient: Client;
  onClientChange: (client: Client) => void;
  onAddClient: () => void;
  onEditClient: () => void;
  firmProfile?: FirmProfile;
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, clients, selectedClient, onClientChange, onAddClient, onEditClient, firmProfile, isOpen, onClose }) => {
  const navItems = [
    { name: 'Client Overview', icon: <HomeIcon />, view: View.ClientOverview },
    { name: 'Firm Dashboard', icon: <DashboardIcon />, view: View.Dashboard },
    { name: 'Workflow & Tasks', icon: <ClipboardCheckIcon />, view: View.Tasks },
    { name: 'Timesheets & Profit', icon: <ClockIcon />, view: View.Timesheets },
    { name: 'Govt Portals', icon: <BuildingIcon />, view: View.Portal }, // New Item
    { name: 'Knowledge Bank', icon: <NewsIcon />, view: View.Regulatory },
    { name: 'Tax Computation', icon: <DocumentIcon />, view: View.TaxFiling },
    { name: 'Compliance & Audit', icon: <BriefcaseIcon />, view: View.Compliance },
    { name: 'Advisory Assistant', icon: <SparklesIcon />, view: View.Advisory },
    { name: 'Billing & Invoices', icon: <CreditCardIcon />, view: View.Billing },
    { name: 'Client Records', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>, view: View.Documents },
  ];

  const containerClasses = `
    fixed lg:relative top-0 left-0 h-full w-72 bg-white dark:bg-slate-800 
    flex flex-col border-r border-gray-200 dark:border-slate-700 transition-transform duration-300 z-50 lg:z-10
    ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
  `;

  return (
    <aside className={containerClasses}>
      {/* Mobile Close Button */}
      <button 
        onClick={onClose}
        className="lg:hidden absolute top-4 right-4 p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
      </button>

      <div className="p-6 pb-0">
        {/* White-Labeled Firm Header */}
        <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-primary-700 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md flex-shrink-0">
                {firmProfile?.name ? firmProfile.name.charAt(0).toUpperCase() : 'AE'}
            </div>
            <div className="overflow-hidden">
                <span className="font-bold text-lg text-gray-800 dark:text-white block leading-tight truncate" title={firmProfile?.name}>
                    {firmProfile?.name || 'AuditEra'}
                </span>
                <span className="text-[10px] text-gray-500 dark:text-slate-400 font-medium uppercase tracking-wide">
                    {firmProfile?.frn ? `FRN: ${firmProfile.frn}` : 'Enterprise Edition'}
                </span>
            </div>
        </div>

        <div className="mb-6">
            <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex justify-between items-center">
                <span>Active Client File</span>
                <button 
                    onClick={onAddClient}
                    className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-[10px] font-bold border border-primary-200 dark:border-primary-800 rounded px-1.5 py-0.5 transition-colors"
                >
                    + NEW
                </button>
            </label>
            <div className="relative flex items-center gap-2">
                <div className="relative flex-1">
                    <select 
                        value={selectedClient?.id}
                        onChange={(e) => {
                            const client = clients.find(c => c.id === e.target.value);
                            if (client) onClientChange(client);
                        }}
                        className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg text-sm font-medium text-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none appearance-none cursor-pointer truncate pr-6"
                    >
                        {clients.map(client => (
                            <option key={client.id} value={client.id}>
                                {client.name}
                            </option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-slate-300">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                </div>
                <button 
                    onClick={onEditClient}
                    className="p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    title="Manage Client Details"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </button>
            </div>
            <div className="mt-2 px-1 flex justify-between text-xs text-gray-500 dark:text-slate-400">
                <span>{selectedClient?.type}</span>
                <span>{selectedClient?.pan}</span>
            </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-4">
        <p className="px-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">Practice Tools</p>
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.name}>
              <button
                onClick={() => setActiveView(item.view)}
                className={`w-full flex items-center p-3 rounded-lg text-sm font-medium transition-colors ${
                  activeView === item.view
                    ? 'bg-primary-50 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 border border-primary-100 dark:border-primary-800'
                    : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700/50 border border-transparent'
                }`}
              >
                <span className="mr-3 w-5 h-5 opacity-80">{item.icon}</span>
                {item.name}
              </button>
            </li>
          ))}
        </ul>

        <p className="px-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2 mt-8">System</p>
        <ul className="space-y-1">
             <li>
              <button
                onClick={() => setActiveView(View.AuditLog)}
                className={`w-full flex items-center p-3 rounded-lg text-sm font-medium transition-colors ${
                  activeView === View.AuditLog
                    ? 'bg-primary-50 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300'
                    : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700/50'
                }`}
              >
                <span className="mr-3 w-5 h-5 opacity-80"><ShieldCheckIcon /></span>
                Audit Trail
              </button>
            </li>
             <li>
              <button
                onClick={() => setActiveView(View.Settings)}
                className={`w-full flex items-center p-3 rounded-lg text-sm font-medium transition-colors ${
                  activeView === View.Settings
                    ? 'bg-primary-50 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300'
                    : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700/50'
                }`}
              >
                <span className="mr-3 w-5 h-5 opacity-80"><SettingsIcon /></span>
                Admin Console
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveView(View.Help)}
                className={`w-full flex items-center p-3 rounded-lg text-sm font-medium transition-colors ${
                  activeView === View.Help
                    ? 'bg-primary-50 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300'
                    : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700/50'
                }`}
              >
                <span className="mr-3 w-5 h-5 opacity-80"><QuestionMarkIcon /></span>
                Help & Support
              </button>
            </li>
        </ul>
      </nav>
      <div className="p-4 m-4 bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-xl shadow-lg">
          <h4 className="font-semibold text-sm">Practice Plan</h4>
          <p className="text-xs text-gray-300 mt-1">Commercial License</p>
          <button 
            onClick={() => setActiveView(View.Settings)}
            className="mt-3 w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white py-1.5 px-3 rounded-md text-xs font-semibold transition-colors"
          >
              Manage Access
          </button>
      </div>
    </aside>
  );
};

export default Sidebar;
