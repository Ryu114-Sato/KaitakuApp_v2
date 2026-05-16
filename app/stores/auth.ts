import { defineStore } from 'pinia'

export type Role = 'sw' | 'taxi'

export interface AuthUser {
  id: string
  email: string
  role: Role
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as AuthUser | null,
    token: '' as string,
  }),
  getters: {
    isAuthenticated: (s) => !!s.token,
  },
  actions: {
    setSession(user: AuthUser, token: string) {
      this.user = user
      this.token = token
    },
    logout() {
      this.user = null
      this.token = ''
    },
  },
})
