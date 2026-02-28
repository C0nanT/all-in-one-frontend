import { ref, watch } from "vue"
import { toast } from "vue-sonner"
import { payPayableAccount } from "@/modules/accounts-payable/model/api"
import type { PayableAccount } from "@/modules/accounts-payable/model/api"
import type { Ref } from "vue"
import { formatMoneyBR, parseMoneyBR, periodWithFirstDay } from "@/core/lib/format"
import {
  clampPeriodToMin,
  MIN_PERIOD_MONTH,
  MIN_PERIOD_YEAR,
  monthOptionsForYear,
  usePeriodYearOptions,
} from "./usePeriod"
import type { UseUsersReturn } from "@/core/composables/useUsers"
import type { UseAccountsListReturn } from "./useAccountsList"

export function usePayDialog(
  list: UseAccountsListReturn,
  users: UseUsersReturn,
): UsePayDialogReturn {
  const payDialogOpen = ref(false)
  const payFormAccount = ref<PayableAccount | null>(null)
  const payAmount = ref("")
  const payPayer = ref("")
  const payingId = ref<number | null>(null)

  const payPeriodYearOptions = usePeriodYearOptions()

  const now = new Date()
  const initialPayRaw = `01-${String(now.getMonth() + 1).padStart(2, "0")}-${now.getFullYear()}`
  const initialPayClamped = clampPeriodToMin(initialPayRaw)
  const initialPayParts = initialPayClamped.split("-")
  const payPeriod = ref(initialPayClamped)
  const payPeriodMonth = ref(initialPayParts[1] ?? String(now.getMonth() + 1).padStart(2, "0"))
  const payPeriodYear = ref(initialPayParts[2] ?? String(now.getFullYear()))

  watch([payPeriodMonth, payPeriodYear], ([m, y]) => {
    if (m && y) payPeriod.value = `01-${m}-${y}`
  })

  watch(payPeriodYear, (y) => {
    if (
      y === String(MIN_PERIOD_YEAR) &&
      payPeriodMonth.value &&
      Number(payPeriodMonth.value) < MIN_PERIOD_MONTH
    ) {
      payPeriodMonth.value = String(MIN_PERIOD_MONTH).padStart(2, "0")
    }
  })

  watch(payDialogOpen, (open) => {
    if (open) {
      const parts = payPeriod.value.split("-")
      if (parts.length === 3) {
        payPeriodMonth.value = parts[1] ?? payPeriodMonth.value
        payPeriodYear.value = parts[2] ?? payPeriodYear.value
      }
    }
  })

  function open(item: PayableAccount, onDropdownClose: () => void): void {
    payFormAccount.value = item
    payAmount.value = ""
    payPayer.value = ""
    const d = new Date()
    const rawPeriod = `01-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`
    const clamped = clampPeriodToMin(rawPeriod)
    payPeriod.value = clamped
    const parts = clamped.split("-")
    if (parts.length === 3) {
      payPeriodMonth.value = parts[1] ?? String(d.getMonth() + 1).padStart(2, "0")
      payPeriodYear.value = parts[2] ?? String(d.getFullYear())
    } else {
      payPeriodMonth.value = String(d.getMonth() + 1).padStart(2, "0")
      payPeriodYear.value = String(d.getFullYear())
    }
    payDialogOpen.value = true
    onDropdownClose()
    void users.loadUsers().then(() => {
      const first = users.users.value[0]
      if (first) payPayer.value = String(first.id)
    })
  }

  function onAmountInput(e: Event): void {
    const target = e.target as HTMLInputElement
    const digits = target.value.replace(/\D/g, "")
    payAmount.value = formatMoneyBR(digits)
  }

  function hasValidAmount(): boolean {
    return parseMoneyBR(payAmount.value) > 0
  }

  function hasValidPayer(): boolean {
    return !!payPayer.value && users.users.value.some((u) => String(u.id) === payPayer.value)
  }

  async function submit(): Promise<void> {
    const amount = parseMoneyBR(payAmount.value)
    if (!payFormAccount.value || amount <= 0) return
    const selectedUser = users.users.value.find((u) => String(u.id) === payPayer.value)
    if (!selectedUser) {
      toast.error("Please select a payer")
      return
    }
    payingId.value = payFormAccount.value.id
    try {
      await payPayableAccount(
        payFormAccount.value.id,
        amount,
        periodWithFirstDay(payPeriod.value),
        selectedUser.id,
      )
      payDialogOpen.value = false
      payFormAccount.value = null
      await list.loadList()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to register payment")
    } finally {
      payingId.value = null
    }
  }

  return {
    payDialogOpen,
    payFormAccount,
    payAmount,
    payPayer,
    payingId,
    payPeriod,
    payPeriodMonth,
    payPeriodYear,
    payPeriodYearOptions,
    monthOptionsForYear,
    open,
    onAmountInput,
    hasValidAmount,
    hasValidPayer,
    submit,
  }
}

export interface UsePayDialogReturn {
  payDialogOpen: Ref<boolean>
  payFormAccount: Ref<PayableAccount | null>
  payAmount: Ref<string>
  payPayer: Ref<string>
  payingId: Ref<number | null>
  payPeriod: Ref<string>
  payPeriodMonth: Ref<string>
  payPeriodYear: Ref<string>
  payPeriodYearOptions: ReturnType<typeof usePeriodYearOptions>
  monthOptionsForYear: typeof monthOptionsForYear
  open: (item: PayableAccount, onDropdownClose: () => void) => void
  onAmountInput: (e: Event) => void
  hasValidAmount: () => boolean
  hasValidPayer: () => boolean
  submit: () => Promise<void>
}
