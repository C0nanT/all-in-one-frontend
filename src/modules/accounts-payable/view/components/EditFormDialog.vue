<script setup lang="ts">
import { computed, unref } from "vue"
import type { Ref } from "vue"
import type { UseEditPaymentDialogReturn } from "@/modules/accounts-payable/model/composables/useEditPaymentDialog"
import type { UseUsersReturn } from "@/core/composables/useUsers"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import { Button } from "@/shared/components/ui/button"
import PeriodSelector from "./PeriodSelector.vue"
import { monthOptionsForYear } from "@/modules/accounts-payable/model/composables/usePeriod"

const props = defineProps<{
  dialog: UseEditPaymentDialogReturn
  users: UseUsersReturn
}>()

const dialog = props.dialog
const isOpen = computed({
  get: () => unref(dialog.editDialogOpen),
  set: (v) => {
    ;(dialog.editDialogOpen as Ref<boolean>).value = v
  },
})
const editPayerModel = computed({
  get: () => unref(dialog.editPayer),
  set: (v) => {
    ;(dialog.editPayer as Ref<string>).value = v ?? ""
  },
})
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="bg-card max-w-md">
      <DialogHeader>
        <DialogTitle>Edit payment</DialogTitle>
      </DialogHeader>
      <form class="grid gap-4 py-4" @submit.prevent="dialog.submit()">
        <div class="grid gap-2 text-center text-lg">
          <Label class="mx-auto text-lg">Account</Label>
          <strong class="text-lg py-2 px-6 bg-muted rounded-md w-fit mx-auto">
            {{ unref(dialog.editFormAccount)?.name }}
          </strong>
        </div>
        <div class="grid gap-2">
          <Label for="edit-amount">Amount</Label>
          <Input
            id="edit-amount"
            :model-value="unref(dialog.editAmount)"
            type="text"
            inputmode="decimal"
            placeholder="R$ 0,00"
            @input="dialog.onAmountInput"
          />
        </div>
        <div class="grid gap-2">
          <Label for="edit-payer">Payer</Label>
          <Select
            v-model="editPayerModel"
            :disabled="dialog.isZeroAmount() || unref(users.usersLoading)"
          >
            <SelectTrigger id="edit-payer" class="w-full">
              <SelectValue
                :placeholder="
                  dialog.isZeroAmount()
                    ? 'Not applicable for R$ 0,00'
                    : unref(users.usersLoading)
                      ? 'Loading…'
                      : 'Select payer'
                "
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="u in unref(users.users)" :key="u.id" :value="String(u.id)">
                {{ u.name }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="grid gap-2">
          <Label for="edit-period">Period</Label>
          <PeriodSelector
            button-id="edit-period"
            :period-month="unref(dialog.editPeriodMonth)"
            :period-year="unref(dialog.editPeriodYear)"
            :year-options="unref(dialog.payPeriodYearOptions)"
            :month-options="monthOptionsForYear(unref(dialog.editPeriodYear))"
            @update:period-month="
              (v) => {
                ;(dialog.editPeriodMonth as Ref<string>).value = v ?? ''
              }
            "
            @update:period-year="
              (v) => {
                ;(dialog.editPeriodYear as Ref<string>).value = v ?? ''
              }
            "
          />
        </div>
        <DialogFooter>
          <Button
            type="submit"
            class="mx-auto px-8"
            :disabled="
              !dialog.hasValidAmount() ||
              !dialog.hasValidPayer() ||
              unref(dialog.editingId) !== null
            "
          >
            {{ unref(dialog.editingId) !== null ? "Saving…" : "Save" }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
