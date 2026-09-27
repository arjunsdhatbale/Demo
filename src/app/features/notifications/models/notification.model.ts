// src/app/features/notifications/models/notification.model.ts
export interface NotificationMessage {
  id?: string;
  recipient?: string;
  title?: string;
  message: string;
  type?: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'WELCOME' | 'PASSWORD_RESET' | 'BULK_UPLOAD' | 'SECURITY';
  timestamp?: string;
  sender?: string;
  metadata?: Record<string, any>;
}

export interface NotificationStatus {
  enabled: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  message: string;
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