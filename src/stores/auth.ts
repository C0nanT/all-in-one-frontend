import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { toast } from 'vue-sonner'
import { login as apiLogin, register as apiRegister } from '@/api/auth'

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
    toast.info('Login successful', {
      description: 'Welcome back.',
    })
  }

  async function register(
    name: string,
    email: string,
    password: string,
    password_confirmation: string,
  ) {
    const { token: newToken } = await apiRegister(name, email, password, password_confirmation)
    token.value = newToken
    localStorage.setItem(AUTH_TOKEN_KEY, newToken)
  }

  function logout(unauthorized: boolean = false) {
    const hadToken = !!token.value || !!localStorage.getItem(AUTH_TOKEN_KEY)
    token.value = null
    localStorage.removeItem(AUTH_TOKEN_KEY)
    if (unauthorized && hadToken) {
      toast.error('Unauthorized', {
        description: 'You are not authorized to access this resource.',
      })
    } else if (!unauthorized) {
      toast.info('Logout successful', {
        description: 'You have been logged out.',
      })
    }
  }

  return {
    token,
    isAuthenticated,
    init,
    login,
    register,
    logout,
  }
})
