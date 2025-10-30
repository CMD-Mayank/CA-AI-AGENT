
export enum MessageSender {
  USER = 'user',
  AI = 'ai',
}

export interface ChatMessage {
  sender: MessageSender;
  text: string;
  file?: { name: string; type: string; };
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
    TaxFiling = 'Tax Filing',
    Compliance = 'Compliance',
    Advisory = 'Advisory',
    Forecasting = 'Forecasting',
}