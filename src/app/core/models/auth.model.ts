export interface AuthResponse {
  authenticated: number;
  userId: number;
  name: string;
  token: string;
}

export interface LoginRequest {
  name: string;
  mail: string;
  pwd: string;
}

export interface RegisterRequest {
  name: string;
  mail: string;
  pwd: string;
  accountId?: number;
}