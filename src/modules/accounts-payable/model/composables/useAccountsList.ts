import { ref, computed } from "vue"
import { fetchPayableAccounts, type PayableAccount } from "@/modules/accounts-payable/model/api"
import { getFormattedDate, periodWithFirstDay } from "@/core/lib/format"
import { clampPeriodToMin, MIN_PERIOD_STR } from "./usePeriod"

export function useAccountsList() {
  const items = ref<PayableAccount[]>([])
  const loading = ref(false)
  const error = ref("")
  const listPeriod = ref(clampPeriodToMin(periodWithFirstDay(getFormattedDate())))

  const isMinListPeriod = computed(() => listPeriod.value === MIN_PERIOD_STR)

  async function loadList(period?: string): Promise<void> {
    const targetPeriod = period ?? listPeriod.value
    loading.value = true
    error.value = ""
    try {
      items.value = await fetchPayableAccounts(targetPeriod)
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Failed to load accounts"
    } finally {
      loading.value = false
    }
  }

  function prevMonth(): void {
    if (listPeriod.value === MIN_PERIOD_STR) return
    const parts = listPeriod.value.split("-")
    if (parts.length !== 3) return
    const [, month, year] = parts
    const date = new Date(Number(year), Number(month) - 1 - 1, 1)
    const nextPeriod = `01-${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()}`
    listPeriod.value = clampPeriodToMin(nextPeriod)
    void loadList()
  }

  function nextMonth(): void {
    const parts = listPeriod.value.split("-")
    if (parts.length !== 3) return
    const [, month, year] = parts
    const date = new Date(Number(year), Number(month) - 1 + 1, 1)
    listPeriod.value = `01-${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()}`
    void loadList()
  }

  return {
    items,
    loading,
    error,
    listPeriod,
    isMinListPeriod,
    loadList,
    prevMonth,
    nextMonth,
  }
}

export type UseAccountsListReturn = ReturnType<typeof useAccountsList>
