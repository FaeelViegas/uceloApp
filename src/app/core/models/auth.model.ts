export interface AuthResponse {
  authenticated: number;
  userId: number;
  name: string;
  token: string;
}

export interface AuthResponseFromBackend {
  accessToken: string;
  tokenType: string;
  expiresAt: string;
  userType: string;
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
  confirmPwd?: string;
  accountId?: number;
  userType?: string;
}

export interface UserResponseFromBackend {
  id: number;
  email: string;
  userType: string;
  isActive: boolean;
  createdAt: string;
}