<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/button'

const router = useRouter()
const authStore = useAuthStore()

function logout() {
  authStore.logout()
  router.push({ name: 'Login' })
}
</script>

<template>
  <div class="flex min-h-svh flex-col items-center justify-center gap-4 p-4">
    <h1 class="text-2xl font-semibold">Bem-vindo</h1>
    <p class="text-muted-foreground">Você está autenticado.</p>
    <Button variant="outline" @click="logout">Sair</Button>
  </div>
</template>
