import { ref } from "vue"
import { createPayableAccount } from "@/modules/accounts-payable/model/api"
import type { UseAccountsListReturn } from "./useAccountsList"

export function useCreateAccountDialog(list: UseAccountsListReturn) {
  const dialogOpen = ref(false)
  const newName = ref("")
  const loadingCreate = ref(false)

  async function addItem(): Promise<void> {
    if (!newName.value.trim()) return
    loadingCreate.value = true
    list.error.value = ""
    try {
      const created = await createPayableAccount(newName.value.trim())
      list.items.value.push(created)
      newName.value = ""
      dialogOpen.value = false
    } catch (e) {
      list.error.value = e instanceof Error ? e.message : "Failed to create account"
    } finally {
      loadingCreate.value = false
    }
  }

  return {
    dialogOpen,
    newName,
    loadingCreate,
    addItem,
  }
}

export type UseCreateAccountDialogReturn = ReturnType<typeof useCreateAccountDialog>
