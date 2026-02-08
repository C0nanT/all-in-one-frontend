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
    errorMessage.value = 'Passwords do not match.'
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
    await router.push(redirect ? { path: redirect } : { name: 'Dashboard' })
  } catch (err: unknown) {
    errorMessage.value =
      err instanceof Error ? err.message : 'Error creating account. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex min-h-svh items-center justify-center p-4 bg-background">
    <Card class="w-full max-w-md">
      <CardHeader>
        <CardTitle>Create account</CardTitle>
        <CardDescription>
          Fill in the details to register in the application.
        </CardDescription>
      </CardHeader>
      <form @submit="onSubmit" class="flex flex-col gap-4">
        <CardContent class="flex flex-col gap-4">
          <ErrorMessage :message="errorMessage" />
          <div class="grid gap-2">
            <Label for="name">Name</Label>
            <Input
              id="name"
              v-model="name"
              type="text"
              placeholder="Your name"
              autocomplete="name"
              required
            />
          </div>
          <div class="grid gap-2">
            <Label for="email">Email</Label>
            <Input
              id="email"
              v-model="email"
              type="email"
              placeholder="you@example.com"
              autocomplete="email"
              required
            />
          </div>
          <div class="grid gap-2">
            <Label for="password">Password</Label>
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
            <Label for="password-confirmation">Confirm password</Label>
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
            {{ loading ? 'Creating account…' : 'Create account' }}
          </Button>
          <p class="text-center text-sm text-muted-foreground">
            Already have an account?
            <RouterLink
              :to="{
                name: 'Login',
                query: route.query.redirect
                  ? { redirect: route.query.redirect }
                  : undefined,
              }"
              class="text-primary underline underline-offset-4 hover:no-underline"
            >
              Log in
            </RouterLink>
          </p>
        </CardFooter>
      </form>
    </Card>
  </div>
</template>
