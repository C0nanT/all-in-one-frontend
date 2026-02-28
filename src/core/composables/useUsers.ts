import { ref } from "vue"
import { fetchUsers, type User } from "@/core/api/users"

export function useUsers() {
  const users = ref<User[]>([])
  const usersLoading = ref(false)

  async function loadUsers(): Promise<void> {
    usersLoading.value = true
    try {
      users.value = await fetchUsers()
    } catch {
      users.value = []
    } finally {
      usersLoading.value = false
    }
  }

  return { users, usersLoading, loadUsers }
}

export type UseUsersReturn = ReturnType<typeof useUsers>
