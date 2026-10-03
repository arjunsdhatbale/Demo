export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthUser {
  username: string;
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
