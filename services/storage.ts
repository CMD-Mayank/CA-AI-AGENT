
import { ChatMessage, FirmProfile, ClientDocument, Client, ActivityLog, Invoice, Task, TimeLog } from '../types';

const CHAT_STORAGE_KEY_PREFIX = 'ca-agent-chat-history-';
const DISCLAIMER_STORAGE_KEY = 'ca-agent-disclaimer-seen';
const AUTH_STORAGE_KEY = 'ca-agent-auth-session';
const CLIENTS_STORAGE_KEY = 'ca-agent-clients';
const FIRM_PROFILE_KEY = 'ca-agent-firm-profile';
const MODULE_STATE_PREFIX = 'ca-agent-module-state-';
const DOCUMENTS_KEY = 'ca-agent-documents';
const ACTIVITY_LOG_KEY = 'ca-agent-activity-log';
const INVOICES_KEY_PREFIX = 'ca-agent-invoices-';
const TASKS_KEY = 'ca-agent-tasks';
const TIMELOGS_KEY = 'ca-agent-timelogs';
const THEME_KEY = 'ca-agent-theme';

export const storageService = {
  saveMessages: (clientId: string, messages: ChatMessage[]) => {
    try {
      localStorage.setItem(`${CHAT_STORAGE_KEY_PREFIX}${clientId}`, JSON.stringify(messages));
    } catch (error) {
      console.error('Failed to save messages', error);
    }
  },

  getMessages: (clientId: string): ChatMessage[] => {
    try {
      const stored = localStorage.getItem(`${CHAT_STORAGE_KEY_PREFIX}${clientId}`);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load messages', error);
      return [];
    }
  },

  clearMessages: (clientId?: string) => {
    if (clientId) {
      localStorage.removeItem(`${CHAT_STORAGE_KEY_PREFIX}${clientId}`);
    } else {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith(CHAT_STORAGE_KEY_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    }
  },

  hasSeenDisclaimer: (): boolean => {
    return localStorage.getItem(DISCLAIMER_STORAGE_KEY) === 'true';
  },

  setDisclaimerSeen: () => {
    localStorage.setItem(DISCLAIMER_STORAGE_KEY, 'true');
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(AUTH_STORAGE_KEY);
  },

  login: (email: string) => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ email, timestamp: Date.now() }));
  },

  logout: () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  },
  
  getUserEmail: (): string | null => {
      const session = localStorage.getItem(AUTH_STORAGE_KEY);
      if (session) {
          return JSON.parse(session).email;
      }
      return null;
  },

  // --- Client Management ---
  saveClients: (clients: Client[]) => {
      try {
          localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(clients));
      } catch (error) {
          console.error('Failed to save clients', error);
      }
  },

  getClients: (): Client[] | null => {
      try {
          const stored = localStorage.getItem(CLIENTS_STORAGE_KEY);
          return stored ? JSON.parse(stored) : null;
      } catch (error) {
          return null;
      }
  },

  updateClient: (updatedClient: Client) => {
      const clients = storageService.getClients() || [];
      const index = clients.findIndex(c => c.id === updatedClient.id);
      if (index !== -1) {
          clients[index] = updatedClient;
          storageService.saveClients(clients);
      }
  },

  deleteClient: (clientId: string) => {
      // 1. Remove from Clients List
      const clients = storageService.getClients() || [];
      const filteredClients = clients.filter(c => c.id !== clientId);
      storageService.saveClients(filteredClients);

      // 2. Remove Chat History
      localStorage.removeItem(`${CHAT_STORAGE_KEY_PREFIX}${clientId}`);

      // 3. Remove Module States
      // (Simple iteration as keys are predictable, or just leave them as orphaned harmless data)
      
      // 4. Remove Documents
      const docs = storageService.getAllDocuments();
      const filteredDocs = docs.filter(d => d.clientId !== clientId);
      localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(filteredDocs));
      
      // 5. Remove Invoices
      localStorage.removeItem(`${INVOICES_KEY_PREFIX}${clientId}`);
      
      // 6. Remove Tasks
      const tasks = storageService.getTasks();
      const filteredTasks = tasks.filter(t => t.clientId !== clientId);
      storageService.saveTasks(filteredTasks);
  },

  // --- Firm Profile ---
  saveFirmProfile: (profile: FirmProfile) => {
      try {
          localStorage.setItem(FIRM_PROFILE_KEY, JSON.stringify(profile));
      } catch (error) {
          console.error('Failed to save firm profile', error);
      }
  },

  getFirmProfile: (): FirmProfile | null => {
      try {
          const stored = localStorage.getItem(FIRM_PROFILE_KEY);
          return stored ? JSON.parse(stored) : null;
      } catch (error) {
          return null;
      }
  },

  // --- Module Persistence ---
  saveModuleState: (clientId: string, module: string, data: any) => {
      try {
          localStorage.setItem(`${MODULE_STATE_PREFIX}${clientId}-${module}`, JSON.stringify(data));
      } catch (error) {
          console.error(`Failed to save state for ${module}`, error);
      }
  },

  getModuleState: (clientId: string, module: string): any | null => {
      try {
          const stored = localStorage.getItem(`${MODULE_STATE_PREFIX}${clientId}-${module}`);
          return stored ? JSON.parse(stored) : null;
      } catch (error) {
          return null;
      }
  },

  // --- Document Management ---
  saveDocument: (doc: ClientDocument) => {
      try {
          const docs = storageService.getAllDocuments();
          docs.push(doc);
          localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(docs));
          storageService.logActivity({
              id: Date.now().toString(),
              clientId: doc.clientId,
              clientName: 'System', // Ideally pass client name
              action: 'Document Generated',
              timestamp: Date.now(),
              details: doc.title
          });
      } catch (error) {
          console.error('Failed to save document', error);
      }
  },
  
  updateDocument: (updatedDoc: ClientDocument) => {
      const docs = storageService.getAllDocuments();
      const index = docs.findIndex(d => d.id === updatedDoc.id);
      if (index !== -1) {
          docs[index] = updatedDoc;
          localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(docs));
      }
  },

  getDocumentsForClient: (clientId: string): ClientDocument[] => {
      const docs = storageService.getAllDocuments();
      return docs.filter(d => d.clientId === clientId).sort((a, b) => b.createdAt - a.createdAt);
  },

  getAllDocuments: (): ClientDocument[] => {
      try {
          const stored = localStorage.getItem(DOCUMENTS_KEY);
          return stored ? JSON.parse(stored) : [];
      } catch (error) {
          return [];
      }
  },
  
  deleteDocument: (docId: string) => {
      const docs = storageService.getAllDocuments();
      const filtered = docs.filter(d => d.id !== docId);
      localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(filtered));
  },

  // --- Activity Logging ---
  logActivity: (log: ActivityLog) => {
      try {
          const logs = storageService.getLogs();
          logs.unshift(log); // Add to top
          // Keep max 50 logs
          const trimmedLogs = logs.slice(0, 50);
          localStorage.setItem(ACTIVITY_LOG_KEY, JSON.stringify(trimmedLogs));
      } catch (error) {
          console.error('Failed to log activity', error);
      }
  },

  getLogs: (): ActivityLog[] => {
      try {
          const stored = localStorage.getItem(ACTIVITY_LOG_KEY);
          return stored ? JSON.parse(stored) : [];
      } catch (error) {
          return [];
      }
  },

  // --- Invoicing ---
  saveInvoices: (clientId: string, invoices: Invoice[]) => {
      localStorage.setItem(`${INVOICES_KEY_PREFIX}${clientId}`, JSON.stringify(invoices));
  },

  getInvoices: (clientId: string): Invoice[] => {
      const stored = localStorage.getItem(`${INVOICES_KEY_PREFIX}${clientId}`);
      return stored ? JSON.parse(stored) : [];
  },
  
  // --- Tasks Management ---
  saveTasks: (tasks: Task[]) => {
      localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  },

  getTasks: (): Task[] => {
      try {
          const stored = localStorage.getItem(TASKS_KEY);
          return stored ? JSON.parse(stored) : [];
      } catch (error) {
          return [];
      }
  },

  // --- Timesheets & Time Tracking ---
  saveTimeLog: (log: TimeLog) => {
      const logs = storageService.getTimeLogs();
      logs.push(log);
      localStorage.setItem(TIMELOGS_KEY, JSON.stringify(logs));
  },
  
  getTimeLogs: (): TimeLog[] => {
      try {
          const stored = localStorage.getItem(TIMELOGS_KEY);
          return stored ? JSON.parse(stored) : [];
      } catch (error) {
          return [];
      }
  },
  
  getUnbilledTimeLogs: (clientId: string): TimeLog[] => {
      const logs = storageService.getTimeLogs();
      return logs.filter(l => l.clientId === clientId && l.billable && !l.billed);
  },
  
  markTimeLogsAsBilled: (logIds: string[]) => {
      const logs = storageService.getTimeLogs();
      const updatedLogs = logs.map(l => logIds.includes(l.id) ? { ...l, billed: true } : l);
      localStorage.setItem(TIMELOGS_KEY, JSON.stringify(updatedLogs));
  },

  // --- Backup & Restore ---
  createBackup: (): string => {
      const data: Record<string, string> = {};
      for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('ca-agent-')) {
              const value = localStorage.getItem(key);
              if (value) data[key] = value;
          }
      }
      return JSON.stringify(data);
  },

  restoreBackup: (jsonString: string): boolean => {
      try {
          const data = JSON.parse(jsonString);
          if (typeof data !== 'object') return false;
          
          Object.keys(data).forEach(key => {
              if (key.startsWith('ca-agent-')) {
                  localStorage.setItem(key, data[key]);
              }
          });
          return true;
      } catch (error) {
          console.error('Restore failed', error);
          return false;
      }
  },
  
  // --- Theme Management ---
  saveTheme: (isDark: boolean) => {
      localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
  },

  getTheme: (): boolean => {
      return localStorage.getItem(THEME_KEY) === 'dark';
  },
  
  // --- Stats Helper ---
  getDashboardStats: () => {
      const clients = storageService.getClients() || [];
      const docs = storageService.getAllDocuments();
      const logs = storageService.getLogs();
      
      // Calculate Invoice Totals across all clients
      let totalBilled = 0;
      clients.forEach(c => {
          const invoices = storageService.getInvoices(c.id);
          totalBilled += invoices.reduce((sum, inv) => sum + inv.total, 0);
      });

      return {
          totalClients: clients.length,
          totalDocuments: docs.length,
          recentActivity: logs.slice(0, 5),
          totalBilled
      };
  }
};
