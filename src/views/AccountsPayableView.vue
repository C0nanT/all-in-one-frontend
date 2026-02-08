<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  type PayableAccount,
  type PayableStatus,
} from '@/api/payableAccounts'

const dialogOpen = ref(false)
const items = ref<PayableAccount[]>([])
const loading = ref(false)
const loadingCreate = ref(false)
const error = ref('')

const newName = ref('')
const newAmount = ref('')
const newStatus = ref<PayableStatus>('open')

onMounted(async () => {
  loading.value = true
  error.value = ''
  try {
    items.value = await fetchPayableAccounts()
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
    const created = await createPayableAccount({
      name: newName.value.trim(),
      amount: newAmount.value.trim() || '0.00',
      status: newStatus.value,
    })
    items.value.push(created)
    newName.value = ''
    newAmount.value = ''
    newStatus.value = 'open'
    dialogOpen.value = false
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to create account'
  } finally {
    loadingCreate.value = false
  }
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
            <Plus class="size-4 shrink-0" />
            Add
          </Button>
        </DialogTrigger>
        <DialogContent class="bg-card max-w-md">
          <DialogHeader>
            <DialogTitle>New account</DialogTitle>
          </DialogHeader>
          <form class="grid gap-4 py-4" @submit.prevent="addItem">
            <div class="grid gap-2">
              <Label for="account">Account</Label>
              <Input
                id="account"
                v-model="newName"
                placeholder="e.g. Rent"
              />
            </div>
            <div class="grid gap-2">
              <Label for="amount">Amount</Label>
              <Input
                id="amount"
                v-model="newAmount"
                placeholder="e.g. 1500.00"
              />
            </div>
            <div class="grid gap-2">
              <Label for="status">Status</Label>
              <Select v-model="newStatus">
                <SelectTrigger id="status" class="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="submit" class="mx-auto" :disabled="loadingCreate">
                {{ loadingCreate ? 'Adding…' : 'Add' }}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>

    <div class="rounded-md border mt-4">
      <Table>
        <TableHeader class="bg-card">
          <TableRow>
            <TableHead>Account</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead class="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-if="loading">
            <TableCell colspan="4" class="text-center text-muted-foreground py-8">
              Loading…
            </TableCell>
          </TableRow>
          <TableRow v-for="item in items" :key="item.id">
            <TableCell class="font-medium">{{ item.name }}</TableCell>
            <TableCell>
              <Input
                v-model="item.amount"
                class="max-w-[140px]"
                type="text"
              />
            </TableCell>
            <TableCell>
              <Select v-model="item.status">
                <SelectTrigger class="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </TableCell>
            <TableCell>
              <Button variant="outline" size="sm">
                Actions
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>
