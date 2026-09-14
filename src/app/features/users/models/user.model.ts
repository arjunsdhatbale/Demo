export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'ADMIN' | 'USER' | 'MANAGER';
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  createdAt: string;
  updatedAt: string;
}

export interface UserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  role: string;
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

export interface RowError {
  rowNumber: number;
  email: string;
  reason: string;
}