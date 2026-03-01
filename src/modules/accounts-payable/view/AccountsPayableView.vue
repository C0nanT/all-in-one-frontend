<script setup lang="ts">
import { computed, onMounted, unref } from "vue"
import { ChevronLeft, ChevronRight, CircleDollarSign } from "lucide-vue-next"
import { useAccountsList } from "@/modules/accounts-payable/model/composables/useAccountsList"
import { useUsers } from "@/core/composables/useUsers"
import { useCreateAccountDialog } from "@/modules/accounts-payable/model/composables/useCreateAccountDialog"
import { usePayDialog } from "@/modules/accounts-payable/model/composables/usePayDialog"
import { useEditPaymentDialog } from "@/modules/accounts-payable/model/composables/useEditPaymentDialog"
import { formatMoneyFromNumber, formatPeriodMonthYear } from "@/core/lib/format"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import AccountsTable from "./components/AccountsTable.vue"
import CreateAccountDialog from "./components/CreateAccountDialog.vue"
import EditFormDialog from "./components/EditFormDialog.vue"
import PayFormDialog from "./components/PayFormDialog.vue"

const list = useAccountsList()
const users = useUsers()
const createDialog = useCreateAccountDialog(list)
const pay = usePayDialog(list, users)
const edit = useEditPaymentDialog(list, users)

function closeDropdown(): void {
  // No-op; dropdown state is managed by AccountsTable
}

const tableItems = computed(() => list.items.value ?? [])
const tableLoading = computed(() => list.loading.value)
const summary = computed(() => unref(list.summary))

onMounted(() => {
  void list.loadList()
})
</script>

<template>
  <div class="space-y-6">
    <p v-if="list.error" class="text-sm text-destructive">
      {{ list.error }}
    </p>

    <div class="flex items-center justify-between bg-card p-4 rounded-md">
      <div class="flex items-center gap-4">
        <h1 class="text-2xl font-semibold" data-testid="accounts-payable-title">
          Accounts payable
        </h1>
        <div class="flex items-center gap-1" data-testid="accounts-payable-period-selector">
          <Button
            variant="ghost"
            size="icon-sm"
            :disabled="unref(list.isMinListPeriod)"
            @click="list.prevMonth"
          >
            <ChevronLeft class="size-4" />
          </Button>
          <span class="min-w-20 text-center font-medium tabular-nums">
            {{ formatPeriodMonthYear(unref(list.listPeriod)) }}
          </span>
          <Button variant="ghost" size="icon-sm" @click="list.nextMonth">
            <ChevronRight class="size-4" />
          </Button>
        </div>
      </div>

      <CreateAccountDialog :dialog="createDialog" />
    </div>

    <div class="grid items-start gap-2 lg:grid-cols-2">
      <Card
        v-if="summary"
        data-testid="accounts-payable-summary"
        class="h-fit border-l-4 border-l-primary gap-0"
      >
        <CardHeader class="pb-0">
          <CardTitle class="flex items-center gap-2 text-base font-medium">
            <CircleDollarSign class="size-4 shrink-0 text-primary" aria-hidden="true" />
            Month total
          </CardTitle>
        </CardHeader>
        <CardContent class="space-y-4 pt-1">
          <div class="rounded-lg bg-primary/5 px-4 py-2">
            <p class="text-3xl font-bold tabular-nums">
              {{ formatMoneyFromNumber(summary.month_total) }}
            </p>
          </div>
          <div class="border-t border-border pt-4">
            <p class="mb-2 text-sm font-medium text-muted-foreground">Paid by user</p>
            <ul v-if="summary.paid_by_user.length > 0" class="space-y-1 text-base">
              <li
                v-for="item in summary.paid_by_user"
                :key="item.user_id"
                class="flex items-center justify-between rounded-md py-2 px-2 -mx-2 transition-colors hover:bg-muted/50"
              >
                <span>{{ item.name }}</span>
                <span class="tabular-nums text-muted-foreground">
                  {{ formatMoneyFromNumber(item.total_paid) }}
                </span>
              </li>
            </ul>
            <p v-else class="text-sm text-muted-foreground">
              No payments with payer in this period
            </p>
          </div>
        </CardContent>
      </Card>
      <div :class="summary ? '' : 'lg:col-span-2'" class="min-w-0">
        <AccountsTable
          :items="tableItems"
          :loading="tableLoading"
          @pay="(item) => pay.open(item, closeDropdown)"
          @edit="(item) => edit.open(item, closeDropdown)"
        />
      </div>
    </div>

    <PayFormDialog :dialog="pay" :users="users" />
    <EditFormDialog :dialog="edit" :users="users" />
  </div>
</template>
