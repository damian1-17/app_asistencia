import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import authApi, { type UserProfile } from '@/api/auth.api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserProfile | null>(null)
  const loading = ref(false)
  const initialized = ref(false)

  const isAuthenticated = computed(() => !!user.value)
  const isUser = computed(() => user.value?.roles?.includes('user') ?? false)
  const isAdmin = computed(() =>
    user.value?.roles?.some((r) => ['admin', 'ADMIN'].includes(r)) ?? false,
  )

  async function initialize() {
    if (initialized.value) return
    try {
      const res = await authApi.check()
      user.value = res.user
    } catch {
      user.value = null
    } finally {
      initialized.value = true
    }
  }

  async function login(email: string, password: string) {
    loading.value = true
    try {
      const res = await authApi.login({ email, password })
      user.value = res.user
      return res
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    loading.value = true
    try {
      await authApi.logout()
    } finally {
      user.value = null
      loading.value = false
      initialized.value = false
    }
  }

  async function fetchProfile() {
    try {
      user.value = await authApi.profile()
    } catch {
      user.value = null
    }
  }

  return {
    user,
    loading,
    initialized,
    isAuthenticated,
    isUser,
    isAdmin,
    initialize,
    login,
    logout,
    fetchProfile,
  }
})
