import { inject, Injectable, signal } from '@angular/core';
import { IMessage } from '@stomp/stompjs';
import { MessageService } from 'primeng/api';
import { NotificationMessage, ChatMessage } from '../models/notification.model';
import { WebsocketService } from '../../../core/services/websocket.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private wsService = inject(WebsocketService);
  private messageService = inject(MessageService);

  private initialNotifications: NotificationMessage[] = [
    {
      message: 'Welcome to PrimeNG demo! Components loaded successfully.',
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    },
    {
      message: 'Inventory alert: 3 products are low on stock.',
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    },
    {
      message: 'New user registered: Arjun Dhatbale (Admin)',
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ];

  private initialChatMessages: ChatMessage[] = [
    {
      id: 'msg-init-1',
      senderId: 'user_1',
      senderName: 'Arjun Dhatbale',
      senderRole: 'Admin',
      avatarColor: '#3b82f6',
      content: 'Hello Sarah! The Spring Boot 21 WebSocket backend is connected.',
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'CHAT'
    },
    {
      id: 'msg-init-2',
      senderId: 'user_2',
      senderName: 'Sarah Connor',
      senderRole: 'Manager',
      avatarColor: '#10b981',
      content: 'Hi Arjun! I am subscribed to /topic/notification and receiving messages.',
      timestamp: new Date(Date.now() - 1000 * 60 * 3).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'CHAT'
    }
  ];

  // Signal to hold all notifications & chat messages
  notifications = signal<NotificationMessage[]>(this.initialNotifications);
  chatMessages = signal<ChatMessage[]>(this.initialChatMessages);
  unreadCount = signal<number>(this.initialNotifications.length);

  private initialized = false;

  init(): void {
    if (this.initialized) return;
    this.initialized = true;

    try {
      this.wsService.connect();

      // Subscribe to /topic/notification for both system alerts and live chat
      this.wsService.subscribe('/topic/notification', (message: IMessage) => {
        try {
          const parsed = JSON.parse(message.body);
          if (parsed && parsed.senderId && parsed.content) {
            this.handleIncomingChat(parsed as ChatMessage);
            return;
          }
        } catch {
          // Plain text notification
        }
        this.addNotification(message.body, 'info');
      });
    } catch (err) {
      console.warn('WebSocket connection deferred:', err);
    }
  }

  handleIncomingChat(chat: ChatMessage): void {
    // Avoid duplicate message if already added
    const exists = this.chatMessages().some(m => m.id === chat.id);
    if (exists) return;

    this.chatMessages.update(list => [...list, chat]);
    this.unreadCount.update(count => count + 1);

    this.messageService.add({
      severity: 'info',
      summary: `💬 ${chat.senderName}`,
      detail: chat.content,
      life: 3500
    });
  }

  sendChatMessage(chat: ChatMessage): void {
    let sent = false;
    try {
      sent = this.wsService.sendMessage('/app/chat', JSON.stringify(chat));
    } catch {
      sent = false;
    }
    // If not connected to WS broker, add to local stream so UI is responsive
    if (!sent) {
      this.handleIncomingChat(chat);
    }
  }

  addNotification(message: string, severity: 'success' | 'info' | 'warn' | 'error' = 'info'): void {
    const notification: NotificationMessage = {
      message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    this.notifications.update(list => [notification, ...list]);
    this.unreadCount.update(count => count + 1);

    this.messageService.add({
      severity,
      summary: severity.toUpperCase(),
      detail: message,
      life: 4000
    });
  }

  // Send notification: send to WebSocket if connected (which broadcasts back), or fallback to local list
  sendNotification(message: string, severity: 'success' | 'info' | 'warn' | 'error' = 'info'): void {
    let sent = false;
    try {
      sent = this.wsService.sendMessage('/app/send-message', message);
    } catch {
      sent = false;
    }
    if (!sent) {
      this.addNotification(message, severity);
    }
  }

  markAllRead(): void {
    this.unreadCount.set(0);
  }

  clearAll(): void {
    this.notifications.set([]);
    this.unreadCount.set(0);
  }

  clearChat(): void {
    this.chatMessages.set([]);
  }
}
