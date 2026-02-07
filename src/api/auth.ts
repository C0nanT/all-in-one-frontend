import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL as string | undefined

export const authApi = axios.create({
  baseURL: baseURL ?? '',
  headers: {
    'Content-Type': 'application/json',
  },
})

export interface LoginResponse {
  token: string
}

export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  const { data } = await authApi.post<LoginResponse>('/login', {
    email,
    password,
    device_name: 'web',
  })
  return data
}
