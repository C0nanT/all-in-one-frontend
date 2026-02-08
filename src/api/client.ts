import axios from 'axios'
import { toast } from 'vue-sonner'

const baseURL = import.meta.env.VITE_API_URL as string | undefined

export const api = axios.create({
  baseURL: baseURL ?? '',
  headers: {
    'Content-Type': 'application/json',
  },
})

const AUTH_TOKEN_KEY = 'auth_token'

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response.data,
  (err) => {
    if (!axios.isAxiosError(err)) {
      return Promise.reject(err)
    }
    if (err.response?.status === 401) {
      localStorage.removeItem(AUTH_TOKEN_KEY)
      toast.error('Session expired', {
        description: 'Please login again to continue.',
      })
      const base = import.meta.env.BASE_URL?.replace(/\/$/, '') ?? ''
      window.location.href = `${base}/login`
      return Promise.reject(new Error('Session expired. Please login again to continue.'))
    }
    const data = err.response?.data
    const message =
      data &&
      typeof data === 'object' &&
      'message' in data &&
      typeof (data as { message: unknown }).message === 'string'
        ? (data as { message: string }).message
        : (err.response?.statusText ?? 'Connection error.')
    return Promise.reject(new Error(message))
  },
)
