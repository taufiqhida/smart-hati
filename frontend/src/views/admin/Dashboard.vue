<template>
  <div class="app-layout">
    <Sidebar />
    <div class="main-content">
      <TopHeader title="Dashboard Admin" />
      <div class="page-container">
        <div class="grid grid-cols-4 gap-4 mb-5">
          <div class="stat-card">
            <div class="stat-card-header"><div class="stat-card-icon primary">👥</div></div>
            <div class="stat-card-value">{{ stats.totalUsers || 0 }}</div>
            <div class="stat-card-label">Total User</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-header"><div class="stat-card-icon success">🏥</div></div>
            <div class="stat-card-value">{{ stats.patients || 0 }}</div>
            <div class="stat-card-label">Pasien</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-header"><div class="stat-card-icon warning">👨‍⚕️</div></div>
            <div class="stat-card-value">{{ stats.doctors || 0 }}</div>
            <div class="stat-card-label">Dokter</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-header"><div class="stat-card-icon danger">👩‍⚕️</div></div>
            <div class="stat-card-value">{{ stats.nurses || 0 }}</div>
            <div class="stat-card-label">Perawat</div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3 class="card-title">⚙️ Aksi Cepat</h3>
          </div>
          <div class="card-body">
            <div class="grid grid-cols-2 gap-4">
              <router-link to="/admin/users" class="btn btn-primary btn-lg">
                👥 Manajemen User
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../../services/api'
import Sidebar from '../../components/common/Sidebar.vue'
import TopHeader from '../../components/common/TopHeader.vue'

const stats = ref({})

onMounted(async () => {
  try {
    const res = await api.get('/users')
    const users = res.data
    stats.value = {
      totalUsers: users.length,
      patients: users.filter(u => u.role === 'patient').length,
      doctors: users.filter(u => u.role === 'doctor').length,
      nurses: users.filter(u => u.role === 'nurse').length
    }
  } catch (error) { console.error('Error:', error) }
})
</script>
