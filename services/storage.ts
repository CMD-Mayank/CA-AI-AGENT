
import { ChatMessage, FirmProfile, ClientDocument, Client, ActivityLog, Invoice, Task, TimeLog, ThemeColor } from '../types';

// Local Storage Keys
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
  MODULE_PREFIX: 'ca-agent-module-state-'
};

// Helper to simulate async delay for realistic feel
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const storageService = {
  // --- Auth (Mock) ---
  getUserSession: async () => {
    const userStr = localStorage.getItem(KEYS.USER);
    if (userStr) return JSON.parse(userStr);
    return null;
  },

  getUserEmail: async (): Promise<string | null> => {
    const userStr = localStorage.getItem(KEYS.USER);
    return userStr ? JSON.parse(userStr).email : null;
  },

  signIn: async (email: string) => {
    await delay(500);
    // Simulate successful login
    const user = { id: 'local-user-id', email, name: email.split('@')[0], role: 'admin' };
    localStorage.setItem(KEYS.USER, JSON.stringify(user));
    return { user, error: null };
  },

  signUp: async (email: string, fullName: string, firmName: string) => {
    await delay(800);
    const user = { id: 'local-user-id', email, name: fullName, role: 'admin' };
    localStorage.setItem(KEYS.USER, JSON.stringify(user));
    
    // Initialize Firm Profile
    const profile: FirmProfile = { name: firmName, frn: '', address: '', website: '' };
    localStorage.setItem(KEYS.FIRM_PROFILE, JSON.stringify(profile));
    
    return { user, error: null };
  },

  signOut: async () => {
    await delay(200);
    localStorage.removeItem(KEYS.USER);
  },

  // --- Seed Data (DB Initialization) ---
  seedDemoData: async () => {
    const clients = storageService._get<Client>(KEYS.CLIENTS);
    if (clients.length > 0) return; 

    console.log("Seeding Local Database with Demo Content...");
    
    const demoClients: Client[] = [
        { id: 'c1', name: 'TechStream Solutions Pvt Ltd', type: 'Company', pan: 'AAACT1234H', industry: 'IT Services', email: 'accounts@techstream.com', phone: '9876543210' },
        { id: 'c2', name: 'Dr. Anjali Gupta', type: 'Individual', pan: 'BUPPG5678K', industry: 'Healthcare', email: 'anjali.g@gmail.com', phone: '9876543211' }
    ];
    storageService._save(KEYS.CLIENTS, demoClients);
    
    const demoTasks: Task[] = [
        { id: 't1', title: 'GSTR-3B Filing (Oct)', clientId: 'c1', clientName: 'TechStream Solutions Pvt Ltd', assignee: 'Self', dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], status: 'In Progress', priority: 'High' },
        { id: 't2', title: 'Tax Audit Report', clientId: 'c1', clientName: 'TechStream Solutions Pvt Ltd', assignee: 'Rahul', dueDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0], status: 'To Do', priority: 'High' },
        { id: 't3', title: 'ITR Filing Review', clientId: 'c2', clientName: 'Dr. Anjali Gupta', assignee: 'Self', dueDate: new Date(Date.now() + 86400000 * 10).toISOString().split('T')[0], status: 'Review', priority: 'Medium' }
    ];
    storageService._save(KEYS.TASKS, demoTasks);

    const docs: ClientDocument[] = [
        { id: 'd1', clientId: 'c1', title: 'Financial Statements FY23-24', type: 'Financial Report', content: 'Balance Sheet...\nProfit & Loss...', status: 'Approved', createdAt: Date.now() - 1000000, createdBy: 'System' },
        { id: 'd2', clientId: 'c1', title: 'GST Notice Response Draft', type: 'Advisory Opinion', content: 'To the Proper Officer...\nRef: Notice dated...', status: 'Draft', createdAt: Date.now() - 500000, createdBy: 'System' },
        { id: 'd3', clientId: 'c2', title: 'Tax Computation Memo', type: 'Tax Report', content: 'Computation of Total Income...', status: 'Signed', createdAt: Date.now() - 200000, createdBy: 'System', signedBy: 'CA Admin', signedAt: Date.now() }
    ];
    storageService._save(KEYS.DOCUMENTS, docs);

    const invoices: Invoice[] = [
        { id: 'i1', clientId: 'c1', number: 'INV-2024-001', date: new Date().toLocaleDateString(), dueDate: new Date(Date.now() + 86400000 * 15).toLocaleDateString(), total: 25000, status: 'Sent', items: [{description: 'Retainership Oct 24', amount: 25000}] },
        { id: 'i2', clientId: 'c2', number: 'INV-2024-002', date: new Date().toLocaleDateString(), dueDate: new Date(Date.now() + 86400000 * 7).toLocaleDateString(), total: 5000, status: 'Draft', items: [{description: 'Consultation Fees', amount: 5000}] }
    ];
    storageService._save(KEYS.INVOICES, invoices);

    const logs: ActivityLog[] = [
        { id: 'l1', clientId: 'c1', clientName: 'TechStream Solutions Pvt Ltd', action: 'Database Initialized', timestamp: Date.now(), details: 'Demo environment setup complete' }
    ];
    storageService._save(KEYS.LOGS, logs);
  },

  // --- Internal Helpers ---
  _get: <T>(key: string): T[] => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : [];
    } catch { return []; }
  },

  _save: (key: string, data: any[]) => {
    localStorage.setItem(key, JSON.stringify(data));
  },

  // --- Messages (Chat) ---
  saveMessages: async (clientId: string, messages: ChatMessage[]) => {
    localStorage.setItem(`${KEYS.CHAT_PREFIX}${clientId}`, JSON.stringify(messages));
  },

  getMessages: (clientId: string): ChatMessage[] => {
    try {
      const stored = localStorage.getItem(`${KEYS.CHAT_PREFIX}${clientId}`);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      return [];
    }
  },

  clearMessages: (clientId?: string) => {
    if (clientId) {
      localStorage.removeItem(`${KEYS.CHAT_PREFIX}${clientId}`);
    } else {
        Object.keys(localStorage).forEach(key => {
            if(key.startsWith(KEYS.CHAT_PREFIX)) localStorage.removeItem(key);
        });
    }
  },

  // --- Client Management ---
  getClients: async (): Promise<Client[]> => storageService._get<Client>(KEYS.CLIENTS),

  addClient: async (client: Client): Promise<Client | null> => {
      const clients = storageService._get<Client>(KEYS.CLIENTS);
      const newClient = { ...client, id: Date.now().toString() };
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

  // --- Firm Profile ---
  saveFirmProfile: (profile: FirmProfile) => {
      localStorage.setItem(KEYS.FIRM_PROFILE, JSON.stringify(profile));
  },

  getFirmProfile: (): FirmProfile | null => {
      try {
          const stored = localStorage.getItem(KEYS.FIRM_PROFILE);
          return stored ? JSON.parse(stored) : null;
      } catch (error) {
          return null;
      }
  },

  // --- Module Persistence ---
  saveModuleState: (clientId: string, module: string, data: any) => {
      localStorage.setItem(`${KEYS.MODULE_PREFIX}${clientId}-${module}`, JSON.stringify(data));
  },

  getModuleState: (clientId: string, module: string): any | null => {
      try {
          const stored = localStorage.getItem(`${KEYS.MODULE_PREFIX}${clientId}-${module}`);
          return stored ? JSON.parse(stored) : null;
      } catch (error) {
          return null;
      }
  },

  // --- Document Management ---
  saveDocument: async (doc: ClientDocument) => {
      const docs = storageService._get<ClientDocument>(KEYS.DOCUMENTS);
      docs.unshift(doc);
      storageService._save(KEYS.DOCUMENTS, docs);
      
      await storageService.logActivity({
          id: Date.now().toString(),
          clientId: doc.clientId,
          clientName: 'System', 
          action: 'Document Generated',
          timestamp: Date.now(),
          details: doc.title
      });
  },
  
  updateDocument: async (updatedDoc: ClientDocument) => {
      const docs = storageService._get<ClientDocument>(KEYS.DOCUMENTS);
      const index = docs.findIndex(d => d.id === updatedDoc.id);
      if (index !== -1) {
          docs[index] = updatedDoc;
          storageService._save(KEYS.DOCUMENTS, docs);
      }
  },

  getDocumentsForClient: async (clientId: string): Promise<ClientDocument[]> => {
      return storageService._get<ClientDocument>(KEYS.DOCUMENTS).filter(d => d.clientId === clientId);
  },

  getAllDocuments: async (): Promise<ClientDocument[]> => {
      return storageService._get<ClientDocument>(KEYS.DOCUMENTS);
  },
  
  deleteDocument: async (docId: string) => {
      const docs = storageService._get<ClientDocument>(KEYS.DOCUMENTS).filter(d => d.id !== docId);
      storageService._save(KEYS.DOCUMENTS, docs);
  },

  // --- Activity Logging ---
  logActivity: async (log: ActivityLog) => {
      const logs = storageService._get<ActivityLog>(KEYS.LOGS);
      logs.unshift(log);
      if (logs.length > 100) logs.pop(); // Limit logs
      storageService._save(KEYS.LOGS, logs);
  },

  getLogs: async (): Promise<ActivityLog[]> => {
      return storageService._get<ActivityLog>(KEYS.LOGS);
  },

  // --- Invoicing ---
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

  getInvoices: async (clientId: string): Promise<Invoice[]> => {
      return storageService._get<Invoice>(KEYS.INVOICES).filter(i => i.clientId === clientId);
  },
  
  // --- Tasks Management ---
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

  getTasks: async (): Promise<Task[]> => {
      return storageService._get<Task>(KEYS.TASKS);
  },

  // --- Timesheets ---
  saveTimeLog: async (log: TimeLog) => {
      const logs = storageService._get<TimeLog>(KEYS.TIME_LOGS);
      logs.unshift(log);
      storageService._save(KEYS.TIME_LOGS, logs);
  },
  
  getTimeLogs: async (): Promise<TimeLog[]> => {
      return storageService._get<TimeLog>(KEYS.TIME_LOGS);
  },
  
  getUnbilledTimeLogs: async (clientId: string): Promise<TimeLog[]> => {
      return storageService._get<TimeLog>(KEYS.TIME_LOGS)
        .filter(l => l.clientId === clientId && l.billable && !l.billed);
  },
  
  markTimeLogsAsBilled: async (logIds: string[]) => {
      const logs = storageService._get<TimeLog>(KEYS.TIME_LOGS);
      logs.forEach(l => {
          if (logIds.includes(l.id)) l.billed = true;
      });
      storageService._save(KEYS.TIME_LOGS, logs);
  },

  // --- Theme Management ---
  saveTheme: (isDark: boolean) => {
      localStorage.setItem(KEYS.THEME_MODE, isDark ? 'dark' : 'light');
  },

  getTheme: (): boolean => {
      return localStorage.getItem(KEYS.THEME_MODE) === 'dark';
  },

  saveThemeColor: (color: ThemeColor) => {
      localStorage.setItem(KEYS.THEME_COLOR, color);
  },

  getThemeColor: (): ThemeColor => {
      return (localStorage.getItem(KEYS.THEME_COLOR) as ThemeColor) || 'teal';
  },
  
  // --- Stats Helper ---
  getDashboardStats: async () => {
      const clients = storageService._get(KEYS.CLIENTS).length;
      const docs = storageService._get(KEYS.DOCUMENTS).length;
      const logs = storageService._get<ActivityLog>(KEYS.LOGS).slice(0, 10);
      const totalBilled = storageService._get<Invoice>(KEYS.INVOICES).reduce((sum, i) => sum + i.total, 0);

      return {
          totalClients: clients,
          totalDocuments: docs,
          recentActivity: logs,
          totalBilled
      };
  },
  
  setDisclaimerSeen: () => localStorage.setItem('disclaimer_seen', 'true'),
  hasSeenDisclaimer: () => localStorage.getItem('disclaimer_seen') === 'true',
  
  createBackup: () => JSON.stringify(localStorage),
  restoreBackup: (content: string) => {
      try {
          const data = JSON.parse(content);
          if (!data || typeof data !== 'object') return false;
          
          localStorage.clear();
          Object.keys(data).forEach(key => {
              if (key.startsWith('ca-agent-')) {
                  localStorage.setItem(key, data[key]);
              }
          });
          return true;
      } catch (e) {
          console.error(e);
          return false;
      }
  }
};
