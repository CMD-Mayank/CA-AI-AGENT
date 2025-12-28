
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

export interface PromptTemplate {
    id: string;
    category: string;
    title: string;
    prompt: string;
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
    Team = 'Team Management',
    Workflows = 'Service Workflows',
    KYC = 'KYC Vault',
    Intelligence = 'Firm Intelligence',
}

export type ThemeColor = 'teal' | 'blue' | 'indigo' | 'rose' | 'orange' | 'violet';

export interface CloudSyncSettings {
    enabled: boolean;
    lastSyncedAt?: number;
    encryptionKey: string;
    serverEndpoint: string;
    autoSync: boolean;
}

export interface Client {
    id: string;
    name: string;
    type: 'Individual' | 'Company' | 'LLP';
    pan: string;
    industry: string;
    email?: string;
    phone?: string;
    address?: string;
    onboardingDate?: number;
    kycStatus?: 'Pending' | 'Verified' | 'Expired';
}

export interface CommunicationLog {
    id: string;
    clientId: string;
    type: 'Email' | 'WhatsApp' | 'Call' | 'Meeting';
    subject: string;
    timestamp: number;
    status: 'Sent' | 'Delivered' | 'Logged';
}

export interface Firm {
    id: string;
    name: string;
    subscription_status: 'active' | 'trial' | 'expired';
    created_at: string;
    frn?: string;
}

export interface StaffMember {
    id: string;
    name: string;
    role: 'Partner' | 'Manager' | 'Senior Associate' | 'Article Assistant' | 'Staff';
    email: string;
    utilization: number; // percentage
    activeTasks: number;
    status: 'Online' | 'Offline' | 'On Leave';
}

export interface ServiceTemplate {
    id: string;
    title: string;
    category: 'Tax' | 'Audit' | 'Compliance' | 'Advisory';
    estimatedHours: number;
    steps: string[];
}

export interface FirmProfile {
    name: string;
    frn: string; 
    address: string;
    website: string;
    cloudSync?: CloudSyncSettings;
}

export interface ClientDocument {
    id: string;
    clientId: string;
    title: string;
    type: 'Tax Report' | 'Compliance Audit' | 'Financial Forecast' | 'Advisory Opinion' | 'Invoice' | 'Financial Report' | 'KYC';
    content: string;
    createdAt: number;
    createdBy: string; 
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
    serviceType?: string;
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
