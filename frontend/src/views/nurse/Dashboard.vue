<template>
  <div class="app-layout">
    <Sidebar />
    <div class="main-content">
      <TopHeader title="Dashboard Perawat" />
      <div class="page-container">
        <div class="grid grid-cols-3 gap-4 mb-5">
          <div class="stat-card">
            <div class="stat-card-header"><div class="stat-card-icon primary">👥</div></div>
            <div class="stat-card-value">{{ patients.length }}</div>
            <div class="stat-card-label">Total Pasien</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-header"><div class="stat-card-icon success">📊</div></div>
            <div class="stat-card-value">{{ todayRecords }}</div>
            <div class="stat-card-label">Input Hari Ini</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-header"><div class="stat-card-icon danger">🚨</div></div>
            <div class="stat-card-value">{{ highRiskCount }}</div>
            <div class="stat-card-label">Pasien Risiko Tinggi</div>
          </div>
        </div>

        <!-- Today's Stats Detail -->
        <div class="grid grid-cols-2 gap-4 mb-5">
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">📈 Statistik Input Hari Ini</h3>
            </div>
            <div class="card-body">
              <div class="grid grid-cols-2 gap-3">
                <div class="text-center" style="padding: 1rem; background: var(--bg-tertiary); border-radius: var(--radius);">
                  <div style="font-size: 1.75rem; font-weight: 700; color: var(--primary);">{{ inputByNurse }}</div>
                  <div class="text-muted">Input Perawat</div>
                </div>
                <div class="text-center" style="padding: 1rem; background: var(--bg-tertiary); border-radius: var(--radius);">
                  <div style="font-size: 1.75rem; font-weight: 700; color: var(--success);">{{ inputByPatient }}</div>
                  <div class="text-muted">Input Mandiri</div>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <h3 class="card-title">🩺 Aksi Cepat</h3>
            </div>
            <div class="card-body">
              <router-link to="/nurse/patient-assist" class="btn btn-primary btn-lg w-full">
                ➕ Bantu Input Tekanan Darah Pasien
              </router-link>
            </div>
          </div>
        </div>

        <!-- High Risk Patients List -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">🚨 Pasien Risiko Tinggi</h3>
          </div>
          <div class="card-body">
            <div v-if="highRiskPatients.length === 0" class="text-center text-muted py-4">
              Tidak ada pasien risiko tinggi saat ini.
            </div>
            <div v-else class="table-container">
              <table class="table">
                <thead>
                  <tr>
                    <th>Nama</th>
                    <th>NIK</th>
                    <th>Tekanan Darah Terakhir</th>
                    <th>Klasifikasi</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="patient in highRiskPatients" :key="patient.id">
                    <td><strong>{{ patient.name }}</strong></td>
                    <td>{{ patient.nik }}</td>
                    <td>{{ patient.latestBP?.systolic }}/{{ patient.latestBP?.diastolic }} mmHg</td>
                    <td>
                      <span class="badge badge-danger">{{ getClassificationLabel(patient.latestBP?.classification) }}</span>
                    </td>
                    <td>
                      <router-link :to="`/nurse/patient-assist?patient=${patient.id}`" class="btn btn-sm btn-primary">
                        📝 Input
                      </router-link>
                    </td>
                  </tr>
                </tbody>
              </table>
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

const patients = ref([])
const todayRecords = ref(0)
const inputByNurse = ref(0)
const inputByPatient = ref(0)
const highRiskCount = ref(0)
const highRiskPatients = ref([])

const getClassificationLabel = (c) => ({
  normal: 'Normal',
  prehypertension: 'Prahipertensi',
  hypertension_1: 'Hipertensi Tk.1',
  hypertension_2: 'Hipertensi Tk.2',
  crisis: 'Krisis Hipertensi'
}[c] || c)

onMounted(async () => {
  try {
    const [patientsRes, highRiskRes, todayCountRes] = await Promise.all([
      api.get('/users/patients'),
      api.get('/users/patients/high-risk'),
      api.get('/blood-pressure/today-count')
    ])
    
    patients.value = patientsRes.data
    highRiskPatients.value = highRiskRes.data
    highRiskCount.value = highRiskRes.data.length
    
    // Set today's records count
    todayRecords.value = todayCountRes.data.totalToday
    inputByNurse.value = todayCountRes.data.byNurse
    inputByPatient.value = todayCountRes.data.byPatient
  } catch (error) { 
    console.error('Error:', error) 
  }
})
</script>
