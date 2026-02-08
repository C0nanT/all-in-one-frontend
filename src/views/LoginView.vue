<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ErrorMessage } from '@/components/ui/error-message'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const loading = ref(false)

async function onSubmit(e: Event) {
  e.preventDefault()
  errorMessage.value = ''
  loading.value = true
  try {
    await authStore.login(email.value, password.value)
    const redirect = (route.query.redirect as string) || undefined
    await router.push(redirect ? { path: redirect } : { name: 'Home' })
  } catch (err: unknown) {
    errorMessage.value =
      err instanceof Error ? err.message : 'Erro ao entrar. Tente novamente.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex min-h-svh items-center justify-center p-4 bg-background">
    <Card class="w-full max-w-md">
      <CardHeader>
        <CardTitle>Entrar</CardTitle>
        <CardDescription>
          Use seu e-mail e senha para acessar a aplicação.
        </CardDescription>
      </CardHeader>
      <form @submit="onSubmit" class="flex flex-col gap-4">
        <CardContent class="flex flex-col gap-4">
          <ErrorMessage :message="errorMessage" />
          <div class="grid gap-2">
            <Label for="email">E-mail</Label>
            <Input
              id="email"
              v-model="email"
              type="email"
              placeholder="seu@email.com"
              autocomplete="email"
              required
            />
          </div>
          <div class="grid gap-2">
            <Label for="password">Senha</Label>
            <Input
              id="password"
              v-model="password"
              type="password"
              placeholder="••••••••"
              autocomplete="current-password"
              required
            />
          </div>
        </CardContent>
        <CardFooter class="flex flex-col gap-3">
          <Button
            type="submit"
            class="w-full"
            :disabled="loading"
          >
            {{ loading ? 'Entrando…' : 'Entrar' }}
          </Button>
          <p class="text-center text-sm text-muted-foreground">
            Não tem conta?
            <RouterLink
              :to="{
                name: 'Register',
                query: route.query.redirect
                  ? { redirect: route.query.redirect }
                  : undefined,
              }"
              class="text-primary underline underline-offset-4 hover:no-underline"
            >
              Criar conta
            </RouterLink>
          </p>
        </CardFooter>
      </form>
    </Card>
  </div>
</template>
