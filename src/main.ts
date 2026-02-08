import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useAuthStore } from '@/stores/auth'
import { initTheme } from '@/composables/useTheme'
import '@/assets/index.css'

initTheme()

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
useAuthStore(pinia).init()
app.use(router)
app.mount('#app')
