import { ref, watch, computed } from "vue"
import { toast } from "vue-sonner"
import { updatePayableAccountPayment } from "@/modules/accounts-payable/model/api"
import type { PayableAccount } from "@/modules/accounts-payable/model/api"
import type { Ref } from "vue"
import { formatMoneyBR, parseMoneyBR } from "@/core/lib/format"
import {
  clampPeriodToMin,
  MIN_PERIOD_MONTH,
  MIN_PERIOD_YEAR,
  monthOptionsForYear,
  usePeriodYearOptions,
} from "./usePeriod"
import type { UseUsersReturn } from "@/core/composables/useUsers"
import type { UseAccountsListReturn } from "./useAccountsList"

export function useEditPaymentDialog(
  list: UseAccountsListReturn,
  users: UseUsersReturn,
): UseEditPaymentDialogReturn {
  const editDialogOpen = ref(false)
  const editFormAccount = ref<PayableAccount | null>(null)
  const editAmount = ref("")
  const editPayer = ref("")
  const editPeriodMonth = ref("")
  const editPeriodYear = ref("")
  const editingId = ref<number | null>(null)

  const payPeriodYearOptions = usePeriodYearOptions()

  const editPeriod = computed(() => {
    if (editPeriodMonth.value && editPeriodYear.value) {
      return `01-${editPeriodMonth.value}-${editPeriodYear.value}`
    }
    return ""
  })

  watch(editPeriodYear, (y) => {
    if (
      y === String(MIN_PERIOD_YEAR) &&
      editPeriodMonth.value &&
      Number(editPeriodMonth.value) < MIN_PERIOD_MONTH
    ) {
      editPeriodMonth.value = String(MIN_PERIOD_MONTH).padStart(2, "0")
    }
  })

  watch(editDialogOpen, (open) => {
    if (open && editFormAccount.value?.payment?.period) {
      const clamped = clampPeriodToMin(editFormAccount.value.payment.period)
      const parts = clamped.split("-")
      if (parts.length === 3) {
        editPeriodMonth.value = parts[1] ?? ""
        editPeriodYear.value = parts[2] ?? ""
      }
    }
  })

  function open(item: PayableAccount, onDropdownClose: () => void): void {
    if (!item.payment?.id) return
    editFormAccount.value = item
    const amountCents = Math.round(item.payment.amount * 100)
    editAmount.value = formatMoneyBR(String(amountCents))
    editPayer.value = item.payment.payer_id != null ? String(item.payment.payer_id) : ""
    const parts = item.payment.period.split("-")
    if (parts.length === 3) {
      editPeriodMonth.value = parts[1] ?? ""
      editPeriodYear.value = parts[2] ?? ""
    }
    editDialogOpen.value = true
    onDropdownClose()
    void users.loadUsers().then(() => {
      if (!editPayer.value && editFormAccount.value) {
        const payerId = editFormAccount.value.payment?.payer_id
        editPayer.value =
          payerId != null
            ? String(payerId)
            : users.users.value[0]
              ? String(users.users.value[0].id)
              : ""
      }
    })
  }

  function onAmountInput(e: Event): void {
    const target = e.target as HTMLInputElement
    const digits = target.value.replace(/\D/g, "")
    editAmount.value = formatMoneyBR(digits)
  }

  function hasValidAmount(): boolean {
    return parseMoneyBR(editAmount.value) > 0
  }

  function hasValidPayer(): boolean {
    return !!editPayer.value && users.users.value.some((u) => String(u.id) === editPayer.value)
  }

  async function submit(): Promise<void> {
    if (!editFormAccount.value?.payment?.id || !editPeriod.value) return
    const amount = parseMoneyBR(editAmount.value)
    if (amount <= 0) return
    const selectedUser = users.users.value.find((u) => String(u.id) === editPayer.value)
    if (!selectedUser) {
      toast.error("Please select a payer")
      return
    }
    editingId.value = editFormAccount.value.id
    try {
      await updatePayableAccountPayment(
        editFormAccount.value.id,
        editFormAccount.value.payment.id,
        amount,
        editPeriod.value,
        selectedUser.id,
      )
      toast.success("Payment updated")
      editDialogOpen.value = false
      editFormAccount.value = null
      await list.loadList()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update payment")
    } finally {
      editingId.value = null
    }
  }

  return {
    editDialogOpen,
    editFormAccount,
    editAmount,
    editPayer,
    editPeriodMonth,
    editPeriodYear,
    editPeriod,
    editingId,
    payPeriodYearOptions,
    monthOptionsForYear,
    open,
    onAmountInput,
    hasValidAmount,
    hasValidPayer,
    submit,
  }
}

export interface UseEditPaymentDialogReturn {
  editDialogOpen: Ref<boolean>
  editFormAccount: Ref<PayableAccount | null>
  editAmount: Ref<string>
  editPayer: Ref<string>
  editPeriodMonth: Ref<string>
  editPeriodYear: Ref<string>
  editPeriod: Ref<string>
  editingId: Ref<number | null>
  payPeriodYearOptions: ReturnType<typeof usePeriodYearOptions>
  monthOptionsForYear: typeof monthOptionsForYear
  open: (item: PayableAccount, onDropdownClose: () => void) => void
  onAmountInput: (e: Event) => void
  hasValidAmount: () => boolean
  hasValidPayer: () => boolean
  submit: () => Promise<void>
}
