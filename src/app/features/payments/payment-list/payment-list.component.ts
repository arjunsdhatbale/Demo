import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { Select } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';

import { PaymentService } from '../services/payment.service';
import { CurrentUserService } from '../../../core/services/current-user.service';
import { Payment, PaymentStatus, PaymentStats } from '../models/payment.model';

@Component({
  selector: 'app-payment-list',
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
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    ToastModule,
    ConfirmDialogModule,
    TooltipModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './payment-list.component.html',
  styleUrl: './payment-list.component.scss'
})
export class PaymentListComponent implements OnInit {
  private paymentService = inject(PaymentService);
  public currentUserService = inject(CurrentUserService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private router = inject(Router);

  payments = signal<Payment[]>([]);
  stats = signal<PaymentStats | null>(null);
  loading = signal<boolean>(false);

  // Tab: 'my' or 'all'
  activeTab = signal<'my' | 'all'>('all');

  searchKeyword = '';
  selectedStatus: string | null = null;

  // Receipt Modal
  receiptDialogVisible = false;
  selectedPayment: Payment | null = null;

  // Refund Modal
  refundDialogVisible = false;
  paymentToRefund: Payment | null = null;
  refundReason = 'Customer requested refund / cancellation';
  refundLoading = signal<boolean>(false);

  statusFilterOptions = [
    { label: 'All Statuses', value: null },
    { label: 'Completed (PAID)', value: 'PAID' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Failed', value: 'FAILED' },
    { label: 'Refunded', value: 'REFUNDED' }
  ];

  filteredPayments = computed(() => {
    let list = [...this.payments()];

    if (this.searchKeyword.trim()) {
      const q = this.searchKeyword.toLowerCase().trim();
      list = list.filter(p =>
        p.transactionId.toLowerCase().includes(q) ||
        (p.orderNumber && p.orderNumber.toLowerCase().includes(q)) ||
        (p.customerName && p.customerName.toLowerCase().includes(q)) ||
        p.paymentMethod.toLowerCase().includes(q)
      );
    }

    if (this.selectedStatus) {
      list = list.filter(p => p.paymentStatus === this.selectedStatus);
    }

    return list;
  });

  ngOnInit(): void {
    if (this.currentUserService.isAdmin()) {
      this.activeTab.set('all');
    } else {
      this.activeTab.set('my');
    }

    this.loadPayments();
    this.loadStats();
  }

  loadPayments(): void {
    this.loading.set(true);
    const isAll = this.activeTab() === 'all';
    const userId = isAll ? undefined : this.currentUserService.currentUser().id;

    this.paymentService.getAllPayments(userId).subscribe({
      next: (res) => {
        if (res.data) {
          this.payments.set(res.data);
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error fetching payments:', err);
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Fetch Error',
          detail: 'Could not load payment records.'
        });
      }
    });
  }

  loadStats(): void {
    this.paymentService.getPaymentStats().subscribe({
      next: (res) => {
        if (res.data) {
          this.stats.set(res.data);
        }
      },
      error: (err) => console.error('Error loading payment stats:', err)
    });
  }

  switchTab(tab: 'my' | 'all'): void {
    this.activeTab.set(tab);
    this.loadPayments();
  }

  openReceipt(payment: Payment): void {
    this.selectedPayment = payment;
    this.receiptDialogVisible = true;
  }

  openRefundModal(payment: Payment): void {
    this.paymentToRefund = payment;
    this.refundReason = 'Customer requested cancellation';
    this.refundDialogVisible = true;
  }

  submitRefund(): void {
    if (!this.paymentToRefund || !this.refundReason.trim()) return;

    this.refundLoading.set(true);
    this.paymentService.refundPayment(this.paymentToRefund.id, { reason: this.refundReason.trim() }).subscribe({
      next: (res) => {
        this.refundLoading.set(false);
        this.refundDialogVisible = false;
        this.messageService.add({
          severity: 'info',
          summary: 'Refund Processed',
          detail: `Transaction #${res.data.transactionId} refunded successfully.`
        });
        this.loadPayments();
        this.loadStats();
      },
      error: (err) => {
        this.refundLoading.set(false);
        console.error('Refund failed:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Refund Failed',
          detail: err.error?.message || 'Could not process refund.'
        });
      }
    });
  }

  getStatusSeverity(status: PaymentStatus): 'success' | 'warn' | 'danger' | 'contrast' {
    switch (status) {
      case 'PAID': return 'success';
      case 'PENDING': return 'warn';
      case 'FAILED': return 'danger';
      case 'REFUNDED': return 'contrast';
      default: return 'warn';
    }
  }

  printReceipt(): void {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }

  navigateToOrders(): void {
    this.router.navigate(['/orders']);
  }
}
