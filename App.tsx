
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
import { storageService } from './services/storage';
import { View, Client, FirmProfile } from './types';

// Mock Data for Firm Clients (Default)
const DEFAULT_CLIENTS: Client[] = [
    { id: '1', name: 'TechSpire Solutions Pvt Ltd', type: 'Company', pan: 'AAACT5678K', industry: 'IT Services', email: 'accounts@techspire.com' },
    { id: '2', name: 'Rajesh Kumar & Sons', type: 'Individual', pan: 'BKWPK1234M', industry: 'Retail/Trading', email: 'rajesh.k@gmail.com' },
    { id: '3', name: 'GreenLeaf Agro LLP', type: 'LLP', pan: 'AAAFL9988J', industry: 'Agriculture/Export', email: 'info@greenleaf.org' },
];

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>(View.Dashboard);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  
  // Responsive Sidebar State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Client Management
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [showEditClientModal, setShowEditClientModal] = useState(false);
  
  // Firm Profile State
  const [firmProfile, setFirmProfile] = useState<FirmProfile | undefined>(undefined);

  useEffect(() => {
    // Initialize Theme
    const storedTheme = storageService.getTheme();
    setDarkMode(storedTheme);
    if (storedTheme) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }

    // Check auth status on mount
    const authStatus = storageService.isAuthenticated();
    setIsAuthenticated(authStatus);
    
    // Load clients from storage or use default
    const storedClients = storageService.getClients();
    if (storedClients && storedClients.length > 0) {
        setClients(storedClients);
        setSelectedClient(storedClients[0]);
    } else {
        setClients(DEFAULT_CLIENTS);
        setSelectedClient(DEFAULT_CLIENTS[0]);
        storageService.saveClients(DEFAULT_CLIENTS);
    }
    
    // Load Firm Profile
    const storedFirm = storageService.getFirmProfile();
    if (storedFirm) {
        setFirmProfile(storedFirm);
    }

    // Check disclaimer status only if authenticated
    if (authStatus && !storageService.hasSeenDisclaimer()) {
      setShowDisclaimer(true);
    }
    
    setIsLoading(false);
  }, []);

  const toggleTheme = () => {
      const newMode = !darkMode;
      setDarkMode(newMode);
      storageService.saveTheme(newMode);
      if (newMode) {
          document.documentElement.classList.add('dark');
      } else {
          document.documentElement.classList.remove('dark');
      }
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    if (!storageService.hasSeenDisclaimer()) {
      setShowDisclaimer(true);
    }
  };

  const handleLogout = () => {
      storageService.logout();
      setIsAuthenticated(false);
      setActiveView(View.Dashboard);
  }

  const handleDisclaimerAccept = () => {
    storageService.setDisclaimerSeen();
    setShowDisclaimer(false);
  };
  
  const handleAddClient = (newClient: Client) => {
      const updatedClients = [...clients, newClient];
      setClients(updatedClients);
      setSelectedClient(newClient); // Auto-select new client
      setActiveView(View.ClientOverview); // Jump to overview
      storageService.saveClients(updatedClients);
  };

  const handleUpdateClient = (updatedClient: Client) => {
      const updatedClients = clients.map(c => c.id === updatedClient.id ? updatedClient : c);
      setClients(updatedClients);
      setSelectedClient(updatedClient);
      storageService.updateClient(updatedClient);
  };

  const handleDeleteClient = (clientId: string) => {
      const updatedClients = clients.filter(c => c.id !== clientId);
      setClients(updatedClients);
      if (updatedClients.length > 0) {
          setSelectedClient(updatedClients[0]);
      } else {
          setSelectedClient(null);
      }
      storageService.deleteClient(clientId);
  };

  const handleFirmUpdate = (profile: FirmProfile) => {
      setFirmProfile(profile);
      storageService.saveFirmProfile(profile);
  };
  
  const handleClientSwitch = (client: Client) => {
      setSelectedClient(client);
      setActiveView(View.ClientOverview);
      setIsSidebarOpen(false); // Close sidebar on mobile after selection
  }
  
  const handleViewChange = (view: View) => {
      setActiveView(view);
      setIsSidebarOpen(false); // Close sidebar on mobile after selection
  }

  const renderContent = () => {
    // Views that don't require a selected client
    if (activeView === View.Settings) return <Settings onLogout={handleLogout} onFirmUpdate={handleFirmUpdate} currentFirmProfile={firmProfile} />;
    if (activeView === View.Tasks) return <Tasks clients={clients} />;
    if (activeView === View.Timesheets) return <Timesheets clients={clients} />;
    if (activeView === View.Regulatory) return <RegulatoryUpdates />;
    if (activeView === View.AuditLog) return <AuditLogs />;
    if (activeView === View.Dashboard) return <Dashboard client={selectedClient || clients[0]} />; // Firm Dashboard

    if (!selectedClient) {
        return <div className="flex items-center justify-center h-full text-gray-500">Please add a client to get started.</div>;
    }

    switch (activeView) {
      case View.ClientOverview:
        return <ClientOverview client={selectedClient} onChangeView={handleViewChange} />;
      case View.TaxFiling:
        return <TaxFiling client={selectedClient} firmProfile={firmProfile} />;
      case View.Compliance:
        return <Compliance client={selectedClient} />;
      case View.Forecasting:
        return <Forecasting client={selectedClient} />;
      case View.Documents:
        return <Documents client={selectedClient} />;
      case View.Billing:
        return <Billing client={selectedClient} firmProfile={firmProfile} />;
      case View.Advisory:
      default:
        return <ChatInterface client={selectedClient} />;
    }
  };

  if (isLoading) return null;

  if (!isAuthenticated) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen font-sans bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-slate-100 overflow-hidden relative">
      
      {isLocked && (
          <LockScreen 
            onUnlock={() => setIsLocked(false)} 
            userEmail={storageService.getUserEmail() || 'User'} 
          />
      )}

      {showDisclaimer && <DisclaimerModal onAccept={handleDisclaimerAccept} />}
      
      {showAddClientModal && (
        <AddClientModal 
            onClose={() => setShowAddClientModal(false)} 
            onSave={handleAddClient} 
        />
      )}
      
      {showEditClientModal && selectedClient && (
          <ClientSettingsModal
            client={selectedClient}
            onClose={() => setShowEditClientModal(false)}
            onUpdate={handleUpdateClient}
            onDelete={handleDeleteClient}
          />
      )}
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
            className="fixed inset-0 z-20 bg-black/50 lg:hidden" 
            onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
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
         {/* Global Header for Command Center & Navigation */}
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
