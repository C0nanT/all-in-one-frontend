<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { toast } from 'vue-sonner'
import { CalendarIcon, ChevronDown, ChevronLeft, ChevronRight, Plus } from 'lucide-vue-next'

import {
  fetchPayableAccounts,
  createPayableAccount,
  payPayableAccount,
  updatePayableAccountPayment,
  type PayableAccount,
  type PayableStatus,
} from '@/modules/accounts-payable/model/api'
import { fetchUsers, type User } from '@/modules/accounts-payable/model/users'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import {
  formatDateHyphenToSlash,
  formatMoneyBR,
  formatPeriodMonthYear,
  getFormattedDate,
  parseMoneyBR,
  periodWithFirstDay,
} from '@/core/lib/format'
import { cn } from '@/core/lib/utils'

// --- Constantes ---

const MONTHS = [
  { value: '01', label: 'Janeiro' },
  { value: '02', label: 'Fevereiro' },
  { value: '03', label: 'Março' },
  { value: '04', label: 'Abril' },
  { value: '05', label: 'Maio' },
  { value: '06', label: 'Junho' },
  { value: '07', label: 'Julho' },
  { value: '08', label: 'Agosto' },
  { value: '09', label: 'Setembro' },
  { value: '10', label: 'Outubro' },
  { value: '11', label: 'Novembro' },
  { value: '12', label: 'Dezembro' },
]

const statusConfig: Record<
  PayableStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' }
> = {
  paid: { label: 'Paid', variant: 'success' },
  unpaid: { label: 'Unpaid', variant: 'destructive' },
}

// --- Estado: lista ---

const items = ref<PayableAccount[]>([])
const loading = ref(false)
const error = ref('')
const listPeriod = ref(periodWithFirstDay(getFormattedDate()))

// --- Estado: diálogo criar conta ---

const dialogOpen = ref(false)
const newName = ref('')
const loadingCreate = ref(false)

// --- Estado: diálogo pagar ---

const payDialogOpen = ref(false)
const payFormAccount = ref<PayableAccount | null>(null)
const payAmount = ref('')
const payPayer = ref('')
const payingId = ref<number | null>(null)
const users = ref<User[]>([])
const usersLoading = ref(false)

const now = new Date()
const payPeriod = ref(`01-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`)
const payPeriodMonth = ref(String(now.getMonth() + 1).padStart(2, '0'))
const payPeriodYear = ref(String(now.getFullYear()))

// --- Estado: diálogo editar pagamento ---

const editDialogOpen = ref(false)
const editFormAccount = ref<PayableAccount | null>(null)
const editAmount = ref('')
const editPayer = ref('')
const editPeriodMonth = ref('')
const editPeriodYear = ref('')
const editingId = ref<number | null>(null)

// --- Estado: UI (dropdown) ---

const dropdownOpenId = ref<number | null>(null)

// --- Computed ---

const payPeriodYearOptions = computed(() => {
  const y = new Date().getFullYear()
  return Array.from({ length: 11 }, (_, i) => y - 5 + i)
})

const editPeriod = computed(() => {
  if (editPeriodMonth.value && editPeriodYear.value) {
    return `01-${editPeriodMonth.value}-${editPeriodYear.value}`
  }
  return ''
})

// --- Watchers ---

watch([payPeriodMonth, payPeriodYear], ([m, y]) => {
  if (m && y) payPeriod.value = `01-${m}-${y}`
})

watch(payDialogOpen, (open) => {
  if (open) {
    const parts = payPeriod.value.split('-')
    if (parts.length === 3) {
      payPeriodMonth.value = parts[1] ?? payPeriodMonth.value
      payPeriodYear.value = parts[2] ?? payPeriodYear.value
    }
  }
})

watch(editDialogOpen, (open) => {
  if (open && editFormAccount.value?.payment?.period) {
    const parts = editFormAccount.value.payment.period.split('-')
    if (parts.length === 3) {
      editPeriodMonth.value = parts[1] ?? ''
      editPeriodYear.value = parts[2] ?? ''
    }
  }
})

// --- Ações: carregar lista ---

async function loadList(period?: string): Promise<void> {
  const targetPeriod = period ?? listPeriod.value
  loading.value = true
  error.value = ''
  try {
    items.value = await fetchPayableAccounts(targetPeriod)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load accounts'
  } finally {
    loading.value = false
  }
}

function prevMonth(): void {
  const parts = listPeriod.value.split('-')
  if (parts.length !== 3) return
  const [, month, year] = parts
  const date = new Date(Number(year), Number(month) - 1 - 1, 1)
  listPeriod.value = `01-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`
  void loadList()
}

function nextMonth(): void {
  const parts = listPeriod.value.split('-')
  if (parts.length !== 3) return
  const [, month, year] = parts
  const date = new Date(Number(year), Number(month) - 1 + 1, 1)
  listPeriod.value = `01-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`
  void loadList()
}

