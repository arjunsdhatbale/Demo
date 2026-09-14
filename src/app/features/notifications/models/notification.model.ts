// src/app/features/notifications/models/notification.model.ts
export interface NotificationMessage {
  message: string;
  timestamp?: string;
  sender?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole?: string;
  avatarColor?: string;
  content: string;
  timestamp: string;
  type?: 'CHAT' | 'SYSTEM';
}

export interface ChatUser {
  id: string;
  name: string;
  role: string;
  avatarColor: string;
  initials: string;
}