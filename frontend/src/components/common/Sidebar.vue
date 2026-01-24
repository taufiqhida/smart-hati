<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <div class="sidebar-logo">
        <div class="sidebar-logo-icon">❤️</div>
        <div class="sidebar-logo-text">
          <h1>SMART HATI</h1>
          <span>Monitoring Hipertensi</span>
        </div>
      </div>
    </div>

    <nav class="sidebar-nav">
      <!-- Patient Navigation -->
      <template v-if="authStore.isPatient">
        <div class="nav-section">
          <div class="nav-section-title">Menu Utama</div>
          <router-link to="/dashboard" class="nav-item" :class="{ active: isActive('/dashboard') }">
            <span class="nav-item-icon">🏠</span>
            <span class="nav-item-text">Dashboard</span>
          </router-link>
          <router-link to="/blood-pressure" class="nav-item" :class="{ active: isActive('/blood-pressure') }">
            <span class="nav-item-icon">💓</span>
            <span class="nav-item-text">Input Tekanan Darah</span>
          </router-link>
          <router-link to="/monitoring" class="nav-item" :class="{ active: isActive('/monitoring') }">
            <span class="nav-item-icon">📊</span>
            <span class="nav-item-text">Monitoring</span>
          </router-link>
          <router-link to="/lifestyle" class="nav-item" :class="{ active: isActive('/lifestyle') }">
            <span class="nav-item-icon">🥗</span>
            <span class="nav-item-text">Data Gaya Hidup</span>
          </router-link>
        </div>
        <div class="nav-section">
          <div class="nav-section-title">Kesehatan</div>
          <router-link to="/recommendations" class="nav-item" :class="{ active: isActive('/recommendations') }">
            <span class="nav-item-icon">📋</span>
            <span class="nav-item-text">Rekomendasi</span>
          </router-link>
          <router-link to="/chat" class="nav-item" :class="{ active: isActive('/chat') }">
            <span class="nav-item-icon">💬</span>
            <span class="nav-item-text">Konsultasi</span>
            <span v-if="unreadMessages > 0" class="nav-item-badge">{{ unreadMessages }}</span>
          </router-link>
        </div>
      </template>

      <!-- Doctor Navigation -->
      <template v-if="authStore.isDoctor">
        <div class="nav-section">
          <div class="nav-section-title">Menu Utama</div>
          <router-link to="/doctor/dashboard" class="nav-item" :class="{ active: isActive('/doctor/dashboard') }">
            <span class="nav-item-icon">🏠</span>
            <span class="nav-item-text">Dashboard</span>
          </router-link>
          <router-link to="/doctor/patients" class="nav-item" :class="{ active: isActive('/doctor/patients') }">
            <span class="nav-item-icon">👥</span>
            <span class="nav-item-text">Daftar Pasien</span>
          </router-link>
        </div>
        <div class="nav-section">
          <div class="nav-section-title">Layanan</div>
          <router-link to="/doctor/recommendations" class="nav-item" :class="{ active: isActive('/doctor/recommendations') }">
            <span class="nav-item-icon">📋</span>
            <span class="nav-item-text">Rekomendasi</span>
          </router-link>
          <router-link to="/doctor/chat" class="nav-item" :class="{ active: isActive('/doctor/chat') }">
            <span class="nav-item-icon">💬</span>
            <span class="nav-item-text">Konsultasi</span>
            <span v-if="unreadMessages > 0" class="nav-item-badge">{{ unreadMessages }}</span>
          </router-link>
        </div>
      </template>

      <!-- Nurse Navigation -->
      <template v-if="authStore.isNurse">
        <div class="nav-section">
          <div class="nav-section-title">Menu Utama</div>
          <router-link to="/nurse/dashboard" class="nav-item" :class="{ active: isActive('/nurse/dashboard') }">
            <span class="nav-item-icon">🏠</span>
            <span class="nav-item-text">Dashboard</span>
          </router-link>
          <router-link to="/nurse/patient-assist" class="nav-item" :class="{ active: isActive('/nurse/patient-assist') }">
            <span class="nav-item-icon">👤</span>
            <span class="nav-item-text">Bantu Input Pasien</span>
          </router-link>
        </div>
      </template>

      <!-- Admin Navigation -->
      <template v-if="authStore.isAdmin">
        <div class="nav-section">
          <div class="nav-section-title">Administrasi</div>
          <router-link to="/admin/dashboard" class="nav-item" :class="{ active: isActive('/admin/dashboard') }">
            <span class="nav-item-icon">🏠</span>
            <span class="nav-item-text">Dashboard</span>
          </router-link>
          <router-link to="/admin/users" class="nav-item" :class="{ active: isActive('/admin/users') }">
            <span class="nav-item-icon">👥</span>
            <span class="nav-item-text">Manajemen User</span>
          </router-link>
        </div>
      </template>

      <!-- Common -->
      <div class="nav-section">
        <div class="nav-section-title">Akun</div>
        <router-link to="/profile" class="nav-item" :class="{ active: isActive('/profile') }">
          <span class="nav-item-icon">👤</span>
          <span class="nav-item-text">Profil Saya</span>
        </router-link>
        <a @click="handleLogout" class="nav-item" style="cursor: pointer;">
          <span class="nav-item-icon">🚪</span>
          <span class="nav-item-text">Keluar</span>
        </a>
      </div>
    </nav>

    <div class="sidebar-footer">
      <div class="sidebar-user">
        <div class="sidebar-user-avatar">
          {{ authStore.userInitials }}
        </div>
        <div class="sidebar-user-info">
          <div class="sidebar-user-name">{{ authStore.user?.name || 'Guest' }}</div>
          <div class="sidebar-user-role">{{ getRoleLabel(authStore.user?.role) }}</div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import api from '../../services/api'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const unreadMessages = ref(0)

const isActive = (path) => {
  return route.path === path || route.path.startsWith(path + '/')
}

const getRoleLabel = (role) => {
  const labels = {
    patient: 'Pasien',
    doctor: 'Dokter',
    nurse: 'Perawat',
    admin: 'Administrator'
  }
  return labels[role] || role
}

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

onMounted(async () => {
  try {
    const res = await api.get('/chat/unread')
    unreadMessages.value = res.data.unreadCount
  } catch (error) {
    console.error('Error fetching unread count:', error)
  }
})
</script>
