import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL as string | undefined

export const api = axios.create({
  baseURL: baseURL ?? '',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.response.use(
  (response) => response.data,
  (err) => {
    if (!axios.isAxiosError(err)) {
      return Promise.reject(err)
    }
    const data = err.response?.data
    const message =
      data && typeof data === 'object' && 'message' in data && typeof (data as { message: unknown }).message === 'string'
        ? (data as { message: string }).message : err.response?.statusText ?? 'Connection error.'
    return Promise.reject(new Error(message))
  }
)
