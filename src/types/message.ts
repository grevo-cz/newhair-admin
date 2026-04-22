export type MessageSender = 'patient' | 'admin';
export type MessageChannel = 'whatsapp' | 'in-app';

export interface Message {
  id: string;
  patientId: string;
  sender: MessageSender;
  channel: MessageChannel;
  text: string;
  timestamp: string;          // ISO datetime
  read: boolean;
}

export interface Thread {
  patientId: string;
  messages: Message[];
  archived: boolean;
}
