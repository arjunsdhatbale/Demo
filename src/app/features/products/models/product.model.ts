// features/products/models/product.model.ts
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl: string;
  status: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK';
  createdAt: string;
  updatedAt: string;
}

export interface ProductRequest {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl: string;
  status: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface UploadResponse {
  jobId: string;
  message: string;
  statusUrl: string;
}

export interface JobStatusResponse {
  jobId: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  totalRows: number;
  processedRows: number;
  successfulRows: number;
  failedRows: number;
  errorMessage?: string;
  createdAt?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface ProductRowError {
  rowNumber: number;
  email?: string;
  identifier?: string;
  reason: string;
}