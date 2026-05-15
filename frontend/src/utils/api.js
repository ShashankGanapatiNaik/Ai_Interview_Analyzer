/**
 * Axios instance with JWT interceptors and auto-refresh logic.
 */

import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

// ── Response interceptor — auto-refresh on 401 ────────────────────────────────
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve(token)
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // Dynamically import to avoid circular deps
        const { default: useAuthStore } = await import('@/context/AuthContext')
        const refreshed = await useAuthStore.getState().refresh()
        if (refreshed) {
          const newToken = useAuthStore.getState().accessToken
          processQueue(null, newToken)
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        processQueue(refreshError, null)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000'
export default api
