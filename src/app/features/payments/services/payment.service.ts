import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Payment,
  PaymentProcessRequest,
  PaymentRefundRequest,
  PaymentStats
} from '../models/payment.model';
import { ApiResponse } from '../../products/models/product.model';

export interface PaymentDialogContext {
  orderId: number;
  orderNumber: string;
  amount: number;
  customerName: string;
  initialMethod?: string;
  onSuccessCallback?: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/payments`;

  // State for global payment gateway dialog
  private _activeDialogContext = signal<PaymentDialogContext | null>(null);
  activeDialogContext = computed(() => this._activeDialogContext());
  isDialogOpen = computed(() => this._activeDialogContext() !== null);

  openPaymentDialog(context: PaymentDialogContext) {
    this._activeDialogContext.set(context);
  }

  closePaymentDialog() {
    this._activeDialogContext.set(null);
  }

  processPayment(request: PaymentProcessRequest): Observable<ApiResponse<Payment>> {
    return this.http.post<ApiResponse<Payment>>(`${this.apiUrl}/process`, request);
  }

  getAllPayments(userId?: number, orderId?: number): Observable<ApiResponse<Payment[]>> {
    let url = this.apiUrl;
    const params: string[] = [];
    if (userId) params.push(`userId=${userId}`);
    if (orderId) params.push(`orderId=${orderId}`);
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    return this.http.get<ApiResponse<Payment[]>>(url);
  }

  getPaymentById(id: number): Observable<ApiResponse<Payment>> {
    return this.http.get<ApiResponse<Payment>>(`${this.apiUrl}/${id}`);
  }

  getPaymentByOrderId(orderId: number): Observable<ApiResponse<Payment>> {
    return this.http.get<ApiResponse<Payment>>(`${this.apiUrl}/order/${orderId}`);
  }

  refundPayment(paymentId: number, request: PaymentRefundRequest): Observable<ApiResponse<Payment>> {
    return this.http.post<ApiResponse<Payment>>(`${this.apiUrl}/${paymentId}/refund`, request);
  }

  getPaymentStats(): Observable<ApiResponse<PaymentStats>> {
    return this.http.get<ApiResponse<PaymentStats>>(`${this.apiUrl}/stats`);
  }
}
