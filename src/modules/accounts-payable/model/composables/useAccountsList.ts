import { ref, computed } from "vue"
import {
  fetchPayableAccounts,
  type PayableAccount,
  type PayableAccountsSummary,
} from "@/modules/accounts-payable/model/api"
import { getFormattedDate, periodWithFirstDay } from "@/core/lib/format"
import { clampPeriodToMin, MIN_PERIOD_STR } from "./usePeriod"

export function useAccountsList() {
  const items = ref<PayableAccount[]>([])
  const summary = ref<PayableAccountsSummary | null>(null)
  const loading = ref(false)
  const error = ref("")
  const listPeriod = ref(clampPeriodToMin(periodWithFirstDay(getFormattedDate())))

  const isMinListPeriod = computed(() => listPeriod.value === MIN_PERIOD_STR)

  const totalPaidByAllUsers = computed(() => {
    const s = summary.value
    if (!s?.paid_by_user?.length) return 0
    return s.paid_by_user.reduce((acc, item) => acc + item.total_paid, 0)
  })

  const paidByUserWithPercentage = computed(() => {
    const s = summary.value
    const total = totalPaidByAllUsers.value
    if (!s?.paid_by_user?.length) return []
    return s.paid_by_user.map((item) => ({
      ...item,
      percentage: total > 0 ? (item.total_paid / total) * 100 : 0,
    }))
  })

  async function loadList(period?: string): Promise<void> {
    const targetPeriod = period ?? listPeriod.value
    loading.value = true
    error.value = ""
    try {
      const res = await fetchPayableAccounts(targetPeriod)
      items.value = res.data
      summary.value = res.summary
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
    summary,
    loading,
    error,
    listPeriod,
    isMinListPeriod,
    totalPaidByAllUsers,
    paidByUserWithPercentage,
    loadList,
    prevMonth,
    nextMonth,
  }
}

export type UseAccountsListReturn = ReturnType<typeof useAccountsList>
