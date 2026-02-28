<script setup lang="ts">
import { computed, unref } from "vue"
import type { Ref } from "vue"
import type { UsePayDialogReturn } from "@/modules/accounts-payable/model/composables/usePayDialog"
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
  dialog: UsePayDialogReturn
  users: UseUsersReturn
}>()

const dialog = props.dialog
const isOpen = computed({
  get: () => unref(dialog.payDialogOpen),
  set: (v) => {
    ;(dialog.payDialogOpen as Ref<boolean>).value = v
  },
})
const payPayerModel = computed({
  get: () => unref(dialog.payPayer),
  set: (v) => {
    ;(dialog.payPayer as Ref<string>).value = v ?? ""
  },
})
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="bg-card max-w-md">
      <DialogHeader>
        <DialogTitle>Register payment</DialogTitle>
      </DialogHeader>
      <form class="grid gap-4 py-4" @submit.prevent="dialog.submit()">
        <div class="grid gap-2 text-center text-lg">
          <Label class="mx-auto text-lg">Account</Label>
          <strong class="text-lg py-2 px-6 bg-muted rounded-md w-fit mx-auto">
            {{ unref(dialog.payFormAccount)?.name }}
          </strong>
        </div>
        <div class="grid gap-2">
          <Label for="pay-amount">Amount</Label>
          <Input
            id="pay-amount"
            :model-value="unref(dialog.payAmount)"
            type="text"
            inputmode="decimal"
            placeholder="R$ 0,00"
            @input="dialog.onAmountInput"
          />
        </div>
        <div class="grid gap-2">
          <Label for="pay-payer">Payer</Label>
          <Select v-model="payPayerModel" :disabled="unref(users.usersLoading)">
            <SelectTrigger id="pay-payer" class="w-full">
              <SelectValue :placeholder="unref(users.usersLoading) ? 'Loading…' : 'Select payer'" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="u in unref(users.users)" :key="u.id" :value="String(u.id)">
                {{ u.name }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="grid gap-2">
          <Label for="pay-period">Period</Label>
          <PeriodSelector
            button-id="pay-period"
            :period-month="unref(dialog.payPeriodMonth)"
            :period-year="unref(dialog.payPeriodYear)"
            :year-options="unref(dialog.payPeriodYearOptions)"
            :month-options="monthOptionsForYear(unref(dialog.payPeriodYear))"
            @update:period-month="
              (v) => {
                ;(dialog.payPeriodMonth as Ref<string>).value = v ?? ''
              }
            "
            @update:period-year="
              (v) => {
                ;(dialog.payPeriodYear as Ref<string>).value = v ?? ''
              }
            "
          />
        </div>
        <DialogFooter>
          <Button
            type="submit"
            class="mx-auto px-8"
            :disabled="
              !dialog.hasValidAmount() || !dialog.hasValidPayer() || unref(dialog.payingId) !== null
            "
          >
            {{ unref(dialog.payingId) !== null ? "Registering…" : "Pay" }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
