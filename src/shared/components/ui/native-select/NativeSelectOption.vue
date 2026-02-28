<!-- @fallthroughAttributes true -->
<!-- @strictTemplates true -->

<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/core/lib/utils"

const props = defineProps<{ class?: HTMLAttributes["class"] }>()

const attrs = {
  "data-slot": "native-select-option",
  class: cn("bg-popover text-popover-foreground", props.class),
} as const
</script>

<template>
  <option v-bind="attrs">
    <slot />
  </option>
</template>
