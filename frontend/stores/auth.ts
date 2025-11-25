import { defineStore } from 'pinia'
import type { User, AuthState } from '~/types'

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  }),

  getters: {
    userInitials: (state): string => {
      if (!state.user) return '?'
      const first = state.user.first_name?.[0] || ''
      const last = state.user.last_name?.[0] || ''
      return (first + last).toUpperCase() || state.user.email[0].toUpperCase()
    },
    
    userName: (state): string => {
      if (!state.user) return ''
      if (state.user.first_name || state.user.last_name) {
        return `${state.user.first_name || ''} ${state.user.last_name || ''}`.trim()
      }
      return state.user.email
    },
  },

  actions: {
    setUser(user: User | null) {
      this.user = user
      this.isAuthenticated = !!user
      this.isLoading = false
    },
    
    setLoading(loading: boolean) {
      this.isLoading = loading
    },
    
    async checkAuth() {
      this.isLoading = true
      try {
        const { getCurrentUser } = useDirectus()
        const user = await getCurrentUser()
        this.setUser(user)
      } catch (error) {
        this.setUser(null)
      }
    },
    
    async logout() {
      const { logout } = useDirectus()
      await logout()
      this.setUser(null)
    },
  },
})
