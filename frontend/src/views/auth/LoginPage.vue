<template>
  <div class="login-page">
    <div class="login-container">
      <!-- Left Side - Form -->
      <div class="login-left">
        <div class="login-logo">
          <div class="login-logo-icon">❤️</div>
          <h1>SMART HATI</h1>
        </div>

        <h2 class="login-title">Selamat Datang Kembali</h2>
        <p class="login-subtitle">Masuk ke akun Anda untuk melanjutkan</p>

        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <label class="form-label">NIK atau Email</label>
            <input
              type="text"
              v-model="form.nik"
              class="form-input"
              :class="{ error: errors.nik }"
              placeholder="Masukkan NIK atau Email"
            />
            <p v-if="errors.nik" class="form-error">{{ errors.nik }}</p>
          </div>

          <div class="form-group">
            <label class="form-label">Password</label>
            <input
              type="password"
              v-model="form.password"
              class="form-input"
              :class="{ error: errors.password }"
              placeholder="Masukkan password"
            />
            <p v-if="errors.password" class="form-error">{{ errors.password }}</p>
          </div>

          <p v-if="authStore.error" class="form-error mb-3">
            {{ authStore.error }}
          </p>

          <button 
            type="submit" 
            class="btn btn-primary btn-lg w-full"
            :disabled="authStore.loading"
          >
            <span v-if="authStore.loading">⏳ Loading...</span>
            <span v-else>🔐 Masuk</span>
          </button>
        </form>
      </div>

      <!-- Right Side - Branding -->
      <div class="login-right">
        <h2>Pantau, Cegah, Kendalikan</h2>
        <p>Sistem Monitoring & Edukasi Pasien Hipertensi Terintegrasi</p>

        <div class="login-features">
          <div class="login-feature">
            <span>📊</span> Monitoring tekanan darah real-time
          </div>
          <div class="login-feature">
            <span>📈</span> Grafik tren kesehatan
          </div>
          <div class="login-feature">
            <span>💊</span> Rekomendasi obat & gaya hidup
          </div>
          <div class="login-feature">
            <span>💬</span> Konsultasi langsung dengan dokter
          </div>
          <div class="login-feature">
            <span>⚠️</span> Deteksi dini risiko hipertensi
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  nik: '',
  password: ''
})

const errors = reactive({
  nik: '',
  password: ''
})

const validate = () => {
  let isValid = true
  errors.nik = ''
  errors.password = ''

  if (!form.nik) {
    errors.nik = 'NIK atau Email harus diisi'
    isValid = false
  } else {
    // Check if input is email or NIK
    const isEmail = form.nik.includes('@')
    if (!isEmail && form.nik.length !== 16) {
      errors.nik = 'NIK harus 16 digit atau masukkan email yang valid'
      isValid = false
    }
  }

  if (!form.password) {
    errors.password = 'Password harus diisi'
    isValid = false
  }

  return isValid
}

const handleLogin = async () => {
  authStore.clearError()
  
  if (!validate()) return

  try {
    const user = await authStore.login(form.nik, form.password)
    
    // Redirect based on role
    const dashboardMap = {
      patient: '/dashboard',
      doctor: '/doctor/dashboard',
      nurse: '/nurse/dashboard',
      admin: '/admin/dashboard'
    }
    
    router.push(dashboardMap[user.role] || '/dashboard')
  } catch (error) {
    console.error('Login error:', error)
  }
}
</script>
