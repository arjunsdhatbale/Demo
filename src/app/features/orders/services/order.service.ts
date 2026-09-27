import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Order,
  OrderCreateRequest,
  OrderStatusUpdateRequest,
  OrderSummaryStats
} from '../models/order.model';
import { ApiResponse } from '../../products/models/product.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/orders`;

  createOrder(request: OrderCreateRequest): Observable<ApiResponse<Order>> {
    return this.http.post<ApiResponse<Order>>(this.apiUrl, request);
  }

  getAllOrders(userId?: number): Observable<ApiResponse<Order[]>> {
    const url = userId ? `${this.apiUrl}?userId=${userId}` : this.apiUrl;
    return this.http.get<ApiResponse<Order[]>>(url);
  }

  getOrderById(id: number): Observable<ApiResponse<Order>> {
    return this.http.get<ApiResponse<Order>>(`${this.apiUrl}/${id}`);
  }

  getOrdersByUserId(userId: number): Observable<ApiResponse<Order[]>> {
    return this.http.get<ApiResponse<Order[]>>(`${this.apiUrl}/user/${userId}`);
  }

  updateOrderStatus(id: number, status: string): Observable<ApiResponse<Order>> {
    return this.http.patch<ApiResponse<Order>>(`${this.apiUrl}/${id}/status`, { status });
  }

  cancelOrder(id: number, userId?: number): Observable<ApiResponse<Order>> {
    const url = userId ? `${this.apiUrl}/${id}/cancel?userId=${userId}` : `${this.apiUrl}/${id}/cancel`;
    return this.http.post<ApiResponse<Order>>(url, {});
  }

  getOrderStats(): Observable<ApiResponse<OrderSummaryStats>> {
    return this.http.get<ApiResponse<OrderSummaryStats>>(`${this.apiUrl}/stats`);
  }

  searchOrders(keyword: string): Observable<ApiResponse<Order[]>> {
    return this.http.get<ApiResponse<Order[]>>(`${this.apiUrl}/search?keyword=${encodeURIComponent(keyword)}`);
  }
}
