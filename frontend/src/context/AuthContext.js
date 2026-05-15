/**
 * Auth Context — JWT auth state management with Zustand.
 * Handles login, register, token refresh, and protected route logic.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '@/utils/api'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      error: null,

      // ── Actions ────────────────────────────────────────────────────────────
      login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          const { data } = await api.post('/auth/login', { email, password })
          set({
            user: data.user,
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            isLoading: false,
          })
          api.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`
          return { success: true }
        } catch (err) {
          const msg = err.response?.data?.detail || 'Login failed'
          set({ isLoading: false, error: msg })
          return { success: false, error: msg }
        }
      },

      register: async (name, email, password) => {
        set({ isLoading: true, error: null })
        try {
          const { data } = await api.post('/auth/register', { name, email, password })
          set({
            user: data.user,
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            isLoading: false,
          })
          api.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`
          return { success: true }
        } catch (err) {
          const msg = err.response?.data?.detail || 'Registration failed'
          set({ isLoading: false, error: msg })
          return { success: false, error: msg }
        }
      },

      logout: () => {
        delete api.defaults.headers.common['Authorization']
        set({ user: null, accessToken: null, refreshToken: null })
      },

      refresh: async () => {
        const { refreshToken } = get()
        if (!refreshToken) return false
        try {
          const { data } = await api.post('/auth/refresh', { refresh_token: refreshToken })
          set({ accessToken: data.access_token, user: data.user })
          api.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`
          return true
        } catch {
          get().logout()
          return false
        }
      },

      initAuth: () => {
        const { accessToken } = get()
        if (accessToken) {
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
        }
      },
    }),
    {
      name: 'interview-ai-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
)

export default useAuthStore
