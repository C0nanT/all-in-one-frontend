import { createApp } from "vue"
import { createPinia } from "pinia"

import App from "./App.vue"
import router from "@/core/router"
import { useAuthStore } from "@/modules/auth/model/store"
import { initTheme } from "@/core/composables/useTheme"
import "@/assets/index.css"

initTheme()

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
useAuthStore(pinia).init()
app.use(router)
app.mount("#app")
