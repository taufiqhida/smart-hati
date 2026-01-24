<template>
  <div class="app-layout">
    <Sidebar />
    <div class="main-content">
      <TopHeader title="Profil Saya" />
      <div class="page-container">
        <div class="grid grid-cols-2 gap-4">
          <!-- Profile Info -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">👤 Informasi Pribadi</h3>
            </div>
            <div class="card-body">
              <div class="flex items-center gap-4 mb-4">
                <div style="width: 80px; height: 80px; background: var(--gradient-primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 2rem; font-weight: 700;">
                  {{ authStore.userInitials }}
                </div>
                <div>
                  <h2 style="font-size: 1.5rem; font-weight: 700;">{{ authStore.user?.name }}</h2>
                  <p class="text-muted">{{ authStore.user?.nik }}</p>
                </div>
              </div>

              <div class="info-list">
                <div class="info-item">
                  <span class="info-label">Email</span>
                  <span>{{ authStore.user?.email || '-' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Telepon</span>
                  <span>{{ authStore.user?.phone || '-' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Tanggal Lahir</span>
                  <span>{{ formatDate(authStore.user?.birthDate) }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Jenis Kelamin</span>
                  <span>{{ authStore.user?.gender === 'male' ? 'Laki-laki' : 'Perempuan' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Alamat</span>
                  <span>{{ authStore.user?.address || '-' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Health Profile -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">🩺 Profil Kesehatan</h3>
              <button @click="showEditModal = true" class="btn btn-sm btn-secondary">
                ✏️ Edit
              </button>
            </div>
            <div class="card-body">
              <div class="info-list">
                <div class="info-item">
                  <span class="info-label">Usia</span>
                  <span>{{ profile?.age || '-' }} tahun</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Berat Badan</span>
                  <span>{{ profile?.weight || '-' }} kg</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Tinggi Badan</span>
                  <span>{{ profile?.height || '-' }} cm</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Tingkat Stres</span>
                  <span :class="getStressClass(profile?.stressLevel)">
                    {{ getStressLabel(profile?.stressLevel) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Risk Analysis -->
        <div class="card mt-4">
          <div class="card-header">
            <h3 class="card-title">⚠️ Analisis Risiko Hipertensi</h3>
          </div>
          <div class="card-body">
            <div v-if="riskAnalysis" class="grid grid-cols-3 gap-4">
              <div class="text-center" style="padding: 1.5rem; background: var(--bg-tertiary); border-radius: var(--radius-lg);">
                <div :style="{ color: riskAnalysis.overallRisk?.color }" style="font-size: 3rem;">
                  {{ riskAnalysis.overallRisk?.category === 'high' ? '😰' : riskAnalysis.overallRisk?.category === 'medium' ? '😐' : '😊' }}
                </div>
                <div style="font-size: 1.5rem; font-weight: 700;">{{ riskAnalysis.overallRisk?.label }}</div>
                <div class="text-muted">Risiko Keseluruhan</div>
              </div>
              <div style="padding: 1.5rem; background: var(--bg-tertiary); border-radius: var(--radius-lg);">
                <h4 style="font-weight: 600; margin-bottom: 0.5rem;">Faktor Risiko Keturunan</h4>
                <ul style="padding-left: 1rem; font-size: 0.9rem;">
                  <li v-for="factor in riskAnalysis.hereditaryRisk?.factors" :key="factor">
                    {{ factor }}
                  </li>
                  <li v-if="riskAnalysis.hereditaryRisk?.factors?.length === 0" class="text-muted">
                    Tidak ada faktor risiko
                  </li>
                </ul>
              </div>
              <div style="padding: 1.5rem; background: var(--bg-tertiary); border-radius: var(--radius-lg);">
                <h4 style="font-weight: 600; margin-bottom: 0.5rem;">Faktor Gaya Hidup</h4>
                <ul style="padding-left: 1rem; font-size: 0.9rem;">
                  <li v-for="factor in riskAnalysis.lifestyleRisk?.factors" :key="factor">
                    {{ factor }}
                  </li>
                  <li v-if="riskAnalysis.lifestyleRisk?.factors?.length === 0" class="text-muted">
                    Tidak ada faktor risiko
                  </li>
                </ul>
              </div>
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
import { useAuthStore } from '../../stores/auth'
import Sidebar from '../../components/common/Sidebar.vue'
import TopHeader from '../../components/common/TopHeader.vue'

const authStore = useAuthStore()

const profile = ref(null)
const riskAnalysis = ref(null)
const showEditModal = ref(false)

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const getStressLabel = (level) => {
  const labels = { low: 'Rendah', medium: 'Sedang', high: 'Tinggi' }
  return labels[level] || '-'
}

const getStressClass = (level) => {
  const classes = { low: 'text-success', medium: 'text-warning', high: 'text-danger' }
  return classes[level] || ''
}

onMounted(async () => {
  try {
    profile.value = authStore.user?.profile
    
    const riskRes = await api.get('/risk-analysis/my-analysis')
    riskAnalysis.value = riskRes.data
  } catch (error) {
    console.error('Error fetching profile data:', error)
  }
})
</script>

<style scoped>
.info-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border-color);
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  color: var(--text-secondary);
  font-size: 0.9rem;
}
</style>
