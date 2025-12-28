
import React from 'react';
import { Logo } from './common/Logo';
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
    { name: 'Overview', icon: <HomeIcon />, view: View.ClientOverview },
    { name: 'Dashboard', icon: <DashboardIcon />, view: View.Dashboard },
    { name: 'Workflow', icon: <ClipboardCheckIcon />, view: View.Tasks },
    { name: 'Timesheets', icon: <ClockIcon />, view: View.Timesheets },
    { name: 'Govt Portals', icon: <BuildingIcon />, view: View.Portal }, 
    { name: 'Regulatory', icon: <NewsIcon />, view: View.Regulatory },
    { name: 'Taxation', icon: <DocumentIcon />, view: View.TaxFiling },
    { name: 'Compliance', icon: <BriefcaseIcon />, view: View.Compliance },
    { name: 'Advisory AI', icon: <SparklesIcon />, view: View.Advisory },
    { name: 'Billing', icon: <CreditCardIcon />, view: View.Billing },
    { name: 'Documents', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>, view: View.Documents },
  ];

  const containerClasses = `
    fixed lg:relative top-0 left-0 h-full w-64 bg-[var(--bg-surface)] 
    flex flex-col border-r border-[var(--border-subtle)] transition-transform duration-300 z-50 lg:z-10
    ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
  `;

  return (
    <aside className={containerClasses}>
      {/* Mobile Close */}
      <button onClick={onClose} className="lg:hidden absolute top-4 right-4 p-2 text-[var(--text-secondary)]">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
      </button>

      <div className="p-4">
        {/* Firm Brand / Logo */}
        <div className="mb-6 px-2">
            <Logo className="w-8 h-8" textClassName="text-lg" />
        </div>

        {/* Client Switcher - Compact & Modern */}
        <div className="mb-6">
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                    <div className="w-2 h-2 rounded-full bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.5)]"></div>
                </div>
                <select 
                    value={selectedClient?.id}
                    onChange={(e) => {
                        const client = clients.find(c => c.id === e.target.value);
                        if (client) onClientChange(client);
                    }}
                    className="w-full pl-7 pr-8 py-2 bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] rounded-lg text-xs font-medium text-[var(--text-primary)] focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 outline-none appearance-none cursor-pointer transition-colors hover:border-[var(--border-strong)]"
                >
                    {clients.map(client => (
                        <option key={client.id} value={client.id}>{client.name}</option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[var(--text-secondary)]">
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
            </div>
            <div className="flex justify-between mt-2 px-1">
                 <button onClick={onAddClient} className="text-[10px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">+ New Client</button>
                 <button onClick={onEditClient} className="text-[10px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Manage</button>
            </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 space-y-0.5">
        {navItems.map((item) => (
            <button
                key={item.name}
                onClick={() => setActiveView(item.view)}
                className={`w-full flex items-center px-3 py-2 rounded-md text-xs font-medium transition-all duration-200 group ${
                    activeView === item.view
                    ? 'bg-zinc-100 dark:bg-zinc-800 text-[var(--text-primary)] shadow-sm'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]'
                }`}
            >
                <span className={`mr-3 w-4 h-4 ${activeView === item.view ? 'text-teal-600 dark:text-teal-400' : 'text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)]'}`}>
                    {item.icon}
                </span>
                {item.name}
            </button>
        ))}

        <div className="pt-6 pb-2 px-3">
            <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">System</p>
        </div>
        
        <button
            onClick={() => setActiveView(View.AuditLog)}
            className={`w-full flex items-center px-3 py-2 rounded-md text-xs font-medium transition-all ${
                activeView === View.AuditLog ? 'bg-zinc-100 dark:bg-zinc-800 text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)]'
            }`}
        >
            <span className="mr-3 w-4 h-4 text-[var(--text-tertiary)]"><ShieldCheckIcon /></span>
            Audit Logs
        </button>
        <button
            onClick={() => setActiveView(View.Settings)}
            className={`w-full flex items-center px-3 py-2 rounded-md text-xs font-medium transition-all ${
                activeView === View.Settings ? 'bg-zinc-100 dark:bg-zinc-800 text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)]'
            }`}
        >
            <span className="mr-3 w-4 h-4 text-[var(--text-tertiary)]"><SettingsIcon /></span>
            Settings
        </button>
      </nav>

      <div className="p-4 border-t border-[var(--border-subtle)]">
          <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-400 to-emerald-500 p-[1px]">
                  <div className="w-full h-full rounded-full bg-[var(--bg-surface)] flex items-center justify-center">
                        <span className="text-[10px] font-bold">Pro</span>
                  </div>
              </div>
              <div className="flex-1">
                  <p className="text-xs font-medium text-[var(--text-primary)]">AuditEra Pro</p>
                  <p className="text-[10px] text-[var(--text-secondary)]">v2.4.0 (Stable)</p>
              </div>
          </div>
      </div>
    </aside>
  );
};

export default Sidebar;
