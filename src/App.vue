<script setup lang="ts">
import { computed } from 'vue'
import 'vue-sonner/style.css'
import { Toaster } from '@/components/ui/sonner'
import { useTheme } from '@/composables/useTheme'

const { isDark } = useTheme()
const sonnerTheme = computed(() => (isDark.value ? 'dark' : 'light'))
</script>

<template>
  <router-view />
  <Toaster :theme="sonnerTheme" />
</template>
