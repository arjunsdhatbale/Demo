export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthUser {
  userId?: number;
  username: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  roles: string[];
  token?: string;
  authenticated: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
}

export interface SignUpRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  role?: string;
}
