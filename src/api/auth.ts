import { apiRequest } from '@/api/client'

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
}

export function login(body: LoginRequest): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/api/v1/auth/login', { method: 'POST', body })
}

export function register(body: RegisterRequest): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/api/v1/auth/register', { method: 'POST', body })
}

export function refresh(refreshToken: string): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/api/v1/auth/refresh', {
    method: 'POST',
    body: { refreshToken },
  })
}
