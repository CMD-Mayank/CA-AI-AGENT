

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
  
  // Responsive Sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Data State
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [showEditClientModal, setShowEditClientModal] = useState(false);
  const [firmProfile, setFirmProfile] = useState<FirmProfile | undefined>(undefined);
  const [firmId, setFirmId] = useState<string | null>('local-firm-id');
  const [userEmail, setUserEmail] = useState<string>('');
  const [userRole, setUserRole] = useState<string>('staff');
  
  const [pendingPrompt, setPendingPrompt] = useState<string>('');

  useEffect(() => {
    // 1. Theme Initialization
    const storedTheme = storageService.getTheme();
    setDarkMode(storedTheme);
    if (storedTheme) document.documentElement.classList.add('dark');

    const storedColor = storageService.getThemeColor();
    setThemeColor(storedColor);
    document.documentElement.setAttribute('data-theme', storedColor);

    // 2. Auth Check
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
      if (profile) {
          setFirmProfile(profile);
      }

      try {
          let storedClients = await storageService.getClients();
          
          // Seed data if empty (For demo purposes)
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
      setClients([]);
      setFirmProfile(undefined);
  };

  const handleLoginSuccess = () => {
      checkSession(); // Re-trigger load
  };

  // --- Client CRUD Handlers ---

  const handleAddClient = async (newClientData: Client) => {
      try {
        const added = await storageService.addClient(newClientData);
        if (added) {
            const updatedClients = [added, ...clients];
            setClients(updatedClients);
            setSelectedClient(added);
            setActiveView(View.ClientOverview);
        }
      } catch (e) {
          alert('Failed to add client.');
      }
  };

  const handleUpdateClient = async (updatedClient: Client) => {
      try {
        await storageService.updateClient(updatedClient);
        const updatedClients = clients.map(c => c.id === updatedClient.id ? updatedClient : c);
        setClients(updatedClients);
        setSelectedClient(updatedClient);
      } catch (e) {
          alert('Update failed');
      }
  };

  const handleDeleteClient = async (clientId: string) => {
      if (!confirm("Are you sure? This deletes the client from the database.")) return;
      
      try {
          await storageService.deleteClient(clientId);
          const updatedClients = clients.filter(c => c.id !== clientId);
          setClients(updatedClients);
          setSelectedClient(updatedClients.length > 0 ? updatedClients[0] : null);
      } catch (e) {
          alert('Delete failed');
      }
  };

  const handleFirmUpdate = (profile: FirmProfile) => {
      setFirmProfile(profile);
      storageService.saveFirmProfile(profile);
  };
  
  const handleClientSwitch = (client: Client) => {
      setSelectedClient(client);
      setActiveView(View.ClientOverview);
      setIsSidebarOpen(false);
  };
  
  const handleViewChange = (view: View) => {
      setActiveView(view);
      setIsSidebarOpen(false);
  };
  
  const handleDraftReply = (prompt: string) => {
      setPendingPrompt(prompt);
      setActiveView(View.Advisory);
  };

  const renderContent = () => {
    // Super Admin View
    if (activeView === View.SuperAdmin) {
        return <SuperAdminDashboard />;
    }

    if (activeView === View.Settings) return (
        <Settings 
            onLogout={handleLogout} 
            onFirmUpdate={handleFirmUpdate} 
            currentFirmProfile={firmProfile} 
            activeTheme={themeColor}
            onThemeChange={changeThemeColor}
            userRole={userRole}
            onOpenAdmin={() => setActiveView(View.SuperAdmin)}
        />
    );
    if (activeView === View.Help) return <HelpSupport />;
    if (activeView === View.Tasks) return <Tasks clients={clients} firmId={firmId} />;
    if (activeView === View.Timesheets) return <Timesheets clients={clients} />;
    if (activeView === View.Regulatory) return <RegulatoryUpdates />;
    if (activeView === View.AuditLog) return <AuditLogs />;
    if (activeView === View.Dashboard) return <Dashboard client={selectedClient || clients[0]} />;

    if (!selectedClient) return <div className="flex items-center justify-center h-full text-gray-500">Please add a client to get started.</div>;

    switch (activeView) {
      case View.ClientOverview: return <ClientOverview client={selectedClient} onChangeView={handleViewChange} />;
      case View.Portal: return <PortalSync client={selectedClient} onDraftReply={handleDraftReply} />;
      case View.TaxFiling: return <TaxFiling client={selectedClient} firmProfile={firmProfile} />;
      case View.Compliance: return <Compliance client={selectedClient} />;
      case View.Forecasting: return <Forecasting client={selectedClient} />;
      case View.Documents: return <Documents client={selectedClient} firmId={firmId} />;
      case View.Billing: return <Billing client={selectedClient} firmProfile={firmProfile} />;
      case View.Advisory:
      default:
        const promptToUse = pendingPrompt;
        if(pendingPrompt) setTimeout(() => setPendingPrompt(''), 100); 
        return <ChatInterface client={selectedClient} initialPrompt={promptToUse} />;
    }
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900"><div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full"></div></div>;

  if (showLanding && !isAuthenticated) return <LandingPage onLogin={() => setShowLanding(false)} darkMode={darkMode} toggleTheme={toggleTheme} />;
  if (!isAuthenticated) return <Auth onLogin={handleLoginSuccess} />;

  return (
    <div className="flex h-screen font-sans bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-slate-100 overflow-hidden relative selection:bg-primary-100 selection:text-primary-900">
      {isLocked && <LockScreen onUnlock={() => setIsLocked(false)} userEmail={userEmail} />}
      {showDisclaimer && <DisclaimerModal onAccept={() => { storageService.setDisclaimerSeen(); setShowDisclaimer(false); }} />}
      {showAddClientModal && <AddClientModal onClose={() => setShowAddClientModal(false)} onSave={handleAddClient} />}
      {showEditClientModal && selectedClient && (
          <ClientSettingsModal client={selectedClient} onClose={() => setShowEditClientModal(false)} onUpdate={handleUpdateClient} onDelete={handleDeleteClient} />
      )}
      
      {isSidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}
      
      <Sidebar 
        activeView={activeView} 
        setActiveView={handleViewChange}
        clients={clients}
        selectedClient={selectedClient || clients[0]}
        onClientChange={handleClientSwitch}
        onAddClient={() => setShowAddClientModal(true)}
        onEditClient={() => setShowEditClientModal(true)}
        firmProfile={firmProfile}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-50 dark:bg-slate-900 transition-colors duration-200 w-full relative">
         <GlobalHeader 
            clients={clients}
            selectedClient={selectedClient}
            activeView={activeView}
            onClientSelect={handleClientSwitch}
            onViewSelect={handleViewChange}
            darkMode={darkMode}
            toggleTheme={toggleTheme}
            onLock={() => setIsLocked(true)}
            onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
         />
         <div className="flex-1 overflow-y-auto scroll-smooth">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
