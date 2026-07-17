import { defineStore } from 'pinia'
import authApi from '../api/auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('athena_admin_token') || null,
    user: JSON.parse(localStorage.getItem('athena_admin_user') || 'null'),
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'ADMIN',
    isMaster: (state) => state.user?.role === 'MASTER',
  },

  actions: {
    async login(payload) {
      const data = await authApi.login(payload)
      this.token = data.token
      this.user = data.user
      localStorage.setItem('athena_admin_token', data.token)
      localStorage.setItem('athena_admin_user', JSON.stringify(data.user))
    },

    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('athena_admin_token')
      localStorage.removeItem('athena_admin_user')
    },
  },
})
