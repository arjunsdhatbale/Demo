import { Product } from '../../products/models/product.model';

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED';

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productImageUrl?: string;
  productPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  userId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: OrderStatus;
  totalAmount: number;
  shippingAddress: string;
  contactPhone: string;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  notes?: string;
  totalItems: number;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItemRequest {
  productId: number;
  quantity: number;
}

export interface OrderCreateRequest {
  userId: number;
  items: OrderItemRequest[];
  shippingAddress: string;
  contactPhone: string;
  paymentMethod: string;
  notes?: string;
}

export interface OrderStatusUpdateRequest {
  status: string;
}

export interface OrderSummaryStats {
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
