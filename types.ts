
export enum MessageSender {
  USER = 'user',
  AI = 'ai',
}

export interface ChatMessage {
  sender: MessageSender;
  text: string;
  file?: { name: string; type: string; };
  timestamp?: number;
}

export enum UserPersona {
  SALARIED = 'Salaried Employee',
  FOUNDER = 'Startup Founder',
  CFO = 'Enterprise CFO',
}

export interface Persona {
  name: UserPersona;
  prompt: string;
  icon: string;
}

export enum View {
    Dashboard = 'Dashboard',
    ClientOverview = 'Client Overview',
    TaxFiling = 'Tax Filing',
    Compliance = 'Compliance',
    Advisory = 'Advisory',
    Forecasting = 'Forecasting',
    Documents = 'Documents',
    Billing = 'Billing',
    Tasks = 'Tasks',
    Regulatory = 'Regulatory',
    Settings = 'Settings',
    AuditLog = 'AuditLog',
    Timesheets = 'Timesheets',
    Help = 'Help',
    Portal = 'Portal',
    SuperAdmin = 'SuperAdmin',
}

export type ThemeColor = 'teal' | 'blue' | 'indigo' | 'rose' | 'orange' | 'violet';

export interface Client {
    id: string;
    name: string;
    type: 'Individual' | 'Company' | 'LLP';
    pan: string;
    industry: string;
    email?: string;
    phone?: string;
    address?: string;
}

export interface FirmProfile {
    name: string;
    frn: string; // Firm Registration Number
    address: string;
    website: string;
}

export interface Firm {
    id: string;
    name: string;
    frn?: string;
    subscription_status: string;
    created_at: string;
}

export interface ClientDocument {
    id: string;
    clientId: string;
    title: string;
    type: 'Tax Report' | 'Compliance Audit' | 'Financial Forecast' | 'Advisory Opinion' | 'Invoice' | 'Financial Report';
    content: string;
    createdAt: number;
    createdBy: string; // User email or 'AI'
    status: 'Draft' | 'Pending Review' | 'Approved' | 'Rejected' | 'Signed';
    signedBy?: string;
    signedAt?: number;
}

export interface ActivityLog {
    id: string;
    clientId: string;
    clientName: string;
    action: string;
    timestamp: number;
    details?: string;
}

export interface Invoice {
    id: string;
    clientId: string;
    number: string;
    date: string;
    dueDate: string;
    items: { description: string; amount: number }[];
    total: number;
    status: 'Draft' | 'Sent' | 'Paid';
}

export interface Task {
    id: string;
    title: string;
    clientId: string;
    clientName: string;
    assignee: string;
    dueDate: string;
    status: 'To Do' | 'In Progress' | 'Review' | 'Done';
    priority: 'High' | 'Medium' | 'Low';
}

export interface TimeLog {
    id: string;
    clientId: string;
    clientName: string;
    taskId?: string;
    taskTitle?: string;
    user: string;
    date: string;
    duration: number; // in minutes
    description: string;
    billable: boolean;
    billed: boolean;
}

export interface PromptTemplate {
    id: string;
    category: 'Notices' | 'Drafting' | 'Tax Planning' | 'Audit';
    title: string;
    prompt: string;
}