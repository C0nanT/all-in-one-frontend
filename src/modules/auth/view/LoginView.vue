<script setup lang="ts">
import { ref } from "vue"
import { useRouter, useRoute } from "vue-router"
import { toast } from "vue-sonner"
import { useAuthStore } from "@/modules/auth/model/store"
import { Button } from "@/shared/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import { ErrorMessage } from "@/shared/components/ui/error-message"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const email = ref("")
const password = ref("")
const errorMessage = ref("")
const loading = ref(false)

async function onSubmit(e: Event) {
  e.preventDefault()
  errorMessage.value = ""
  loading.value = true
  try {
    await authStore.login(email.value, password.value)
    const redirect = (route.query.redirect as string) || undefined
    await router.push(redirect ? { path: redirect } : { name: "Dashboard" })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Login failed. Try again."
    errorMessage.value = message
    toast.error("Login failed", { description: message })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex min-h-svh items-center justify-center p-4 bg-background">
    <Card class="w-full max-w-md">
      <CardHeader>
        <CardTitle>Log in</CardTitle>
        <CardDescription> Use your email and password to access the application. </CardDescription>
      </CardHeader>
      <form @submit="onSubmit" class="flex flex-col gap-4">
        <CardContent class="flex flex-col gap-4">
          <ErrorMessage :message="errorMessage" />
          <div class="grid gap-2">
            <Label for="email">Email</Label>
            <Input
              id="email"
              v-model="email"
              type="email"
              placeholder="you@example.com"
              autocomplete="email"
              required
              data-testid="input-text-email"
            />
          </div>
          <div class="grid gap-2">
            <Label for="password">Password</Label>
            <Input
              id="password"
              v-model="password"
              type="password"
              placeholder="••••••••"
              autocomplete="current-password"
              required
              data-testid="input-text-password"
            />
          </div>
        </CardContent>
        <CardFooter class="flex flex-col gap-3">
          <Button type="submit" class="w-full" :disabled="loading" data-testid="button-submit">
            {{ loading ? "Logging in…" : "Log in" }}
          </Button>
          <p class="text-center text-sm text-muted-foreground">
            Don't have an account?
            <RouterLink
              :to="{
                name: 'Register',
                query: route.query.redirect ? { redirect: route.query.redirect } : undefined,
              }"
              class="text-primary underline underline-offset-4 hover:no-underline"
            >
              Create account
            </RouterLink>
          </p>
        </CardFooter>
      </form>
    </Card>
  </div>
</template>
