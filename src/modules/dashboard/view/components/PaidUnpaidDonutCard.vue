<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import { RouterLink } from "vue-router"
import { fetchPayableAccounts } from "@/modules/accounts-payable/model/api"
import { clampPeriodToMin } from "@/modules/accounts-payable/model/composables/usePeriod"
import { getFormattedDate, periodWithFirstDay } from "@/core/lib/format"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"

const loading = ref(true)
const error = ref<string | null>(null)
const paid = ref(0)
const unpaid = ref(0)

const currentMonthLabel = new Date().toLocaleDateString("pt-BR", {
  month: "long",
  year: "numeric",
})

const total = computed(() => paid.value + unpaid.value)
const isEmpty = computed(() => total.value === 0)

const CIRCUMFERENCE = 2 * Math.PI * 40

const paidStrokeDasharray = computed(() => {
  if (total.value === 0) return "0"
  const len = (paid.value / total.value) * CIRCUMFERENCE
  return `${len} ${CIRCUMFERENCE - len}`
})

const unpaidStrokeDasharray = computed(() => {
  if (total.value === 0 || unpaid.value === 0) return "0"
  const len = (unpaid.value / total.value) * CIRCUMFERENCE
  return `${len} ${CIRCUMFERENCE - len}`
})

const unpaidStrokeDashoffset = computed(() => {
  if (total.value === 0) return 0
  return -(paid.value / total.value) * CIRCUMFERENCE
})

async function loadData(): Promise<void> {
  loading.value = true
  error.value = null
  try {
    const period = clampPeriodToMin(periodWithFirstDay(getFormattedDate()))
    const { data } = await fetchPayableAccounts(period)
    let paidCount = 0
    let unpaidCount = 0
    for (const account of data) {
      if (account.status === "unpaid") {
        unpaidCount++
      } else {
        paidCount++
      }
    }
    paid.value = paidCount
    unpaid.value = unpaidCount
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Failed to load accounts"
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void loadData()
})
</script>

<template>
  <RouterLink
    :to="{ name: 'AccountsPayable' }"
    class="block w-full max-w-[280px] transition-opacity hover:opacity-90"
  >
    <Card class="w-full cursor-pointer">
      <CardHeader class="pb-2">
        <CardTitle class="text-base"> Accounts payable </CardTitle>
        <CardDescription class="text-sm"> {{ currentMonthLabel }} </CardDescription>
      </CardHeader>
      <CardContent class="pt-0">
        <div v-if="loading" class="flex items-center justify-center py-8">
          <div
            class="size-8 animate-spin rounded-full border-2 border-muted-foreground/20 border-t-primary"
            role="status"
            aria-label="Loading"
          />
        </div>
        <div v-else-if="error" class="py-6 text-center text-sm text-muted-foreground">
          {{ error }}
        </div>
        <div v-else-if="isEmpty" class="py-6 text-center text-sm text-muted-foreground">
          No accounts in this period
        </div>
        <div v-else class="flex flex-col items-center gap-4">
          <div class="relative">
            <svg viewBox="0 0 100 100" class="size-24 -rotate-90" aria-hidden="true">
              <circle cx="50" cy="50" r="40" fill="none" stroke="var(--muted)" stroke-width="12" />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="var(--success)"
                stroke-width="12"
                :stroke-dasharray="paidStrokeDasharray"
              />
              <circle
                v-if="unpaid > 0"
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="var(--destructive)"
                stroke-width="12"
                :stroke-dasharray="unpaidStrokeDasharray"
                :stroke-dashoffset="unpaidStrokeDashoffset"
              />
            </svg>
            <span
              class="absolute inset-0 flex items-center justify-center text-sm font-medium tabular-nums"
            >
              {{ total }}
            </span>
          </div>
          <div class="flex flex-col gap-1 text-sm">
            <div class="flex items-center gap-2">
              <span
                class="inline-block size-3 rounded-full"
                style="background-color: var(--success)"
              />
              <span class="text-muted-foreground">Paid:</span>
              <span class="font-medium tabular-nums">{{ paid }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span
                class="inline-block size-3 rounded-full"
                style="background-color: var(--destructive)"
              />
              <span class="text-muted-foreground">Unpaid:</span>
              <span class="font-medium tabular-nums">{{ unpaid }}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </RouterLink>
</template>
