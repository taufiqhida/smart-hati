<template>
  <div class="app-layout">
    <Sidebar />
    <div class="main-content">
      <TopHeader title="Dashboard" />
      <div class="page-container">
        <!-- Welcome Card -->
        <div class="bp-card mb-5 animate-slideInUp">
          <p class="bp-card-label">Tekanan Darah Terakhir</p>
          <div class="bp-card-value" v-if="latestRecord">
            {{ latestRecord.systolic }}<span>/{{ latestRecord.diastolic }}</span>
            <span> mmHg</span>
          </div>
          <div class="bp-card-value" v-else>
            ---<span>/---</span>
          </div>
          <div 
            v-if="latestRecord"
            class="bp-card-classification"
            :class="latestRecord.classification"
          >
            {{ getClassificationLabel(latestRecord.classification) }}
          </div>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-4 gap-4 mb-5">
          <div class="stat-card animate-fadeIn">
            <div class="stat-card-header">
              <div class="stat-card-icon primary">📊</div>
            </div>
            <div class="stat-card-value">{{ statistics.totalRecords || 0 }}</div>
            <div class="stat-card-label">Total Pengukuran</div>
          </div>

          <div class="stat-card animate-fadeIn">
            <div class="stat-card-header">
              <div class="stat-card-icon success">💚</div>
            </div>
            <div class="stat-card-value">{{ statistics.averageSystolic || 0 }}</div>
            <div class="stat-card-label">Rata-rata Sistolik</div>
          </div>

          <div class="stat-card animate-fadeIn">
            <div class="stat-card-header">
              <div class="stat-card-icon warning">💛</div>
            </div>
            <div class="stat-card-value">{{ statistics.averageDiastolic || 0 }}</div>
            <div class="stat-card-label">Rata-rata Diastolik</div>
          </div>

          <div class="stat-card animate-fadeIn">
            <div class="stat-card-header">
              <div class="stat-card-icon" :class="riskLevel.class">{{ riskLevel.icon }}</div>
            </div>
            <div class="stat-card-value">{{ riskLevel.label }}</div>
            <div class="stat-card-label">Risiko Hipertensi</div>
          </div>
        </div>

        <!-- Quick Actions & Reminders -->
        <div class="grid grid-cols-2 gap-4">
          <!-- Quick Actions -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">⚡ Aksi Cepat</h3>
            </div>
            <div class="card-body">
              <div class="flex flex-col gap-3">
                <router-link to="/blood-pressure" class="btn btn-primary w-full">
                  ➕ Input Tekanan Darah
                </router-link>
                <router-link to="/monitoring" class="btn btn-secondary w-full">
                  📈 Lihat Grafik Monitoring
                </router-link>
                <router-link to="/chat" class="btn btn-secondary w-full">
                  💬 Chat dengan Dokter
                </router-link>
                <router-link to="/recommendations" class="btn btn-secondary w-full">
                  📋 Lihat Rekomendasi
                </router-link>
              </div>
            </div>
          </div>

          <!-- Reminders -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">🔔 Pengingat</h3>
            </div>
            <div class="card-body">
              <div v-if="reminders.length === 0" class="text-center text-muted">
                <p>Tidak ada pengingat aktif</p>
              </div>
              <div v-else class="flex flex-col gap-3">
                <div 
                  v-for="reminder in reminders" 
                  :key="reminder.id"
                  class="flex items-center gap-3"
                  style="padding: 0.75rem; background: var(--bg-tertiary); border-radius: var(--radius);"
                >
                  <span class="text-primary">{{ getReminderIcon(reminder.type) }}</span>
                  <div class="flex-1">
                    <div style="font-weight: 600; font-size: 0.9rem;">{{ reminder.title }}</div>
                    <div class="text-muted" style="font-size: 0.75rem;">
                      {{ formatDate(reminder.scheduledAt) }}
                    </div>
                  </div>
                  <button 
                    @click="completeReminder(reminder.id)"
                    class="btn btn-sm btn-success"
                  >
                    ✓
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Recommendations -->
        <div class="card mt-4">
          <div class="card-header">
            <h3 class="card-title">📋 Rekomendasi Terbaru dari Dokter</h3>
            <router-link to="/recommendations" class="btn btn-sm btn-secondary">
              Lihat Semua →
            </router-link>
          </div>
          <div class="card-body">
            <div v-if="recommendations.length === 0" class="text-center text-muted">
              <p>Belum ada rekomendasi dari dokter</p>
            </div>
            <div v-else class="flex flex-col gap-3">
              <div 
                v-for="rec in recommendations.slice(0, 3)" 
                :key="rec.id"
                class="flex items-center gap-3"
                style="padding: 1rem; background: var(--bg-tertiary); border-radius: var(--radius);"
              >
                <span style="font-size: 1.5rem;">{{ getRecIcon(rec.type) }}</span>
                <div class="flex-1">
                  <div style="font-weight: 600;">{{ rec.title }}</div>
                  <div class="text-muted" style="font-size: 0.85rem;">
                    {{ rec.description?.substring(0, 100) }}...
                  </div>
                </div>
                <span class="badge" :class="getRecBadgeClass(rec.type)">
                  {{ getRecTypeLabel(rec.type) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '../../services/api'
import Sidebar from '../../components/common/Sidebar.vue'
import TopHeader from '../../components/common/TopHeader.vue'

const latestRecord = ref(null)
const statistics = ref({})
const recommendations = ref([])
const reminders = ref([])
const riskAnalysis = ref(null)

const riskLevel = computed(() => {
  if (!riskAnalysis.value) {
    return { label: '-', icon: '❓', class: '' }
  }
  const risk = riskAnalysis.value.overallRisk
  const icons = { low: '😊', medium: '😐', high: '😰' }
  const classes = { low: 'success', medium: 'warning', high: 'danger' }
  return {
    label: risk.label,
    icon: icons[risk.category] || '❓',
    class: classes[risk.category] || ''
  }
})

const getClassificationLabel = (classification) => {
  const labels = {
    normal: '✅ Normal',
    prehypertension: '⚠️ Pra-Hipertensi',
    hypertension_1: '🔶 Hipertensi Tahap 1',
    hypertension_2: '🔴 Hipertensi Tahap 2',
    crisis: '🚨 KRISIS'
  }
  return labels[classification] || classification
}

const getReminderIcon = (type) => {
  const icons = {
    medication: '💊',
    checkup: '🏥',
    blood_pressure_input: '📊'
  }
  return icons[type] || '🔔'
}

const getRecIcon = (type) => {
  const icons = {
    medication: '💊',
    exercise: '🏃',
    diet: '🥗',
    stress_management: '😌'
  }
  return icons[type] || '📋'
}

const getRecTypeLabel = (type) => {
  const labels = {
    medication: 'Obat',
    exercise: 'Olahraga',
    diet: 'Makanan',
    stress_management: 'Stres'
  }
  return labels[type] || type
}

const getRecBadgeClass = (type) => {
  const classes = {
    medication: 'badge-primary',
    exercise: 'badge-success',
    diet: 'badge-warning',
    stress_management: 'badge-info'
  }
  return classes[type] || 'badge-primary'
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const completeReminder = async (id) => {
  try {
    await api.put(`/notifications/reminders/${id}/complete`)
    reminders.value = reminders.value.filter(r => r.id !== id)
  } catch (error) {
    console.error('Error completing reminder:', error)
  }
}

onMounted(async () => {
  try {
    // Fetch latest BP record
    const latestRes = await api.get('/blood-pressure/latest')
    latestRecord.value = latestRes.data

    // Fetch statistics
    const statsRes = await api.get('/blood-pressure/statistics')
    statistics.value = statsRes.data

    // Fetch recommendations
    const recsRes = await api.get('/recommendations/my-recommendations')
    recommendations.value = recsRes.data

    // Fetch reminders
    const remindersRes = await api.get('/notifications/reminders?upcoming=true')
    reminders.value = remindersRes.data

    // Fetch risk analysis
    const riskRes = await api.get('/risk-analysis/my-analysis')
    riskAnalysis.value = riskRes.data
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
  }
})
</script>
