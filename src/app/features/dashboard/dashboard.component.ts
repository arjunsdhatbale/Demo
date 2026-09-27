import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Card } from 'primeng/card';
import { Button } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { Divider } from 'primeng/divider';
import { InputText } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { NotificationService } from '../notifications/services/notification.service';
import { ProductService } from '../products/services/product.service';
import { UserService } from '../users/services/user.service';
import { OrderService } from '../orders/services/order.service';
import { PaymentService } from '../payments/services/payment.service';
import { PaymentStats } from '../payments/models/payment.model';
import { ProductStore } from '../../store/product.store';
import { UserStore } from '../../store/user.store';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Card,
    Button,
    TableModule,
    Tag,
    Divider,
    InputText
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private router = inject(Router);
  private messageService = inject(MessageService);
  private notificationService = inject(NotificationService);
  private productService = inject(ProductService);
  private userService = inject(UserService);
  private orderService = inject(OrderService);
  private paymentService = inject(PaymentService);
  private productStore = inject(ProductStore);
  private userStore = inject(UserStore);

  customMessage = '';
  totalOrders = signal<number>(0);
  paymentStats = signal<PaymentStats | null>(null);

  unreadCount = this.notificationService.unreadCount;
  totalProducts = computed(() => this.productStore.totalProducts());
  totalUsers = computed(() => this.userStore.totalUsers());

  ngOnInit(): void {
    if (this.productStore.products().length === 0) {
      this.productService.getAllProducts().subscribe({
        next: (res) => {
          if (res?.data) this.productStore.setProducts(res.data);
        },
        error: () => {}
      });
    }

    if (this.userStore.users().length === 0) {
      this.userService.getAllUsers().subscribe({
        next: (res) => {
          if (res?.data) this.userStore.setUsers(res.data);
        },
        error: () => {}
      });
    }

    this.orderService.getOrderStats().subscribe({
      next: (res) => {
        if (res?.data) {
          this.totalOrders.set(res.data.totalOrders);
        }
      },
      error: () => {}
    });

    this.paymentService.getPaymentStats().subscribe({
      next: (res) => {
        if (res?.data) {
          this.paymentStats.set(res.data);
        }
      },
      error: () => {}
    });
  }

  sampleProducts = [
    { id: 101, name: 'Logitech MX Master 3S', category: 'Electronics', price: 8999, stock: 24, status: 'ACTIVE' },
    { id: 102, name: 'Mechanical Gaming Keyboard', category: 'Electronics', price: 5499, stock: 12, status: 'ACTIVE' },
    { id: 103, name: 'Ergonomic Office Chair', category: 'Furniture', price: 14999, stock: 5, status: 'ACTIVE' },
    { id: 104, name: 'Sony WH-1000XM5 Headphones', category: 'Electronics', price: 26990, stock: 0, status: 'OUT_OF_STOCK' },
    { id: 105, name: 'Standing Desk Converter', category: 'Furniture', price: 11499, stock: 8, status: 'ACTIVE' },
    { id: 106, name: 'USB-C Multiport Adapter', category: 'Accessories', price: 2499, stock: 3, status: 'INACTIVE' }
  ];

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  triggerToast(severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string): void {
    this.notificationService.addNotification(`${summary}: ${detail}`, severity);
  }

  sendCustomNotification(): void {
    if (!this.customMessage.trim()) return;
    this.notificationService.sendNotification(this.customMessage, 'info');
    this.customMessage = '';
  }

  getStatusSeverity(status: string): 'success' | 'warn' | 'danger' | 'info' {
    const map: Record<string, 'success' | 'warn' | 'danger' | 'info'> = {
      ACTIVE: 'success',
      INACTIVE: 'warn',
      OUT_OF_STOCK: 'danger'
    };
    return map[status] || 'info';
  }
}