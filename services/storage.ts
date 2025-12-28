
import { ChatMessage, FirmProfile, ClientDocument, Client, ActivityLog, Invoice, Task, TimeLog, ThemeColor, CloudSyncSettings, StaffMember, ServiceTemplate, CommunicationLog } from '../types';

const KEYS = {
  USER: 'ca-agent-user',
  CLIENTS: 'ca-agent-clients',
  TASKS: 'ca-agent-tasks',
  DOCUMENTS: 'ca-agent-documents',
  INVOICES: 'ca-agent-invoices',
  LOGS: 'ca-agent-logs',
  TIME_LOGS: 'ca-agent-time-logs',
  FIRM_PROFILE: 'ca-agent-firm-profile',
  THEME_MODE: 'ca-agent-theme-mode',
  THEME_COLOR: 'ca-agent-theme-color',
  CHAT_PREFIX: 'ca-agent-chat-history-',
  MODULE_PREFIX: 'ca-agent-module-state-',
  STAFF: 'ca-agent-staff',
  SERVICE_TEMPLATES: 'ca-agent-service-templates',
  DISCLAIMER_SEEN: 'ca-agent-disclaimer-seen',
  COMMUNICATIONS: 'ca-agent-communications'
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const storageService = {
  // --- Auth ---
  getUserSession: async () => {
    const userStr = localStorage.getItem(KEYS.USER);
    if (userStr) return JSON.parse(userStr);
    return null;
  },

  signIn: async (email: string) => {
    await delay(500);
    const user = { id: 'local-user-id', email, name: email.split('@')[0], role: 'admin' };
    localStorage.setItem(KEYS.USER, JSON.stringify(user));
    return { user, error: null };
  },

  signUp: async (email: string, fullName: string, firmName: string) => {
    await delay(800);
    const user = { id: 'local-user-id', email, name: fullName, role: 'admin' };
    localStorage.setItem(KEYS.USER, JSON.stringify(user));
    
    const profile: FirmProfile = { 
        name: firmName, 
        frn: '', 
        address: '', 
        website: '',
        cloudSync: {
            enabled: false,
            encryptionKey: Math.random().toString(36).substring(2, 15).toUpperCase(),
            serverEndpoint: 'https://api.auditera.io/v1/sync',
            autoSync: true
        }
    };
    localStorage.setItem(KEYS.FIRM_PROFILE, JSON.stringify(profile));
    return { user, error: null };
  },

  signOut: async () => {
    localStorage.removeItem(KEYS.USER);
  },

  getUserEmail: async (): Promise<string | null> => {
    const userStr = localStorage.getItem(KEYS.USER);
    return userStr ? JSON.parse(userStr).email : null;
  },

  // --- Core Methods ---
  _get: <T>(key: string): T[] => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : [];
    } catch { return []; }
  },

  _save: (key: string, data: any[]) => {
    localStorage.setItem(key, JSON.stringify(data));
  },

  // --- Communications ---
  getCommunications: async (clientId?: string): Promise<CommunicationLog[]> => {
      const logs = storageService._get<CommunicationLog>(KEYS.COMMUNICATIONS);
      return clientId ? logs.filter(l => l.clientId === clientId) : logs;
  },

  logCommunication: async (comm: CommunicationLog) => {
      const logs = storageService._get<CommunicationLog>(KEYS.COMMUNICATIONS);
      logs.unshift(comm);
      storageService._save(KEYS.COMMUNICATIONS, logs);
  },

  // --- Seed Data ---
  seedDemoData: async () => {
    const clients = storageService._get<Client>(KEYS.CLIENTS);
    if (clients.length > 0) return; 

    const demoClients: Client[] = [
        { id: 'c1', name: 'TechStream Solutions Pvt Ltd', type: 'Company', pan: 'AAACT1234H', industry: 'IT Services', email: 'accounts@techstream.com', kycStatus: 'Verified', onboardingDate: Date.now() - 30 * 86400000 },
        { id: 'c2', name: 'Dr. Anjali Gupta', type: 'Individual', pan: 'BUPPG5678K', industry: 'Healthcare', email: 'anjali.g@gmail.com', kycStatus: 'Pending', onboardingDate: Date.now() - 5 * 86400000 }
    ];
    storageService._save(KEYS.CLIENTS, demoClients);

    const demoStaff: StaffMember[] = [
        { id: 's1', name: 'CA Rajesh Kumar', role: 'Partner', email: 'rajesh@firm.com', utilization: 85, activeTasks: 12, status: 'Online' },
        { id: 's2', name: 'Sneha Patel', role: 'Article Assistant', email: 'sneha@firm.com', utilization: 92, activeTasks: 8, status: 'Online' },
        { id: 's3', name: 'Amit Singh', role: 'Manager', email: 'amit@firm.com', utilization: 65, activeTasks: 5, status: 'Offline' }
    ];
    storageService._save(KEYS.STAFF, demoStaff);

    const demoTemplates: ServiceTemplate[] = [
        { id: 'tpl1', title: 'Statutory Audit FY 23-24', category: 'Audit', estimatedHours: 40, steps: ['Internal Control Testing', 'Vouching', 'Verification of Assets', 'Drafting Report'] },
        { id: 'tpl2', title: 'GST Monthly Return Filing', category: 'Compliance', estimatedHours: 4, steps: ['Data Verification', 'GSTR-2B Matching', 'Tax Payment', 'GSTR-3B Filing'] }
    ];
    storageService._save(KEYS.SERVICE_TEMPLATES, demoTemplates);
    
    const demoTasks: Task[] = [
        { id: 't1', title: 'GSTR-3B Filing (Oct)', clientId: 'c1', clientName: 'TechStream Solutions Pvt Ltd', assignee: 'Sneha Patel', dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], status: 'In Progress', priority: 'High' },
        { id: 't2', title: 'Tax Audit Report', clientId: 'c1', clientName: 'TechStream Solutions Pvt Ltd', assignee: 'Amit Singh', dueDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0], status: 'To Do', priority: 'High' }
    ];
    storageService._save(KEYS.TASKS, demoTasks);

    const logs: ActivityLog[] = [
        { id: 'l1', clientId: 'c1', clientName: 'TechStream Solutions Pvt Ltd', action: 'Database Initialized', timestamp: Date.now(), details: 'Professional OS Kernel Ready.' }
    ];
    storageService._save(KEYS.LOGS, logs);
  },

  // --- Staff Management ---
  getStaff: async (): Promise<StaffMember[]> => storageService._get<StaffMember>(KEYS.STAFF),
  addStaff: async (s: StaffMember) => {
      const staff = storageService._get<StaffMember>(KEYS.STAFF);
      staff.push(s);
      storageService._save(KEYS.STAFF, staff);
  },

  // --- Service Templates ---
  getTemplates: async (): Promise<ServiceTemplate[]> => storageService._get<ServiceTemplate>(KEYS.SERVICE_TEMPLATES),

  // --- Client Management ---
  getClients: async (): Promise<Client[]> => storageService._get<Client>(KEYS.CLIENTS),
  addClient: async (client: Client): Promise<Client | null> => {
      const clients = storageService._get<Client>(KEYS.CLIENTS);
      const newClient = { ...client, id: Date.now().toString(), onboardingDate: Date.now(), kycStatus: 'Pending' as const };
      clients.unshift(newClient);
      storageService._save(KEYS.CLIENTS, clients);
      return newClient;
  },
  updateClient: async (updatedClient: Client) => {
      const clients = storageService._get<Client>(KEYS.CLIENTS);
      const index = clients.findIndex(c => c.id === updatedClient.id);
      if (index !== -1) {
          clients[index] = updatedClient;
          storageService._save(KEYS.CLIENTS, clients);
      }
  },
  deleteClient: async (clientId: string) => {
      const clients = storageService._get<Client>(KEYS.CLIENTS).filter(c => c.id !== clientId);
      storageService._save(KEYS.CLIENTS, clients);
  },

  // --- Documents & Logs ---
  getDocumentsForClient: async (clientId: string): Promise<ClientDocument[]> => {
      return storageService._get<ClientDocument>(KEYS.DOCUMENTS).filter(d => d.clientId === clientId);
  },
  saveDocument: async (doc: ClientDocument) => {
      const docs = storageService._get<ClientDocument>(KEYS.DOCUMENTS);
      docs.unshift(doc);
      storageService._save(KEYS.DOCUMENTS, docs);
  },
  updateDocument: async (updatedDoc: ClientDocument) => {
      const docs = storageService._get<ClientDocument>(KEYS.DOCUMENTS);
      const index = docs.findIndex(d => d.id === updatedDoc.id);
      if (index !== -1) {
          docs[index] = updatedDoc;
          storageService._save(KEYS.DOCUMENTS, docs);
      }
  },
  deleteDocument: async (docId: string) => {
      const docs = storageService._get<ClientDocument>(KEYS.DOCUMENTS).filter(d => d.id !== docId);
      storageService._save(KEYS.DOCUMENTS, docs);
  },
  getAllDocuments: async (): Promise<ClientDocument[]> => storageService._get<ClientDocument>(KEYS.DOCUMENTS),

  getLogs: async (): Promise<ActivityLog[]> => storageService._get<ActivityLog>(KEYS.LOGS),
  logActivity: async (log: ActivityLog) => {
      const logs = storageService._get<ActivityLog>(KEYS.LOGS);
      logs.unshift(log);
      if (logs.length > 100) logs.pop();
      storageService._save(KEYS.LOGS, logs);
  },

  // --- Invoicing & Tasks ---
  getInvoices: async (clientId?: string): Promise<Invoice[]> => {
      const invs = storageService._get<Invoice>(KEYS.INVOICES);
      return clientId ? invs.filter(i => i.clientId === clientId) : invs;
  },
  createInvoice: async (invoice: Invoice) => {
      const invs = storageService._get<Invoice>(KEYS.INVOICES);
      invs.unshift(invoice);
      storageService._save(KEYS.INVOICES, invs);
  },
  updateInvoice: async (invoice: Invoice) => {
      const invs = storageService._get<Invoice>(KEYS.INVOICES);
      const index = invs.findIndex(i => i.id === invoice.id);
      if (index !== -1) {
          invs[index] = invoice;
          storageService._save(KEYS.INVOICES, invs);
      }
  },

  getTasks: async (): Promise<Task[]> => storageService._get<Task>(KEYS.TASKS),
  addTask: async (task: Task) => {
      const tasks = storageService._get<Task>(KEYS.TASKS);
      tasks.push(task);
      storageService._save(KEYS.TASKS, tasks);
  },
  updateTask: async (updatedTask: Task) => {
      const tasks = storageService._get<Task>(KEYS.TASKS);
      const index = tasks.findIndex(t => t.id === updatedTask.id);
      if (index !== -1) {
          tasks[index] = updatedTask;
          storageService._save(KEYS.TASKS, tasks);
      }
  },
  deleteTask: async (taskId: string) => {
      const tasks = storageService._get<Task>(KEYS.TASKS).filter(t => t.id !== taskId);
      storageService._save(KEYS.TASKS, tasks);
  },

  // --- Timesheets ---
  getTimeLogs: async (): Promise<TimeLog[]> => storageService._get<TimeLog>(KEYS.TIME_LOGS),
  saveTimeLog: async (log: TimeLog) => {
      const logs = storageService._get<TimeLog>(KEYS.TIME_LOGS);
      logs.unshift(log);
      storageService._save(KEYS.TIME_LOGS, logs);
  },
  getUnbilledTimeLogs: async (clientId: string): Promise<TimeLog[]> => {
      return storageService._get<TimeLog>(KEYS.TIME_LOGS)
        .filter(l => l.clientId === clientId && l.billable && !l.billed);
  },
  markTimeLogsAsBilled: async (logIds: string[]) => {
      const logs = storageService._get<TimeLog>(KEYS.TIME_LOGS);
      logs.forEach(l => { if (logIds.includes(l.id)) l.billed = true; });
      storageService._save(KEYS.TIME_LOGS, logs);
  },

  // --- Settings & UI ---
  getFirmProfile: (): FirmProfile | null => {
      const stored = localStorage.getItem(KEYS.FIRM_PROFILE);
      return stored ? JSON.parse(stored) : null;
  },
  saveFirmProfile: (profile: FirmProfile) => {
      localStorage.setItem(KEYS.FIRM_PROFILE, JSON.stringify(profile));
  },
  saveTheme: (isDark: boolean) => localStorage.setItem(KEYS.THEME_MODE, isDark ? 'dark' : 'light'),
  getTheme: (): boolean => localStorage.getItem(KEYS.THEME_MODE) === 'dark',
  saveThemeColor: (color: ThemeColor) => localStorage.setItem(KEYS.THEME_COLOR, color),
  getThemeColor: (): ThemeColor => (localStorage.getItem(KEYS.THEME_COLOR) as ThemeColor) || 'teal',

  saveModuleState: (clientId: string, module: string, data: any) => {
      localStorage.setItem(`${KEYS.MODULE_PREFIX}${clientId}-${module}`, JSON.stringify(data));
  },
  getModuleState: (clientId: string, module: string): any | null => {
      try {
          const stored = localStorage.getItem(`${KEYS.MODULE_PREFIX}${clientId}-${module}`);
          return stored ? JSON.parse(stored) : null;
      } catch { return null; }
  },

  saveMessages: async (clientId: string, messages: ChatMessage[]) => {
    localStorage.setItem(`${KEYS.CHAT_PREFIX}${clientId}`, JSON.stringify(messages));
  },
  getMessages: (clientId: string): ChatMessage[] => {
    try {
      const stored = localStorage.getItem(`${KEYS.CHAT_PREFIX}${clientId}`);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  },

  setDisclaimerSeen: () => {
    localStorage.setItem(KEYS.DISCLAIMER_SEEN, 'true');
  },
  hasSeenDisclaimer: (): boolean => {
    return localStorage.getItem(KEYS.DISCLAIMER_SEEN) === 'true';
  },

  syncData: async (): Promise<{ success: boolean; timestamp: number }> => {
    const profile = storageService.getFirmProfile();
    if (!profile?.cloudSync?.enabled) return { success: false, timestamp: Date.now() };
    await delay(1500);
    const timestamp = Date.now();
    const updatedProfile = { ...profile, cloudSync: { ...profile.cloudSync, lastSyncedAt: timestamp } };
    storageService.saveFirmProfile(updatedProfile);
    return { success: true, timestamp };
  },

  getDashboardStats: async () => {
      const clients = storageService._get(KEYS.CLIENTS).length;
      const docs = storageService._get(KEYS.DOCUMENTS).length;
      const logs = storageService._get<ActivityLog>(KEYS.LOGS).slice(0, 10);
      const totalBilled = storageService._get<Invoice>(KEYS.INVOICES).reduce((sum, i) => sum + i.total, 0);
      return { totalClients: clients, totalDocuments: docs, recentActivity: logs, totalBilled };
  },
  
  createBackup: () => {
      const allData: Record<string, string | null> = {};
      Object.keys(localStorage).forEach(key => {
          if (key.startsWith('ca-agent-')) {
              allData[key] = localStorage.getItem(key);
          }
      });
      return JSON.stringify(allData);
  },

  restoreBackup: (content: string) => {
      try {
          const data = JSON.parse(content);
          Object.keys(data).forEach(key => {
              if (key.startsWith('ca-agent-')) {
                  localStorage.setItem(key, data[key]);
              }
          });
          return true;
      } catch { return false; }
  },

  hardReset: () => {
      Object.keys(localStorage).forEach(key => {
          if (key.startsWith('ca-agent-')) {
              localStorage.removeItem(key);
          }
      });
      window.location.reload();
  }
};
