import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { PaymentService } from '../services/payment.service';
import { Payment, PaymentProcessRequest } from '../models/payment.model';

@Component({
  selector: 'app-payment-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './payment-dialog.component.html',
  styleUrl: './payment-dialog.component.scss'
})
export class PaymentDialogComponent {
  public paymentService = inject(PaymentService);
  private messageService = inject(MessageService);

  activeTab: 'UPI' | 'CREDIT_CARD' | 'NET_BANKING' | 'CASH_ON_DELIVERY' = 'UPI';

  // Form inputs
  upiId = 'arjun@okaxis';
  selectedUpiApp = 'Google Pay';

  cardNumber = '4532 8921 7843 9012';
  cardHolder = 'Arjun Dhatbale';
  cardExpiry = '08/29';
  cardCvv = '842';

  selectedBank = 'HDFC Bank';

  // Processing & Success states
  processing = signal<boolean>(false);
  paymentSuccess = signal<boolean>(false);
  completedPayment = signal<Payment | null>(null);

  upiApps = [
    { name: 'Google Pay', icon: 'pi pi-google' },
    { name: 'PhonePe', icon: 'pi pi-mobile' },
    { name: 'Paytm', icon: 'pi pi-wallet' },
    { name: 'BHIM UPI', icon: 'pi pi-qrcode' }
  ];

  banks = [
    { name: 'HDFC Bank', code: 'HDFC' },
    { name: 'State Bank of India', code: 'SBI' },
    { name: 'ICICI Bank', code: 'ICICI' },
    { name: 'Axis Bank', code: 'AXIS' },
    { name: 'Kotak Mahindra', code: 'KOTAK' },
    { name: 'Punjab National Bank', code: 'PNB' }
  ];

  private lastOrderId: number | null = null;

  get isVisible(): boolean {
    return this.paymentService.isDialogOpen();
  }

  set isVisible(val: boolean) {
    if (!val) {
      this.close();
    }
  }

  get context() {
    const ctx = this.paymentService.activeDialogContext();
    if (ctx && ctx.orderId !== this.lastOrderId) {
      this.lastOrderId = ctx.orderId;
      if (ctx.initialMethod) {
        const m = ctx.initialMethod.toUpperCase();
        if (m.includes('UPI') || m.includes('QR')) {
          this.activeTab = 'UPI';
        } else if (m.includes('CARD') || m.includes('CREDIT') || m.includes('DEBIT')) {
          this.activeTab = 'CREDIT_CARD';
        } else if (m.includes('NET') || m.includes('BANK')) {
          this.activeTab = 'NET_BANKING';
        } else if (m.includes('COD') || m.includes('CASH')) {
          this.activeTab = 'CASH_ON_DELIVERY';
        }
      }
    }
    return ctx;
  }

  selectTab(tab: 'UPI' | 'CREDIT_CARD' | 'NET_BANKING' | 'CASH_ON_DELIVERY') {
    this.activeTab = tab;
  }

  formatCardNumber() {
    let clean = this.cardNumber.replace(/\D/g, '').substring(0, 16);
    this.cardNumber = clean.replace(/(\d{4})(?=\d)/g, '$1 ');
  }

  formatExpiry() {
    let clean = this.cardExpiry.replace(/\D/g, '').substring(0, 4);
    if (clean.length >= 2) {
      this.cardExpiry = clean.substring(0, 2) + '/' + clean.substring(2);
    } else {
      this.cardExpiry = clean;
    }
  }

  executePayment() {
    const ctx = this.context;
    if (!ctx) return;

    this.processing.set(true);

    const payload: PaymentProcessRequest = {
      orderId: ctx.orderId,
      paymentMethod: this.activeTab,
      upiId: this.activeTab === 'UPI' ? this.upiId : undefined,
      cardNumber: this.activeTab === 'CREDIT_CARD' ? this.cardNumber : undefined,
      cardHolder: this.activeTab === 'CREDIT_CARD' ? this.cardHolder : undefined,
      cardExpiry: this.activeTab === 'CREDIT_CARD' ? this.cardExpiry : undefined,
      cvv: this.activeTab === 'CREDIT_CARD' ? this.cardCvv : undefined,
      bankName: this.activeTab === 'NET_BANKING' ? this.selectedBank : undefined,
      notes: `Simulated gateway payment via ${this.activeTab}`
    };

    // Simulate realistic gateway roundtrip delay (800ms)
    setTimeout(() => {
      this.paymentService.processPayment(payload).subscribe({
        next: (res) => {
          this.processing.set(false);
          this.paymentSuccess.set(true);
          this.completedPayment.set(res.data);

          this.messageService.add({
            severity: 'success',
            summary: 'Payment Approved',
            detail: `Transaction #${res.data.transactionId} verified successfully!`
          });

          if (ctx.onSuccessCallback) {
            ctx.onSuccessCallback();
          }
        },
        error: (err) => {
          this.processing.set(false);
          console.error('Payment processing failed:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Payment Failed',
            detail: err.error?.message || err.error?.detail || 'Could not complete transaction. Please try again.'
          });
        }
      });
    }, 800);
  }

  close() {
    this.lastOrderId = null;
    this.paymentSuccess.set(false);
    this.completedPayment.set(null);
    this.processing.set(false);
    this.paymentService.closePaymentDialog();
  }
}
