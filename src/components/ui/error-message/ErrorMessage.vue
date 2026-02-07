<script setup lang="ts">
defineProps<{
  message: string
}>()
</script>

<template>
  <p
    v-if="message"
    class="text-sm text-destructive bg-destructive/10 p-2 rounded-md"
    role="alert"
  >
    {{ message }}
  </p>
</template>
