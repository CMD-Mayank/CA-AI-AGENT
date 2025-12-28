
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import Dashboard from './components/Dashboard';
import TaxFiling from './components/TaxFiling';
import Compliance from './components/Compliance';
import Forecasting from './components/Forecasting';
import Settings from './components/Settings';
import { Documents } from './components/Documents';
import Billing from './components/Billing';
import { Tasks } from './components/Tasks';
import { RegulatoryUpdates } from './components/RegulatoryUpdates';
import { Auth } from './components/Auth';
import { GlobalHeader } from './components/GlobalHeader';
import { DisclaimerModal } from './components/common/DisclaimerModal';
import { AddClientModal } from './components/AddClientModal';
import { ClientSettingsModal } from './components/ClientSettingsModal';
import { LockScreen } from './components/LockScreen';
import { AuditLogs } from './components/AuditLogs';
import { ClientOverview } from './components/ClientOverview';
import { Timesheets } from './components/Timesheets';
import { HelpSupport } from './components/HelpSupport';
import { PortalSync } from './components/PortalSync';
import { LandingPage } from './components/LandingPage';
import { SuperAdminDashboard } from './components/SuperAdminDashboard';
import { TeamManagement } from './components/TeamManagement';
import { ServiceWorkflows } from './components/ServiceWorkflows';
import { KYCVault } from './components/KYCVault';
import { FirmIntelligence } from './components/FirmIntelligence';
import { storageService } from './services/storage';
import { View, Client, FirmProfile, ThemeColor } from './types';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>(View.Dashboard);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [themeColor, setThemeColor] = useState<ThemeColor>('teal');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [showEditClientModal, setShowEditClientModal] = useState(false);
  const [firmProfile, setFirmProfile] = useState<FirmProfile | undefined>(undefined);
  const [userEmail, setUserEmail] = useState<string>('');
  const [userRole, setUserRole] = useState<string>('staff');
  const [pendingPrompt, setPendingPrompt] = useState<string>('');

  useEffect(() => {
    const storedTheme = storageService.getTheme();
    setDarkMode(storedTheme);
    if (storedTheme) document.documentElement.classList.add('dark');
    const storedColor = storageService.getThemeColor();
    setThemeColor(storedColor);
    document.documentElement.setAttribute('data-theme', storedColor);
    
    // Check if professional disclaimer needs to be shown
    setShowDisclaimer(!storageService.hasSeenDisclaimer());
    
    checkSession();
  }, []);

  const checkSession = async () => {
      const session = await storageService.getUserSession();
      if (session) {
          setIsAuthenticated(true);
          setShowLanding(false);
          setUserEmail(session.email);
          setUserRole(session.role);
          await loadFirmData();
      } else {
          setIsAuthenticated(false);
      }
      setIsLoading(false);
  };

  const loadFirmData = async () => {
      const profile = storageService.getFirmProfile(); 
      if (profile) setFirmProfile(profile);

      try {
          let storedClients = await storageService.getClients();
          if (storedClients.length === 0) {
             await storageService.seedDemoData();
             storedClients = await storageService.getClients();
          }
          if (storedClients && storedClients.length > 0) {
              setClients(storedClients);
              setSelectedClient(storedClients[0]);
          } else {
              setClients([]);
              setSelectedClient(null);
          }
      } catch (e) {
          console.error("Error loading clients", e);
      }
  };

  const toggleTheme = () => {
      const newMode = !darkMode;
      setDarkMode(newMode);
      storageService.saveTheme(newMode);
      if (newMode) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
  };

  const changeThemeColor = (color: ThemeColor) => {
      setThemeColor(color);
      storageService.saveThemeColor(color);
      document.documentElement.setAttribute('data-theme', color);
  };

  const handleLogout = async () => {
      await storageService.signOut();
      setIsAuthenticated(false);
      setShowLanding(true);
      setActiveView(View.Dashboard);
  };

  const handleAddClient = async (newClientData: Client) => {
    const added = await storageService.addClient(newClientData);
    if (added) {
        setClients([added, ...clients]);
        setSelectedClient(added);
        setActiveView(View.ClientOverview);
    }
  };

  const renderContent = () => {
    if (activeView === View.SuperAdmin) return <SuperAdminDashboard />;
    if (activeView === View.Settings) return <Settings onLogout={handleLogout} onFirmUpdate={p => { setFirmProfile(p); storageService.saveFirmProfile(p); }} currentFirmProfile={firmProfile} activeTheme={themeColor} onThemeChange={changeThemeColor} userRole={userRole} />;
    if (activeView === View.Team) return <TeamManagement />;
    if (activeView === View.Workflows) return <ServiceWorkflows />;
    if (activeView === View.KYC) return <KYCVault clients={clients} />;
    if (activeView === View.Intelligence) return <FirmIntelligence />;
    if (activeView === View.Help) return <HelpSupport />;
    if (activeView === View.Tasks) return <Tasks clients={clients} firmId="local" />;
    if (activeView === View.Timesheets) return <Timesheets clients={clients} />;
    if (activeView === View.Regulatory) return <RegulatoryUpdates />;
    if (activeView === View.AuditLog) return <AuditLogs />;
    if (activeView === View.Dashboard) return <Dashboard client={selectedClient || clients[0]} />;

    if (!selectedClient) return <div className="flex items-center justify-center h-full text-gray-500">Add a client to begin.</div>;

    switch (activeView) {
      case View.ClientOverview: return <ClientOverview client={selectedClient} onChangeView={setActiveView} />;
      case View.Portal: return <PortalSync client={selectedClient} onDraftReply={p => { setPendingPrompt(p); setActiveView(View.Advisory); }} />;
      case View.TaxFiling: return <TaxFiling client={selectedClient} firmProfile={firmProfile} />;
      case View.Compliance: return <Compliance client={selectedClient} />;
      case View.Forecasting: return <Forecasting client={selectedClient} />;
      case View.Documents: return <Documents client={selectedClient} firmId="local" />;
      case View.Billing: return <Billing client={selectedClient} firmProfile={firmProfile} />;
      case View.Advisory:
      default:
        const p = pendingPrompt; if(p) setTimeout(() => setPendingPrompt(''), 100);
        return <ChatInterface client={selectedClient} initialPrompt={p} />;
    }
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900"><div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full"></div></div>;
  if (showLanding && !isAuthenticated) return <LandingPage onLogin={() => setShowLanding(false)} darkMode={darkMode} toggleTheme={toggleTheme} />;
  if (!isAuthenticated) return <Auth onLogin={checkSession} />;

  return (
    <div className="flex h-screen font-sans bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-slate-100 overflow-hidden selection:bg-primary-100">
      {isLocked && <LockScreen onUnlock={() => setIsLocked(false)} userEmail={userEmail} />}
      {showDisclaimer && <DisclaimerModal onAccept={() => { storageService.setDisclaimerSeen(); setShowDisclaimer(false); }} />}
      {showAddClientModal && <AddClientModal onClose={() => setShowAddClientModal(false)} onSave={handleAddClient} />}
      {showEditClientModal && selectedClient && (
          <ClientSettingsModal client={selectedClient} onClose={() => setShowEditClientModal(false)} onUpdate={c => { storageService.updateClient(c); loadFirmData(); }} onDelete={id => { storageService.deleteClient(id); loadFirmData(); }} />
      )}
      
      {isSidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}
      <Sidebar activeView={activeView} setActiveView={setActiveView} clients={clients} selectedClient={selectedClient || clients[0]} onClientChange={setSelectedClient} onAddClient={() => setShowAddClientModal(true)} onEditClient={() => setShowEditClientModal(true)} firmProfile={firmProfile} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
         <GlobalHeader clients={clients} selectedClient={selectedClient} activeView={activeView} onClientSelect={setSelectedClient} onViewSelect={setActiveView} darkMode={darkMode} toggleTheme={toggleTheme} onLock={() => setIsLocked(true)} onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
         <div className="flex-1 overflow-y-auto">{renderContent()}</div>
      </main>
    </div>
  );
};

export default App;
