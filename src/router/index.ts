import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/LoginView.vue'),
      meta: { public: true },
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('@/views/RegisterView.vue'),
      meta: { public: true },
    },
    {
      path: '/',
      component: () => import('@/layouts/AuthenticatedLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'Dashboard',
          component: () => import('@/views/DashboardView.vue'),
        },
        {
          path: 'contas-a-pagar',
          name: 'AccountsPayable',
          component: () => import('@/views/AccountsPayableView.vue'),
        },
      ],
    },
  ],
})

const AUTH_TOKEN_KEY = 'auth_token'

router.beforeEach((to) => {
  const authStore = useAuthStore()
  if (!localStorage.getItem(AUTH_TOKEN_KEY)) {
    authStore.logout(true)
  }
  const requiresAuth = to.meta.requiresAuth === true
  const isPublic = to.meta.public === true

  if (requiresAuth && !authStore.isAuthenticated) {
    return { name: 'Login', query: { redirect: to.fullPath } }
  }
  if (isPublic && authStore.isAuthenticated) {
    return { name: 'Dashboard' }
  }
  return true
})

export default router
