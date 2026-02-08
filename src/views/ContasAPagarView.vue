<script setup lang="ts">
import { ref } from 'vue'
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

type Status = 'aberto' | 'pago'

interface ContaAPagar {
  id: string
  conta: string
  valor: string
  status: Status
}

const dialogOpen = ref(false)
const contas = ref<ContaAPagar[]>([
  { id: '1', conta: 'Aluguel', valor: '1500,00', status: 'aberto' },
  { id: '2', conta: 'Energia', valor: '280,00', status: 'pago' },
  { id: '3', conta: 'Internet', valor: '120,00', status: 'aberto' },
])

const novaConta = ref('')
const novoValor = ref('')
const novoStatus = ref<Status>('aberto')

function gerarId() {
  return String(Date.now())
}

function adicionarConta() {
  if (!novaConta.value.trim()) return
  contas.value.push({
    id: gerarId(),
    conta: novaConta.value.trim(),
    valor: novoValor.value.trim() || '0,00',
    status: novoStatus.value,
  })
  novaConta.value = ''
  novoValor.value = ''
  novoStatus.value = 'aberto'
  dialogOpen.value = false
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between bg-card p-4 rounded-md">
      <h1 class="text-2xl font-semibold">Contas a pagar</h1>
      <Dialog v-model:open="dialogOpen">
        <DialogTrigger as-child>
          <Button>
            <Plus class="size-4 shrink-0" />
            Adicionar
          </Button>
        </DialogTrigger>
        <DialogContent class="bg-card max-w-md">
          <DialogHeader>
            <DialogTitle>Nova conta</DialogTitle>
          </DialogHeader>
          <form class="grid gap-4 py-4" @submit.prevent="adicionarConta">
            <div class="grid gap-2">
              <Label for="conta">Conta</Label>
              <Input
                id="conta"
                v-model="novaConta"
                placeholder="Ex.: Aluguel"
              />
            </div>
            <div class="grid gap-2">
              <Label for="valor">Valor</Label>
              <Input
                id="valor"
                v-model="novoValor"
                placeholder="Ex.: 1500,00"
              />
            </div>
            <div class="grid gap-2">
              <Label for="status">Status</Label>
              <Select v-model="novoStatus">
                <SelectTrigger id="status" class="w-full">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aberto">Aberto</SelectItem>
                  <SelectItem value="pago">Pago</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="submit" class="mx-auto">Adicionar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>

    <div class="rounded-md border mt-4">
      <Table>
        <TableHeader class="bg-card">
          <TableRow>
            <TableHead>Conta</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Status</TableHead>
            <TableHead class="w-[100px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="item in contas" :key="item.id">
            <TableCell class="font-medium">{{ item.conta }}</TableCell>
            <TableCell>
              <Input
                v-model="item.valor"
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
                  <SelectItem value="aberto">Aberto</SelectItem>
                  <SelectItem value="pago">Pago</SelectItem>
                </SelectContent>
              </Select>
            </TableCell>
            <TableCell>
              <Button variant="outline" size="sm">
                Ações
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>
