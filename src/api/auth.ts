import { api } from './client'

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
