<script setup lang="ts">
import {
  type DateValue,
  CalendarDate,
  getLocalTimeZone,
  today,
} from '@internationalized/date'
import { toDate } from 'reka-ui/date'
import { ref, onMounted, watch } from 'vue'
import { toast } from 'vue-sonner'
import { CalendarIcon, ChevronDown, Plus } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  fetchPayableAccounts,
  createPayableAccount,
  payPayableAccount,
  type PayableAccount,
  type PayableStatus,
} from '@/api/payableAccounts'
import {
  formatDateHyphenToSlash,
  formatMoneyBR,
  getFormattedDate,
  parseMoneyBR,
} from '@/lib/format'
import { cn } from '@/lib/utils'

const dialogOpen = ref(false)
const dropdownOpenId = ref<number | null>(null)
const items = ref<PayableAccount[]>([])
const loading = ref(false)
const loadingCreate = ref(false)
const payingId = ref<number | null>(null)
const error = ref('')

const payDialogOpen = ref(false)
const payFormAccount = ref<PayableAccount | null>(null)
const payAmount = ref('')
const payPeriod = ref(getFormattedDate())
const payPeriodDate = ref<DateValue>(today(getLocalTimeZone()))

watch(payDialogOpen, (open) => {
  if (open) payPeriodDate.value = periodStringToCalendarDate(payPeriod.value)
})

function periodStringToCalendarDate(s: string): DateValue {
  const parts = s.split('-').map(Number)
  if (parts.length !== 3) return today(getLocalTimeZone())
  const day = parts[0] ?? 1
  const month = parts[1] ?? 1
  const year = parts[2] ?? new Date().getFullYear()
  return new CalendarDate(year, month, day)
}

function onPayPeriodDateChange(date: DateValue | undefined) {
  if (!date) return
  payPeriodDate.value = date
  payPeriod.value = getFormattedDate(toDate(date, getLocalTimeZone()))
}

function onAmountInput(e: Event) {
  const target = e.target as HTMLInputElement
  const digits = target.value.replace(/\D/g, '')
  payAmount.value = formatMoneyBR(digits)
}

const newName = ref('')

const statusConfig: Record<
  PayableStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' }
> = {
  paid: { label: 'Paid', variant: 'success' },
  unpaid: { label: 'Unpaid', variant: 'destructive' },
}

onMounted(async () => {
  loading.value = true
  error.value = ''
  try {
    items.value = await fetchPayableAccounts(getFormattedDate())
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load accounts'
  } finally {
    loading.value = false
  }
})

async function addItem() {
  if (!newName.value.trim()) return
  loadingCreate.value = true
  error.value = ''
  try {
    const created = await createPayableAccount(newName.value.trim())
    items.value.push(created)
    newName.value = ''
    dialogOpen.value = false
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to create account'
  } finally {
    loadingCreate.value = false
  }
}

function onEdit(_item: PayableAccount) {
  // TODO: navegar para rota/modal de edição quando existir
}

function openPayDialog(item: PayableAccount) {
  payFormAccount.value = item
  payAmount.value = ''
  payPeriod.value = getFormattedDate()
  payDialogOpen.value = true
  dropdownOpenId.value = null
}

async function submitPayForm() {
  const amount = parseMoneyBR(payAmount.value)
  if (!payFormAccount.value || amount <= 0) return
  payingId.value = payFormAccount.value.id
  try {
    await payPayableAccount(payFormAccount.value.id, amount, payPeriod.value)
    payDialogOpen.value = false
    payFormAccount.value = null
    items.value = await fetchPayableAccounts(getFormattedDate())
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Failed to register payment')
  } finally {
    payingId.value = null
  }
}

function hasValidAmount(): boolean {
  return parseMoneyBR(payAmount.value) > 0
}
</script>

<template>
  <div class="space-y-6">
    <p v-if="error" class="text-sm text-destructive">{{ error }}</p>
    <div class="flex items-center justify-between bg-card p-4 rounded-md">
      <h1 class="text-2xl font-semibold">Accounts payable</h1>
      <Dialog v-model:open="dialogOpen">
        <DialogTrigger as-child>
          <Button>
            Add
            <Plus class="size-4 shrink-0" />
          </Button>
        </DialogTrigger>
        <DialogContent class="bg-card max-w-md">
          <DialogHeader>
            <DialogTitle>New account</DialogTitle>
          </DialogHeader>
          <form class="grid gap-4 py-4" @submit.prevent="addItem">
            <div class="grid gap-2">
              <Label for="account">Account</Label>
              <Input id="account" v-model="newName" placeholder="e.g. Rent" />
            </div>
            <DialogFooter>
              <Button type="submit" class="mx-auto" :disabled="loadingCreate">
                {{ loadingCreate ? 'Adding…' : 'Add' }}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog v-model:open="payDialogOpen">
        <DialogContent class="bg-card max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar pagamento</DialogTitle>
          </DialogHeader>
          <form class="grid gap-4 py-4" @submit.prevent="submitPayForm">
            <div class="grid gap-2">
              <Label>Conta</Label>
              <p class="text-sm text-muted-foreground py-2">
                {{ payFormAccount?.name }}
              </p>
            </div>
            <div class="grid gap-2">
              <Label for="pay-amount">Amount</Label>
              <Input
                id="pay-amount"
                :model-value="payAmount"
                type="text"
                inputmode="decimal"
                placeholder="R$ 0,00"
                @input="onAmountInput"
              />
            </div>
            <div class="grid gap-2">
              <Label for="pay-period">Period</Label>
              <Popover>
                <PopoverTrigger as-child>
                  <Button
                    :id="'pay-period'"
                    variant="outline"
                    :class="cn(
                      'w-full justify-start text-left font-normal',
                      !payPeriod && 'text-muted-foreground',
                    )"
                  >
                    <CalendarIcon class="mr-2 size-4 shrink-0" />
                    {{ formatDateHyphenToSlash(payPeriod) || 'Selecione a data' }}
                  </Button>
                </PopoverTrigger>
                <PopoverContent class="w-auto p-0" align="start">
                  <Calendar
                    :model-value="(payPeriodDate as import('reka-ui').DateValue)"
                    :default-placeholder="(payPeriodDate as import('reka-ui').DateValue)"
                    layout="month-and-year"
                    @update:model-value="onPayPeriodDateChange"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                class="mx-auto"
                :disabled="!hasValidAmount() || payingId !== null"
              >
                {{ payingId !== null ? 'Registrando…' : 'Pagar' }}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>

    <div class="rounded-md border mt-4 w-1/2 ms-auto">
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
                  <DropdownMenuItem @select="onEdit(item)"> Editar </DropdownMenuItem>
                  <DropdownMenuItem @select="openPayDialog(item)"> Pagar </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>
