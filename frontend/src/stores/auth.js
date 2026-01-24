import { defineStore } from 'pinia'
import api from '../services/api'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        token: localStorage.getItem('token') || null,
        loading: false,
        error: null
    }),

    getters: {
        isAuthenticated: (state) => !!state.token,
        isPatient: (state) => state.user?.role === 'patient',
        isDoctor: (state) => state.user?.role === 'doctor',
        isNurse: (state) => state.user?.role === 'nurse',
        isAdmin: (state) => state.user?.role === 'admin',
        userInitials: (state) => {
            if (!state.user?.name) return '?'
            return state.user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        }
    },

    actions: {
        async login(nik, password) {
            this.loading = true
            this.error = null

            try {
                const response = await api.post('/auth/login', { nik, password })
                const { token, user } = response.data

                this.token = token
                this.user = user
                localStorage.setItem('token', token)

                return user
            } catch (error) {
                this.error = error.response?.data?.message || 'Login gagal'
                throw error
            } finally {
                this.loading = false
            }
        },

        async fetchUser() {
            if (!this.token) return null

            try {
                const response = await api.get('/auth/me')
                this.user = response.data
                return this.user
            } catch (error) {
                this.logout()
                throw error
            }
        },

        logout() {
            this.user = null
            this.token = null
            localStorage.removeItem('token')
        },

        clearError() {
            this.error = null
        }
    }
})
