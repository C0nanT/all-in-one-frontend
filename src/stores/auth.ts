import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as apiLogin } from '@/api/auth'

const AUTH_TOKEN_KEY = 'auth_token'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null)

  const isAuthenticated = computed(() => !!token.value)

  function init() {
    const stored = localStorage.getItem(AUTH_TOKEN_KEY)
    if (stored) token.value = stored
  }

  async function login(email: string, password: string) {
    const { token: newToken } = await apiLogin(email, password)
    token.value = newToken
    localStorage.setItem(AUTH_TOKEN_KEY, newToken)
  }

  function logout() {
    token.value = null
    localStorage.removeItem(AUTH_TOKEN_KEY)
  }

  return {
    token,
    isAuthenticated,
    init,
    login,
    logout,
  }
})
