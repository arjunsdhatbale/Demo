import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IMessage } from '@stomp/stompjs';
import { MessageService } from 'primeng/api';
import { Observable, catchError, of, tap } from 'rxjs';
import { NotificationMessage, ChatMessage, NotificationStatus } from '../models/notification.model';
import { WebsocketService } from '../../../core/services/websocket.service';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);
  private wsService = inject(WebsocketService);
  private messageService = inject(MessageService);

  private initialNotifications: NotificationMessage[] = [
    {
      title: 'Welcome to PrimeNG',
      message: 'Components and notification services loaded successfully.',
      type: 'INFO',
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    },
    {
      title: 'Inventory Alert',
      message: 'Inventory alert: 3 products are low on stock.',
      type: 'WARNING',
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    },
    {
      title: 'New Registration',
      message: 'New user registered: Arjun Dhatbale (Admin)',
      type: 'WELCOME',
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

  // Signals
  notifications = signal<NotificationMessage[]>(this.initialNotifications);
  chatMessages = signal<ChatMessage[]>(this.initialChatMessages);
  unreadCount = signal<number>(this.initialNotifications.length);
  featureStatus = signal<NotificationStatus | null>(null);
  currentUsername = signal<string>('arjun');

  private initialized = false;

  init(username = 'arjun'): void {
    this.currentUsername.set(username);
    this.checkFeatureStatus().subscribe();

    if (this.initialized) return;
    this.initialized = true;

    try {
      this.wsService.connect(username);

      // 1. Subscribe to User-Targeted Private Notifications (/user/queue/notifications)
      this.wsService.subscribe('/user/queue/notifications', (message: IMessage) => {
        try {
          const parsed = JSON.parse(message.body);
          this.handleIncomingNotification(parsed);
        } catch {
          this.addNotification(message.body, 'info');
        }
      });

      // 2. Subscribe to Global Broadcast Notifications (/topic/notifications)
      this.wsService.subscribe('/topic/notifications', (message: IMessage) => {
        try {
          const parsed = JSON.parse(message.body);
          this.handleIncomingNotification(parsed);
        } catch {
          this.addNotification(message.body, 'info');
        }
      });

      // 3. Subscribe to /topic/notification for peer chat compatibility
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

  switchUser(username: string): void {
    this.currentUsername.set(username);
    this.wsService.connect(username);
    this.messageService.add({
      severity: 'info',
      summary: 'Switched User Session',
      detail: `Now connected as ${username} to /user/queue/notifications`,
      life: 3000
    });
  }

  checkFeatureStatus(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/notifications/status`).pipe(
      tap(res => {
        if (res && res.data) {
          this.featureStatus.set(res.data as NotificationStatus);
        }
      }),
      catchError(err => {
        console.warn('Could not query notification feature status:', err);
        return of(null);
      })
    );
  }

  handleIncomingNotification(notif: any): void {
    const formatted: NotificationMessage = {
      id: notif.id,
      title: notif.title || 'System Notification',
      message: notif.message,
      type: notif.type || 'INFO',
      recipient: notif.recipient,
      timestamp: notif.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      metadata: notif.metadata
    };

    this.notifications.update(list => [formatted, ...list]);
    this.unreadCount.update(count => count + 1);

    const severityMap: Record<string, 'success' | 'info' | 'warn' | 'error'> = {
      SUCCESS: 'success',
      WELCOME: 'success',
      WARNING: 'warn',
      SECURITY: 'warn',
      ERROR: 'error',
      BULK_UPLOAD: 'info',
      INFO: 'info'
    };

    const severity = severityMap[formatted.type || 'INFO'] || 'info';

    this.messageService.add({
      severity,
      summary: formatted.title,
      detail: formatted.message,
      life: 5000
    });
  }

  handleIncomingChat(chat: ChatMessage): void {
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
    if (!sent) {
      this.handleIncomingChat(chat);
    }
  }

  sendPrivateEcho(message: string): boolean {
    return this.wsService.sendMessage('/app/private-notification', message);
  }

  requestPasswordReset(email: string): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/users/password-reset/request`, { email });
  }

  addNotification(message: string, severity: 'success' | 'info' | 'warn' | 'error' = 'info'): void {
    const notification: NotificationMessage = {
      message,
      title: severity.toUpperCase(),
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