onMounted(() => {
  void loadList()
})

// --- Ações: criar conta ---

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

function openEditDialog(item: PayableAccount) {
  if (!item.payment?.id) return
  editFormAccount.value = item
  const amountCents = Math.round(item.payment.amount * 100)
  editAmount.value = formatMoneyBR(String(amountCents))
  editPayer.value = item.payment.payer_id != null ? String(item.payment.payer_id) : ''
  const parts = item.payment.period.split('-')
  if (parts.length === 3) {
    editPeriodMonth.value = parts[1] ?? ''
    editPeriodYear.value = parts[2] ?? ''
  }
  editDialogOpen.value = true
  dropdownOpenId.value = null
  void loadUsers()
}

function onEditAmountInput(e: Event) {
  const target = e.target as HTMLInputElement
  const digits = target.value.replace(/\D/g, '')
  editAmount.value = formatMoneyBR(digits)
}

function hasValidEditAmount(): boolean {
  return parseMoneyBR(editAmount.value) > 0
}

function hasValidEditPayer(): boolean {
  return !!editPayer.value && users.value.some((u) => String(u.id) === editPayer.value)
}

async function submitEditForm() {
  if (!editFormAccount.value?.payment?.id || !editPeriod.value) return
  const amount = parseMoneyBR(editAmount.value)
  if (amount <= 0) return
  const selectedUser = users.value.find((u) => String(u.id) === editPayer.value)
  if (!selectedUser) {
    toast.error('Please select a payer')
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
    toast.success('Payment updated')
    editDialogOpen.value = false
    editFormAccount.value = null
    await loadList()
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Failed to update payment')
  } finally {
    editingId.value = null
  }
}

// --- Ações: pagar ---

function openPayDialog(item: PayableAccount) {
  payFormAccount.value = item
  payAmount.value = ''
  payPayer.value = ''
  const d = new Date()
  payPeriod.value = `01-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`
  payPeriodMonth.value = String(d.getMonth() + 1).padStart(2, '0')
  payPeriodYear.value = String(d.getFullYear())
  payDialogOpen.value = true
  dropdownOpenId.value = null
  loadUsers()
}

function onAmountInput(e: Event) {
  const target = e.target as HTMLInputElement
  const digits = target.value.replace(/\D/g, '')
  payAmount.value = formatMoneyBR(digits)
}

async function loadUsers() {
  usersLoading.value = true
  try {
    users.value = await fetchUsers()
    if (payDialogOpen.value) {
      const first = users.value[0]
      if (first) payPayer.value = String(first.id)
    }
    if (editDialogOpen.value && editFormAccount.value && !editPayer.value) {
      const payerId = editFormAccount.value.payment?.payer_id
      editPayer.value =
        payerId != null ? String(payerId) : users.value[0] ? String(users.value[0].id) : ''
    }
  } catch {
    users.value = []
  } finally {
    usersLoading.value = false
  }
}

function hasValidAmount(): boolean {
  return parseMoneyBR(payAmount.value) > 0
}

function hasValidPayer(): boolean {
  return !!payPayer.value && users.value.some((u) => String(u.id) === payPayer.value)
}

async function submitPayForm() {
  const amount = parseMoneyBR(payAmount.value)
  if (!payFormAccount.value || amount <= 0) return
  const selectedUser = users.value.find((u) => String(u.id) === payPayer.value)
  if (!selectedUser) {
    toast.error('Please select a payer')
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
    await loadList()
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Failed to register payment')
  } finally {
    payingId.value = null
  }
}
</script>

