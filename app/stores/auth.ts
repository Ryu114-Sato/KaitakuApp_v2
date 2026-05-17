import { defineStore } from 'pinia'

export type Role = 'sw' | 'taxi' | 'admin'

export interface AuthUser {
  id: string
  role: Role
  name: string
  email: string
  phone?: string
  serviceArea?: string
  vehicles?: string[]
}

interface AuthState {
  user: AuthUser | null
  token: string
  initialized: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: '',
    initialized: false,
  }),

  getters: {
    isAuthenticated: (s): boolean => !!s.user,
    isSw: (s): boolean => s.user?.role === 'sw',
    isTaxi: (s): boolean => s.user?.role === 'taxi',
    isAdmin: (s): boolean => s.user?.role === 'admin',
  },

  actions: {
    /** ログイン */
    async login(email: string, password: string): Promise<AuthUser> {
      const res = await $fetch<{ success: boolean; data: { token: string; user: AuthUser } }>(
        '/api/auth/login',
        { method: 'POST', body: { email, password } }
      )
      this.user = res.data.user
      this.token = res.data.token
      this.initialized = true
      return res.data.user
    },

    /** 新規登録 */
    async register(payload: {
      role: 'sw' | 'taxi'
      name: string
      email: string
      password: string
      phone?: string
    }): Promise<AuthUser> {
      const res = await $fetch<{ success: boolean; data: { token: string; user: AuthUser } }>(
        '/api/auth/register',
        { method: 'POST', body: payload }
      )
      this.user = res.data.user
      this.token = res.data.token
      this.initialized = true
      return res.data.user
    },

    /** セッション復元（ページリロード時） */
    async fetchMe(): Promise<void> {
      try {
        const res = await $fetch<{ success: boolean; data: { user: AuthUser } }>('/api/auth/me')
        this.user = res.data.user
      } catch {
        this.user = null
        this.token = ''
      } finally {
        this.initialized = true
      }
    },

    /** ログアウト */
    async logout(): Promise<void> {
      try {
        await $fetch('/api/auth/logout', { method: 'POST' })
      } catch { /* ignore */ }
      this.user = null
      this.token = ''
      this.initialized = false
      await navigateTo('/')
    },

    /** ロール別デフォルトページ */
    getHomePath(): string {
      switch (this.user?.role) {
        case 'sw': return '/sw/search'
        case 'taxi': return '/taxi'
        case 'admin': return '/admin/hospitals'
        default: return '/'
      }
    },
  },
})
