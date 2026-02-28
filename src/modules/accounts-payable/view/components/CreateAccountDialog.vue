<script setup lang="ts">
import { computed, unref } from "vue"
import type { Ref } from "vue"
import { Plus } from "lucide-vue-next"
import type { UseCreateAccountDialogReturn } from "@/modules/accounts-payable/model/composables/useCreateAccountDialog"
import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"

const props = defineProps<{
  dialog: UseCreateAccountDialogReturn
}>()

const dialog = props.dialog
const isOpen = computed({
  get: () => unref(dialog.dialogOpen),
  set: (v) => {
    ;(dialog.dialogOpen as Ref<boolean>).value = v
  },
})
const newNameModel = computed({
  get: () => unref(dialog.newName),
  set: (v) => {
    ;(dialog.newName as Ref<string>).value = v ?? ""
  },
})
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogTrigger as-child>
      <Button data-testid="accounts-payable-add-button">
        Add
        <Plus class="size-4 shrink-0" />
      </Button>
    </DialogTrigger>
    <DialogContent class="bg-card max-w-md">
      <DialogHeader>
        <DialogTitle>New account</DialogTitle>
      </DialogHeader>
      <form class="grid gap-4 py-4" @submit.prevent="dialog.addItem()">
        <div class="grid gap-2">
          <Label for="account">Account</Label>
          <Input id="account" v-model="newNameModel" placeholder="e.g. Rent" />
        </div>
        <DialogFooter>
          <Button type="submit" class="mx-auto" :disabled="unref(dialog.loadingCreate)">
            {{ unref(dialog.loadingCreate) ? "Adding…" : "Add" }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