<template>
  <div class="space-y-6">
    <p v-if="error" class="text-sm text-destructive">{{ error }}</p>

    <div class="flex items-center justify-between bg-card p-4 rounded-md">
      <div class="flex items-center gap-4">
        <h1 class="text-2xl font-semibold">Accounts payable</h1>
        <div class="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" @click="prevMonth">
            <ChevronLeft class="size-4" />
          </Button>
          <span class="min-w-20 text-center font-medium tabular-nums">
            {{ formatPeriodMonthYear(listPeriod) }}
          </span>
          <Button variant="ghost" size="icon-sm" @click="nextMonth">
            <ChevronRight class="size-4" />
          </Button>
        </div>
      </div>

      <!-- Diálogo: nova conta -->
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

      <!-- Diálogo: registrar pagamento -->
      <Dialog v-model:open="payDialogOpen">
        <DialogContent class="bg-card max-w-md">
          <DialogHeader>
            <DialogTitle>Register payment</DialogTitle>
          </DialogHeader>
          <form class="grid gap-4 py-4" @submit.prevent="submitPayForm">
            <div class="grid gap-2 text-center text-lg">
              <Label class="mx-auto text-lg">Account</Label>
              <strong class="text-lg py-2 px-6 bg-muted rounded-md w-fit mx-auto">
                {{ payFormAccount?.name }}
              </strong>
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
              <Label for="pay-payer">Payer</Label>
              <Select v-model="payPayer" :disabled="usersLoading">
                <SelectTrigger id="pay-payer" class="w-full">
                  <SelectValue :placeholder="usersLoading ? 'Loading…' : 'Select payer'" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="u in users" :key="u.id" :value="String(u.id)">
                    {{ u.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="grid gap-2">
              <Label for="pay-period">Period</Label>
              <Popover>
                <PopoverTrigger as-child>
                  <Button
                    :id="'pay-period'"
                    variant="outline"
                    :class="
                      cn(
                        'w-full justify-start text-left font-normal',
                        !payPeriod && 'text-muted-foreground',
                      )
                    "
                  >
                    <CalendarIcon class="mr-2 size-4 shrink-0" />
                    {{ formatPeriodMonthYear(payPeriod) || 'Mês e ano' }}
                  </Button>
                </PopoverTrigger>
                <PopoverContent class="w-auto p-4" align="start">
                  <div class="flex flex-col gap-3">
                    <div class="grid gap-2">
                      <Label class="text-xs text-muted-foreground">Mês</Label>
                      <Select v-model="payPeriodMonth">
                        <SelectTrigger class="w-full">
                          <SelectValue placeholder="Mês" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem v-for="m in MONTHS" :key="m.value" :value="m.value">
                            {{ m.label }}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div class="grid gap-2">
                      <Label class="text-xs text-muted-foreground">Ano</Label>
                      <Select v-model="payPeriodYear">
                        <SelectTrigger class="w-full">
                          <SelectValue placeholder="Ano" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem v-for="y in payPeriodYearOptions" :key="y" :value="String(y)">
                            {{ y }}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                class="mx-auto px-8"
                :disabled="!hasValidAmount() || !hasValidPayer() || payingId !== null"
              >
                {{ payingId !== null ? 'Registering…' : 'Pay' }}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <!-- Diálogo: editar pagamento -->
      <Dialog v-model:open="editDialogOpen">
        <DialogContent class="bg-card max-w-md">
          <DialogHeader>
            <DialogTitle>Edit payment</DialogTitle>
          </DialogHeader>
          <form class="grid gap-4 py-4" @submit.prevent="submitEditForm">
            <div class="grid gap-2 text-center text-lg">
              <Label class="mx-auto text-lg">Account</Label>
              <strong class="text-lg py-2 px-6 bg-muted rounded-md w-fit mx-auto">
                {{ editFormAccount?.name }}
              </strong>
            </div>
            <div class="grid gap-2">
              <Label for="edit-amount">Amount</Label>
              <Input
                id="edit-amount"
                :model-value="editAmount"
                type="text"
                inputmode="decimal"
                placeholder="R$ 0,00"
                @input="onEditAmountInput"
              />
            </div>
            <div class="grid gap-2">
              <Label for="edit-payer">Payer</Label>
              <Select v-model="editPayer" :disabled="usersLoading">
                <SelectTrigger id="edit-payer" class="w-full">
                  <SelectValue :placeholder="usersLoading ? 'Loading…' : 'Select payer'" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="u in users" :key="u.id" :value="String(u.id)">
                    {{ u.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="grid gap-2">
              <Label for="edit-period">Period</Label>
              <Popover>
                <PopoverTrigger as-child>
                  <Button
                    :id="'edit-period'"
                    variant="outline"
                    :class="
                      cn(
                        'w-full justify-start text-left font-normal',
                        !editPeriod && 'text-muted-foreground',
                      )
                    "
                  >
                    <CalendarIcon class="mr-2 size-4 shrink-0" />
                    {{ formatPeriodMonthYear(editPeriod) || 'Mês e ano' }}
                  </Button>
                </PopoverTrigger>
                <PopoverContent class="w-auto p-4" align="start">
                  <div class="flex flex-col gap-3">
                    <div class="grid gap-2">
                      <Label class="text-xs text-muted-foreground">Mês</Label>
                      <Select v-model="editPeriodMonth">
                        <SelectTrigger class="w-full">
                          <SelectValue placeholder="Mês" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem v-for="m in MONTHS" :key="m.value" :value="m.value">
                            {{ m.label }}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div class="grid gap-2">
                      <Label class="text-xs text-muted-foreground">Ano</Label>
                      <Select v-model="editPeriodYear">
                        <SelectTrigger class="w-full">
                          <SelectValue placeholder="Ano" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem v-for="y in payPeriodYearOptions" :key="y" :value="String(y)">
                            {{ y }}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                class="mx-auto px-8"
                :disabled="!hasValidEditAmount() || !hasValidEditPayer() || editingId !== null"
              >
                {{ editingId !== null ? 'Saving…' : 'Save' }}
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
                  <DropdownMenuItem v-if="item.status === 'paid'" @select="openEditDialog(item)">
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem v-if="item.status !== 'paid'" @select="openPayDialog(item)">
                    Pay
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>
