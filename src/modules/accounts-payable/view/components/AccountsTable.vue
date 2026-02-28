<script setup lang="ts">
import { ref } from "vue"
import { ChevronDown } from "lucide-vue-next"
import type { PayableAccount, PayableStatus } from "@/modules/accounts-payable/model/api"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table"
import { formatDateHyphenToSlash } from "@/core/lib/format"

const statusConfig: Record<
  PayableStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "success" }
> = {
  paid: { label: "Paid", variant: "success" },
  unpaid: { label: "Unpaid", variant: "destructive" },
}

defineProps<{
  items: PayableAccount[] | readonly PayableAccount[]
  loading: boolean
}>()

const emit = defineEmits<{
  pay: [item: PayableAccount]
  edit: [item: PayableAccount]
}>()

const dropdownOpenId = ref<number | null>(null)

function onPay(item: PayableAccount): void {
  dropdownOpenId.value = null
  emit("pay", item)
}

function onEdit(item: PayableAccount): void {
  dropdownOpenId.value = null
  emit("edit", item)
}
</script>

<template>
  <div class="rounded-md border mt-4 w-1/2 ms-auto" data-testid="accounts-payable-table">
    <Table>
      <TableHeader class="bg-card">
        <TableRow>
          <TableHead>Account</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Payer</TableHead>
          <TableHead>Period</TableHead>
          <TableHead class="w-[100px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-if="loading">
          <TableCell colspan="6" class="text-center text-muted-foreground py-8">
            Loading…
          </TableCell>
        </TableRow>
        <TableRow v-for="item in items" :key="item.id">
          <TableCell class="font-medium">{{ item.name }}</TableCell>
          <TableCell>
            <Badge :variant="statusConfig[item.status].variant">
              {{ statusConfig[item.status].label }}
            </Badge>
          </TableCell>
          <TableCell>{{ item.payment?.amount.toFixed(2) }}</TableCell>
          <TableCell>{{ item.payment?.payer }}</TableCell>
          <TableCell>{{ formatDateHyphenToSlash(item.payment?.period) }}</TableCell>
          <TableCell>
            <DropdownMenu
              :open="dropdownOpenId === item.id"
              @update:open="(open) => (dropdownOpenId = open ? item.id : null)"
            >
              <DropdownMenuTrigger as-child>
                <Button variant="outline" size="sm">
                  Actions
                  <ChevronDown
                    class="size-4 shrink-0 transition-transform"
                    :class="{ 'rotate-180': dropdownOpenId === item.id }"
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem v-if="item.status === 'paid'" @select="onEdit(item)">
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem v-if="item.status !== 'paid'" @select="onPay(item)">
                  Pay
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
