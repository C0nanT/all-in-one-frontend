<script lang="ts" setup>
import type { ToasterProps } from "vue-sonner"
import { CircleCheckIcon, InfoIcon, Loader2Icon, OctagonXIcon, TriangleAlertIcon, XIcon } from "lucide-vue-next"
import { Toaster as Sonner } from "vue-sonner"
import { cn } from "@/core/lib/utils"

const props = withDefaults(defineProps<ToasterProps>(), {
  richColors: true,
})
</script>

<template>
  <Sonner
    :class="cn('toaster group', props.class)"
    :style="{
      '--normal-bg': 'var(--card)',
      '--normal-text': 'var(--card-foreground)',
      '--normal-border': 'var(--border)',
      '--border-radius': 'var(--radius)',
    }"
    v-bind="props"
  >
    <template #success-icon> 
      <CircleCheckIcon class="size-4 text-green-500" />
    </template>
    <template #info-icon>
      <InfoIcon class="size-4 text-blue-500" />
    </template>
    <template #warning-icon>
      <TriangleAlertIcon class="size-4 text-yellow-500" />
    </template>
    <template #error-icon>
      <OctagonXIcon class="size-4 text-red-500" />
    </template>
    <template #loading-icon>
      <div>
        <Loader2Icon class="size-4 animate-spin text-gray-500" />
      </div>
    </template>
    <template #close-icon>
      <XIcon class="size-4 text-gray-500" />
    </template>
  </Sonner>
</template>
