export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export type PaymentMethod =
  | 'UPI'
  | 'CREDIT_CARD'
  | 'DEBIT_CARD'
  | 'NET_BANKING'
  | 'CASH_ON_DELIVERY'
  | 'WALLET';

export interface Payment {
  id: number;
  transactionId: string;
  orderId: number;
  orderNumber: string;
  userId: number;
  customerName: string;
  customerEmail: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  gatewayReference?: string;
  failureReason?: string;
  paymentDate?: string;
  notes?: string;
  createdAt: string;
}

export interface PaymentProcessRequest {
  orderId: number;
  paymentMethod: string;
  upiId?: string;
  cardNumber?: string;
  cardHolder?: string;
  cardExpiry?: string;
  cvv?: string;
  bankName?: string;
  notes?: string;
}

export interface PaymentRefundRequest {
  reason: string;
}

export interface PaymentStats {
  totalTransactions: number;
  successfulTransactions: number;
  pendingTransactions: number;
  failedTransactions: number;
  refundedTransactions: number;
  totalVolume: number;
}
