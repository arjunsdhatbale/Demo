import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { CartService } from '../services/cart.service';
import { OrderService } from '../services/order.service';
import { CurrentUserService } from '../../../core/services/current-user.service';
import { PaymentService } from '../../payments/services/payment.service';
import { OrderCreateRequest } from '../models/order.model';

interface PaymentOption {
  label: string;
  value: string;
  icon: string;
}

@Component({
  selector: 'app-checkout-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    Select,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './checkout-dialog.component.html',
  styleUrl: './checkout-dialog.component.scss'
})
export class CheckoutDialogComponent {
  public cartService = inject(CartService);
  private orderService = inject(OrderService);
  private paymentService = inject(PaymentService);
  public currentUserService = inject(CurrentUserService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  loading = signal<boolean>(false);

  shippingAddress = 'Flat 402, Green Valley Heights, MG Road, Pune, Maharashtra - 411001';
  contactPhone = '';
  paymentMethod = 'Cash on Delivery';
  notes = '';

  paymentOptions: PaymentOption[] = [
    { label: 'Cash on Delivery (COD)', value: 'Cash on Delivery', icon: 'pi pi-wallet' },
    { label: 'UPI / QR Code', value: 'UPI', icon: 'pi pi-qrcode' },
    { label: 'Credit / Debit Card', value: 'Credit Card', icon: 'pi pi-credit-card' },
    { label: 'Net Banking', value: 'Net Banking', icon: 'pi pi-building' }
  ];

  get isVisible(): boolean {
    return this.cartService.checkoutVisible();
  }

  set isVisible(val: boolean) {
    if (!val) {
      this.cartService.closeCheckout();
    }
  }

  ngOnInit() {
    const user = this.currentUserService.currentUser();
    if (user?.phone) {
      this.contactPhone = user.phone;
    }
  }

  placeOrder() {
    if (this.cartService.isEmpty()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Cart Empty',
        detail: 'Cannot checkout with an empty cart.'
      });
      return;
    }

    if (!this.shippingAddress.trim()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Missing Field',
        detail: 'Please provide a valid shipping address.'
      });
      return;
    }

    const user = this.currentUserService.currentUser();
    if (!user) {
      this.messageService.add({
        severity: 'error',
        summary: 'No Active User',
        detail: 'Please select an active user before placing an order.'
      });
      return;
    }

    const payload: OrderCreateRequest = {
      userId: user.id,
      items: this.cartService.items().map(i => ({
        productId: i.product.id,
        quantity: i.quantity
      })),
      shippingAddress: this.shippingAddress.trim(),
      contactPhone: this.contactPhone.trim() || user.phone || '9876543210',
      paymentMethod: this.paymentMethod,
      notes: this.notes.trim() || undefined
    };

    this.loading.set(true);
    this.orderService.createOrder(payload).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.cartService.clearCart();
        this.cartService.closeCheckout();

        const createdOrder = res.data;

        this.messageService.add({
          severity: 'success',
          summary: 'Order Placed!',
          detail: `Order #${createdOrder.orderNumber} placed successfully!`
        });

        if (this.paymentMethod !== 'Cash on Delivery') {
          // Launch Payment Gateway dialog directly
          this.paymentService.openPaymentDialog({
            orderId: createdOrder.id,
            orderNumber: createdOrder.orderNumber,
            amount: createdOrder.totalAmount,
            customerName: createdOrder.customerName || `${user.firstName} ${user.lastName}`,
            initialMethod: this.paymentMethod,
            onSuccessCallback: () => {
              this.router.navigate(['/orders']);
            }
          });
        } else {
          // COD order: Navigate to orders page after short timeout
          setTimeout(() => {
            this.router.navigate(['/orders']);
          }, 800);
        }
      },
      error: (err) => {
        this.loading.set(false);
        console.error('Error placing order:', err);
        const errMsg = err.error?.message || err.error?.detail || 'Failed to place order. Please try again.';
        this.messageService.add({
          severity: 'error',
          summary: 'Order Failed',
          detail: errMsg
        });
      }
    });
  }
}
