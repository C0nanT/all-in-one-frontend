import { api } from '@/core/api/client'

export interface LoginResponse {
  token: string
}

export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  return api.post('/login', {
    email,
    password,
    device_name: 'web',
  }) as Promise<LoginResponse>
}

export async function register(
  name: string,
  email: string,
  password: string,
  password_confirmation: string
): Promise<LoginResponse> {
  return api.post('/register', {
    name,
    email,
    password,
    password_confirmation,
    device_name: 'web',
  }) as Promise<LoginResponse>
}
