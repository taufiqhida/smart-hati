<template>
  <div class="app-layout">
    <Sidebar />
    <div class="main-content">
      <TopHeader title="Dashboard Dokter" />
      <div class="page-container">
        <!-- Stats -->
        <div class="grid grid-cols-4 gap-4 mb-5">
          <div class="stat-card">
            <div class="stat-card-header">
              <div class="stat-card-icon primary">👥</div>
            </div>
            <div class="stat-card-value">{{ stats.totalPatients || 0 }}</div>
            <div class="stat-card-label">Total Pasien</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-header">
              <div class="stat-card-icon danger">🚨</div>
            </div>
            <div class="stat-card-value">{{ highRiskPatients.length }}</div>
            <div class="stat-card-label">Pasien Risiko Tinggi</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-header">
              <div class="stat-card-icon success">📋</div>
            </div>
            <div class="stat-card-value">{{ stats.totalRecommendations || 0 }}</div>
            <div class="stat-card-label">Rekomendasi Diberikan</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-header">
              <div class="stat-card-icon warning">💬</div>
            </div>
            <div class="stat-card-value">{{ unreadMessages }}</div>
            <div class="stat-card-label">Pesan Belum Dibaca</div>
          </div>
        </div>

        <!-- High Risk Patients -->
        <div class="card mb-5">
          <div class="card-header">
            <h3 class="card-title">🚨 Pasien Risiko Tinggi (7 Hari Terakhir)</h3>
            <router-link to="/doctor/patients" class="btn btn-sm btn-secondary">
              Lihat Semua Pasien →
            </router-link>
          </div>
          <div class="card-body">
            <div v-if="highRiskPatients.length === 0" class="text-center text-muted" style="padding: 2rem;">
              Tidak ada pasien dengan tekanan darah krisis dalam 7 hari terakhir
            </div>
            <div v-else class="table-container">
              <table class="table">
                <thead>
                  <tr>
                    <th>Pasien</th>
                    <th>NIK</th>
                    <th>Tekanan Darah Terakhir</th>
                    <th>Klasifikasi</th>
                    <th>Waktu</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="patient in highRiskPatients" :key="patient.id">
                    <td><strong>{{ patient.name }}</strong></td>
                    <td>{{ patient.nik }}</td>
                    <td>
                      <strong style="color: var(--danger);">
                        {{ patient.latestRecord?.systolic }}/{{ patient.latestRecord?.diastolic }}
                      </strong>
                    </td>
                    <td>
                      <span :class="getBadgeClass(patient.latestRecord?.classification)">
                        {{ getClassLabel(patient.latestRecord?.classification) }}
                      </span>
                    </td>
                    <td>{{ formatDate(patient.latestRecord?.recordedAt) }}</td>
                    <td>
                      <router-link :to="`/doctor/patients/${patient.id}`" class="btn btn-sm btn-primary">
                        Detail
                      </router-link>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="grid grid-cols-3 gap-4">
          <router-link to="/doctor/patients" class="card" style="text-decoration: none;">
            <div class="card-body text-center">
              <div style="font-size: 3rem;">👥</div>
              <h3 style="font-weight: 600; margin-top: 0.5rem;">Daftar Pasien</h3>
              <p class="text-muted">Lihat dan kelola pasien</p>
            </div>
          </router-link>
          <router-link to="/doctor/recommendations" class="card" style="text-decoration: none;">
            <div class="card-body text-center">
              <div style="font-size: 3rem;">📋</div>
              <h3 style="font-weight: 600; margin-top: 0.5rem;">Buat Rekomendasi</h3>
              <p class="text-muted">Obat, olahraga, diet, stres</p>
            </div>
          </router-link>
          <router-link to="/doctor/chat" class="card" style="text-decoration: none;">
            <div class="card-body text-center">
              <div style="font-size: 3rem;">💬</div>
              <h3 style="font-weight: 600; margin-top: 0.5rem;">Konsultasi</h3>
              <p class="text-muted">Chat dengan pasien</p>
            </div>
          </router-link>
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
const highRiskPatients = ref([])
const unreadMessages = ref(0)

const getBadgeClass = (classification) => {
  const classes = {
    normal: 'badge badge-bp-normal',
    prehypertension: 'badge badge-bp-prehypertension',
    hypertension_1: 'badge badge-bp-hypertension1',
    hypertension_2: 'badge badge-bp-hypertension2',
    crisis: 'badge badge-bp-crisis'
  }
  return classes[classification] || 'badge'
}

const getClassLabel = (classification) => {
  const labels = {
    normal: 'Normal',
    prehypertension: 'Pra-Hipertensi',
    hypertension_1: 'Hipertensi 1',
    hypertension_2: 'Hipertensi 2',
    crisis: 'KRISIS'
  }
  return labels[classification] || classification
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(async () => {
  try {
    const [patientsRes, highRiskRes, chatRes] = await Promise.all([
      api.get('/users/patients'),
      api.get('/users/patients/high-risk'),
      api.get('/chat/unread')
    ])
    
    stats.value = {
      totalPatients: patientsRes.data.length,
      totalRecommendations: 0
    }
    highRiskPatients.value = highRiskRes.data
    unreadMessages.value = chatRes.data.unreadCount
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
  }
})
</script>
