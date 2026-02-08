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

const name = ref('')
const email = ref('')
const password = ref('')
const passwordConfirmation = ref('')
const errorMessage = ref('')
const loading = ref(false)

async function onSubmit(e: Event) {
  e.preventDefault()
  errorMessage.value = ''

  if (password.value !== passwordConfirmation.value) {
    errorMessage.value = 'As senhas não coincidem.'
    return
  }

  loading.value = true
  try {
    await authStore.register(
      name.value,
      email.value,
      password.value,
      passwordConfirmation.value
    )
    const redirect = (route.query.redirect as string) || undefined
    await router.push(redirect ? { path: redirect } : { name: 'Home' })
  } catch (err: unknown) {
    errorMessage.value =
      err instanceof Error ? err.message : 'Erro ao criar conta. Tente novamente.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex min-h-svh items-center justify-center p-4 bg-background">
    <Card class="w-full max-w-md">
      <CardHeader>
        <CardTitle>Criar conta</CardTitle>
        <CardDescription>
          Preencha os dados para se registrar na aplicação.
        </CardDescription>
      </CardHeader>
      <form @submit="onSubmit" class="flex flex-col gap-4">
        <CardContent class="flex flex-col gap-4">
          <ErrorMessage :message="errorMessage" />
          <div class="grid gap-2">
            <Label for="name">Nome</Label>
            <Input
              id="name"
              v-model="name"
              type="text"
              placeholder="Seu nome"
              autocomplete="name"
              required
            />
          </div>
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
              autocomplete="new-password"
              required
            />
          </div>
          <div class="grid gap-2">
            <Label for="password-confirmation">Confirmar senha</Label>
            <Input
              id="password-confirmation"
              v-model="passwordConfirmation"
              type="password"
              placeholder="••••••••"
              autocomplete="new-password"
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
            {{ loading ? 'Criando conta…' : 'Criar conta' }}
          </Button>
          <p class="text-center text-sm text-muted-foreground">
            Já tem conta?
            <RouterLink
              :to="{
                name: 'Login',
                query: route.query.redirect
                  ? { redirect: route.query.redirect }
                  : undefined,
              }"
              class="text-primary underline underline-offset-4 hover:no-underline"
            >
              Entrar
            </RouterLink>
          </p>
        </CardFooter>
      </form>
    </Card>
  </div>
</template>
