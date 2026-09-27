import { Component, OnInit, inject, ElementRef, ViewChildren, QueryList, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { InputText } from 'primeng/inputtext';
import { Divider } from 'primeng/divider';
import { Toast } from 'primeng/toast';
import { Tag } from 'primeng/tag';
import { MessageService } from 'primeng/api';
import { NotificationService } from '../services/notification.service';
import { WebsocketService } from '../../../core/services/websocket.service';
import { ChatMessage, ChatUser } from '../models/notification.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Button,
    Card,
    InputText,
    Divider,
    Toast,
    Tag
  ],
  providers: [MessageService],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.scss'
})
export class NotificationComponent implements OnInit, AfterViewChecked {

  http = inject(HttpClient);
  notificationService = inject(NotificationService);
  wsService = inject(WebsocketService);
  messageService = inject(MessageService);

  // Active view mode: 'dual' | 'single' | 'system' | 'private'
  activeView: 'dual' | 'single' | 'system' | 'private' = 'dual';

  featureStatus = this.notificationService.featureStatus;
  currentUsername = this.notificationService.currentUsername;

  privateEchoInput = 'Testing user-targeted notification via @SendToUser';
  targetUserInput = 'sarah';
  directMessageInput = 'Hello Sarah! This is a private message directly to your queue.';
  resetEmailInput = 'arjun@example.com';
  testEmailRecipient = 'arjun@example.com';
  testEmailName = 'Arjun Dhatbale';
  resetLoading = false;
  emailLoading = false;

  user1: ChatUser = {
    id: 'user_1',
    name: 'Arjun Dhatbale',
    role: 'Admin',
    avatarColor: '#2563eb',
    initials: 'AD'
  };

  user2: ChatUser = {
    id: 'user_2',
    name: 'Sarah Connor',
    role: 'Manager',
    avatarColor: '#059669',
    initials: 'SC'
  };

  user1Input = '';
  user2Input = '';

  activeSingleUserId = 'user_1';
  singleUserInput = '';

  systemMessageInput = '';
  isConnected = false;

  chatMessages = this.notificationService.chatMessages;
  notifications = this.notificationService.notifications;
  unreadCount = this.notificationService.unreadCount;

  @ViewChildren('chatScrollBox') chatScrollBoxes!: QueryList<ElementRef>;
  private shouldScroll = false;

  ngOnInit(): void {
    this.notificationService.init();

    this.wsService.isConnected().subscribe(status => {
      this.isConnected = status;
    });
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  private scrollToBottom(): void {
    try {
      this.chatScrollBoxes?.forEach(box => {
        box.nativeElement.scrollTop = box.nativeElement.scrollHeight;
      });
    } catch {}
  }

  private getCurrentTime(): string {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  sendUser1Message(): void {
    if (!this.user1Input.trim()) return;
    const msg: ChatMessage = {
      id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      senderId: this.user1.id,
      senderName: this.user1.name,
      senderRole: this.user1.role,
      avatarColor: this.user1.avatarColor,
      content: this.user1Input.trim(),
      timestamp: this.getCurrentTime(),
      type: 'CHAT'
    };
    this.notificationService.sendChatMessage(msg);
    this.user1Input = '';
    this.shouldScroll = true;
  }

  sendUser2Message(): void {
    if (!this.user2Input.trim()) return;
    const msg: ChatMessage = {
      id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      senderId: this.user2.id,
      senderName: this.user2.name,
      senderRole: this.user2.role,
      avatarColor: this.user2.avatarColor,
      content: this.user2Input.trim(),
      timestamp: this.getCurrentTime(),
      type: 'CHAT'
    };
    this.notificationService.sendChatMessage(msg);
    this.user2Input = '';
    this.shouldScroll = true;
  }

  sendSingleUserMessage(): void {
    if (!this.singleUserInput.trim()) return;
    const user = this.activeSingleUserId === 'user_1' ? this.user1 : this.user2;
    const msg: ChatMessage = {
      id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      senderId: user.id,
      senderName: user.name,
      senderRole: user.role,
      avatarColor: user.avatarColor,
      content: this.singleUserInput.trim(),
      timestamp: this.getCurrentTime(),
      type: 'CHAT'
    };
    this.notificationService.sendChatMessage(msg);
    this.singleUserInput = '';
    this.shouldScroll = true;
  }

  sendQuick(userNum: 1 | 2, text: string): void {
    if (userNum === 1) {
      this.user1Input = text;
      this.sendUser1Message();
    } else {
      this.user2Input = text;
      this.sendUser2Message();
    }
  }

  sendSystemMessage(): void {
    if (!this.systemMessageInput.trim()) return;
    this.notificationService.sendNotification(this.systemMessageInput);
    this.systemMessageInput = '';
  }

  sendQuickToast(severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string): void {
    this.notificationService.addNotification(`${summary}: ${detail}`, severity);
  }

  clearChat(): void {
    this.notificationService.clearChat();
  }

  markAllRead(): void {
    this.notificationService.markAllRead();
  }

  clearAll(): void {
    this.notificationService.clearAll();
  }

  sendPrivateEcho(): void {
    if (!this.privateEchoInput.trim()) return;
    this.notificationService.sendPrivateEcho(this.privateEchoInput.trim());
    this.messageService.add({
      severity: 'info',
      summary: 'Private Echo Sent',
      detail: 'Dispatched to /app/private-notification. Response will arrive in your private queue!',
      life: 2500
    });
  }

  sendDirectToUser(): void {
    if (!this.targetUserInput.trim() || !this.directMessageInput.trim()) return;
    const payload = {
      recipient: this.targetUserInput.trim(),
      title: `Direct Message from ${this.currentUsername()}`,
      message: this.directMessageInput.trim(),
      type: 'INFO'
    };
    this.wsService.sendMessage('/app/send-to-user', JSON.stringify(payload));
    this.messageService.add({
      severity: 'success',
      summary: 'Direct Message Sent',
      detail: `Sent directly to ${this.targetUserInput}`,
      life: 2500
    });
  }

  triggerPasswordReset(): void {
    if (!this.resetEmailInput.trim()) return;
    this.resetLoading = true;
    this.notificationService.requestPasswordReset(this.resetEmailInput.trim()).subscribe({
      next: (res) => {
        this.resetLoading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Password Reset Initiated',
          detail: res.message || 'Password reset link & token dispatched to email and phone.',
          life: 4000
        });
      },
      error: (err) => {
        this.resetLoading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Password Reset Failed',
          detail: err.error?.message || 'Could not initiate password reset.',
          life: 4000
        });
      }
    });
  }

  triggerTestEmail(): void {
    if (!this.testEmailRecipient.trim()) return;
    this.emailLoading = true;
    this.http.post<any>(`${environment.apiUrl}/notifications/test-email`, null, {
      params: { toEmail: this.testEmailRecipient.trim(), name: this.testEmailName.trim() }
    }).subscribe({
      next: (res) => {
        this.emailLoading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Email Dispatched',
          detail: res.message || 'Welcome email dispatched asynchronously.',
          life: 4000
        });
      },
      error: (err) => {
        this.emailLoading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Email Failed',
          detail: err.error?.message || 'Failed to dispatch email.',
          life: 4000
        });
      }
    });
  }

  switchUserSession(username: string): void {
    this.notificationService.switchUser(username);
  }

  refreshFeatureStatus(): void {
    this.notificationService.checkFeatureStatus().subscribe({
      next: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Status Refreshed',
          detail: `Notification feature is ${this.featureStatus()?.status || 'ACTIVE'}`,
          life: 2000
        });
      }
    });
  }
}