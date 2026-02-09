import { api } from '@/core/api/client'

export interface User {
  id: number
  name: string
  email: string
}

export async function fetchUsers(): Promise<User[]> {
  const res = (await api.get('users')) as { data: User[] }
  return res.data
}
