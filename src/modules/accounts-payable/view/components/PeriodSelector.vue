<script setup lang="ts">
import { computed } from "vue"
import { CalendarIcon } from "lucide-vue-next"
import { Label } from "@/shared/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import { Button } from "@/shared/components/ui/button"
import { formatPeriodMonthYear } from "@/core/lib/format"
import { cn } from "@/core/lib/utils"

const props = defineProps<{
  periodMonth: string
  periodYear: string
  yearOptions: number[]
  monthOptions: readonly { value: string; label: string }[]
  buttonId?: string
}>()

const emit = defineEmits<{
  "update:periodMonth": [value: string]
  "update:periodYear": [value: string]
}>()

const displayValue = computed(() => {
  if (props.periodMonth && props.periodYear) {
    return `01-${props.periodMonth}-${props.periodYear}`
  }
  return ""
})
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <Button
        :id="buttonId"
        variant="outline"
        :class="
          cn('w-full justify-start text-left font-normal', !displayValue && 'text-muted-foreground')
        "
      >
        <CalendarIcon class="mr-2 size-4 shrink-0" />
        {{ formatPeriodMonthYear(displayValue) || "Mês e ano" }}
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-auto p-4" align="start">
      <div class="flex flex-col gap-3">
        <div class="grid gap-2">
          <Label class="text-xs text-muted-foreground">Mês</Label>
          <Select
            :model-value="periodMonth"
            @update:model-value="(v) => emit('update:periodMonth', v != null ? String(v) : '')"
          >
            <SelectTrigger class="w-full">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="m in monthOptions" :key="m.value" :value="m.value">
                {{ m.label }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="grid gap-2">
          <Label class="text-xs text-muted-foreground">Ano</Label>
          <Select
            :model-value="periodYear"
            @update:model-value="(v) => emit('update:periodYear', v != null ? String(v) : '')"
          >
            <SelectTrigger class="w-full">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="y in yearOptions" :key="y" :value="String(y)">
                {{ y }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </PopoverContent>
  </Popover>
</template>
