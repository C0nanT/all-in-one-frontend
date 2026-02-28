<script setup lang="ts">
import { computed, onMounted, unref } from "vue"
import { ChevronLeft, ChevronRight } from "lucide-vue-next"
import { useAccountsList } from "@/modules/accounts-payable/model/composables/useAccountsList"
import { useUsers } from "@/core/composables/useUsers"
import { useCreateAccountDialog } from "@/modules/accounts-payable/model/composables/useCreateAccountDialog"
import { usePayDialog } from "@/modules/accounts-payable/model/composables/usePayDialog"
import { useEditPaymentDialog } from "@/modules/accounts-payable/model/composables/useEditPaymentDialog"
import { formatPeriodMonthYear } from "@/core/lib/format"
import { Button } from "@/shared/components/ui/button"
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

    <AccountsTable
      :items="tableItems"
      :loading="tableLoading"
      @pay="(item) => pay.open(item, closeDropdown)"
      @edit="(item) => edit.open(item, closeDropdown)"
    />

    <PayFormDialog :dialog="pay" :users="users" />
    <EditFormDialog :dialog="edit" :users="users" />
  </div>
</template>
