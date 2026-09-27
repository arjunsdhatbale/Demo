import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { Select } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';

import { OrderService } from '../services/order.service';
import { CurrentUserService } from '../../../core/services/current-user.service';
import { PaymentService } from '../../payments/services/payment.service';
import { Order, OrderStatus, OrderSummaryStats } from '../models/order.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    TagModule,
    CardModule,
    DialogModule,
    Select,
    ToastModule,
    ConfirmDialogModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    TooltipModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.scss'
})
export class OrderListComponent implements OnInit {
  private orderService = inject(OrderService);
  private paymentService = inject(PaymentService);
  public currentUserService = inject(CurrentUserService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private router = inject(Router);

  orders = signal<Order[]>([]);
  stats = signal<OrderSummaryStats | null>(null);
  loading = signal<boolean>(false);

  // Tab: 'my' or 'all'
  activeTab = signal<'my' | 'all'>('my');

  searchKeyword = '';
  selectedStatus: string | null = null;

  // Order Details Modal
  detailsDialogVisible = false;
  selectedOrder: Order | null = null;

  // Status Update Modal (Admin)
  statusDialogVisible = false;
  orderToUpdate: Order | null = null;
  newStatusValue: OrderStatus = 'CONFIRMED';

  statusOptions = [
    { label: 'Pending', value: 'PENDING' },
    { label: 'Confirmed', value: 'CONFIRMED' },
    { label: 'Processing', value: 'PROCESSING' },
    { label: 'Shipped', value: 'SHIPPED' },
    { label: 'Delivered', value: 'DELIVERED' },
    { label: 'Cancelled', value: 'CANCELLED' }
  ];

  filterStatusOptions = [
    { label: 'All Statuses', value: null },
    ...this.statusOptions
  ];

  filteredOrders = computed(() => {
    let list = [...this.orders()];

    if (this.searchKeyword.trim()) {
      const q = this.searchKeyword.toLowerCase().trim();
      list = list.filter(o =>
        o.orderNumber.toLowerCase().includes(q) ||
        (o.customerName && o.customerName.toLowerCase().includes(q)) ||
        (o.shippingAddress && o.shippingAddress.toLowerCase().includes(q))
      );
    }

    if (this.selectedStatus) {
      list = list.filter(o => o.status === this.selectedStatus);
    }

    return list;
  });

  ngOnInit(): void {
    // If admin, default to 'all' tab, else 'my'
    if (this.currentUserService.isAdmin()) {
      this.activeTab.set('all');
    } else {
      this.activeTab.set('my');
    }

    this.loadOrders();
    this.loadStats();
  }

  loadOrders(): void {
    this.loading.set(true);
    const isAll = this.activeTab() === 'all';
    const userId = isAll ? undefined : this.currentUserService.currentUser()?.id;

    this.orderService.getAllOrders(userId).subscribe({
      next: (res) => {
        if (res.data) {
          this.orders.set(res.data);
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading orders:', err);
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Fetch Error',
          detail: 'Failed to load orders.'
        });
      }
    });
  }

  loadStats(): void {
    this.orderService.getOrderStats().subscribe({
      next: (res) => {
        if (res.data) {
          this.stats.set(res.data);
        }
      },
      error: (err) => console.error('Error fetching stats:', err)
    });
  }

  switchTab(tab: 'my' | 'all'): void {
    this.activeTab.set(tab);
    this.loadOrders();
  }

  openOrderDetails(order: Order): void {
    this.selectedOrder = order;
    this.detailsDialogVisible = true;
  }

  openStatusUpdateModal(order: Order): void {
    this.orderToUpdate = order;
    this.newStatusValue = order.status;
    this.statusDialogVisible = true;
  }

  saveStatusUpdate(): void {
    if (!this.orderToUpdate) return;

    const orderId = this.orderToUpdate.id;
    this.orderService.updateOrderStatus(orderId, this.newStatusValue).subscribe({
      next: (res) => {
        this.statusDialogVisible = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Status Updated',
          detail: `Order #${res.data.orderNumber} updated to ${res.data.status}`
        });
        this.loadOrders();
        this.loadStats();
      },
      error: (err) => {
        console.error('Error updating status:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Update Failed',
          detail: err.error?.message || 'Could not update status'
        });
      }
    });
  }

  confirmCancelOrder(order: Order): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to cancel order #${order.orderNumber}? Product stock will be automatically restored.`,
      header: 'Cancel Order Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary p-button-text',
      accept: () => {
        const userId = this.currentUserService.currentUser()?.id;
        this.orderService.cancelOrder(order.id, userId).subscribe({
          next: (res) => {
            this.messageService.add({
              severity: 'info',
              summary: 'Order Cancelled',
              detail: `Order #${res.data.orderNumber} has been cancelled.`
            });
            this.loadOrders();
            this.loadStats();
          },
          error: (err) => {
            console.error('Error cancelling order:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Cancellation Failed',
              detail: err.error?.message || 'Could not cancel order.'
            });
          }
        });
      }
    });
  }

  getStatusSeverity(status: OrderStatus): 'warn' | 'info' | 'success' | 'danger' | 'secondary' {
    switch (status) {
      case 'PENDING': return 'warn';
      case 'CONFIRMED': return 'info';
      case 'PROCESSING': return 'secondary';
      case 'SHIPPED': return 'info';
      case 'DELIVERED': return 'success';
      case 'CANCELLED': return 'danger';
      default: return 'info';
    }
  }

  getPaymentStatusSeverity(status: string): 'success' | 'warn' | 'danger' {
    switch (status) {
      case 'PAID': return 'success';
      case 'PENDING': return 'warn';
      case 'FAILED': return 'danger';
      default: return 'warn';
    }
  }

  navigateToShop(): void {
    this.router.navigate(['/shop']);
  }

  openPaymentForOrder(order: Order): void {
    this.paymentService.openPaymentDialog({
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: order.totalAmount,
      customerName: order.customerName,
      initialMethod: order.paymentMethod,
      onSuccessCallback: () => {
        this.loadOrders();
        this.loadStats();
      }
    });
  }
}
