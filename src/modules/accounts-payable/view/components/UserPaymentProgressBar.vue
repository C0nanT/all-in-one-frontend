<script setup lang="ts">
defineProps<{
  percentage: number
}>()
</script>

<template>
  <div
    role="progressbar"
    :aria-valuenow="percentage"
    aria-valuemin="0"
    aria-valuemax="100"
    aria-label="User participation percentage"
    class="h-5 w-full overflow-hidden rounded bg-muted"
  >
    <div
      class="flex h-full min-w-0 items-center justify-center bg-primary dark:bg-[oklch(0.546_0.245_262.881)] text-primary-foreground transition-[width]"
      :style="{
        width: `${Math.min(100, Math.max(0, percentage))}%`,
        minWidth: percentage > 0 ? '2rem' : undefined,
      }"
    >
      <span class="truncate text-xs font-medium tabular-nums"> {{ percentage.toFixed(1) }}% </span>
    </div>
  </div>
</template>
