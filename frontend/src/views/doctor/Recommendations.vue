<template>
  <div class="app-layout">
    <Sidebar />
    <div class="main-content">
      <TopHeader title="Kelola Rekomendasi" />
      <div class="page-container">
        <!-- Stats Cards -->
        <div class="grid grid-cols-4 gap-4 mb-5">
          <div class="stat-card">
            <div class="stat-card-header"><div class="stat-card-icon primary">📋</div></div>
            <div class="stat-card-value">{{ stats.total }}</div>
            <div class="stat-card-label">Total Rekomendasi</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-header"><div class="stat-card-icon success">🥗</div></div>
            <div class="stat-card-value">{{ stats.diet }}</div>
            <div class="stat-card-label">Diet</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-header"><div class="stat-card-icon warning">🏃</div></div>
            <div class="stat-card-value">{{ stats.exercise }}</div>
            <div class="stat-card-label">Olahraga</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-header"><div class="stat-card-icon danger">💊</div></div>
            <div class="stat-card-value">{{ stats.medication }}</div>
            <div class="stat-card-label">Medikasi</div>
          </div>
        </div>

        <!-- Add Recommendation Button -->
        <button @click="openAddModal" class="btn btn-primary mb-4">
          ➕ Buat Rekomendasi Baru
        </button>

        <!-- Recommendations Table -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">📋 Daftar Rekomendasi yang Dibuat</h3>
          </div>
          <div class="card-body">
            <div v-if="loading" class="text-center py-4">⏳ Memuat...</div>
            <div v-else-if="recommendations.length === 0" class="text-center text-muted py-4">
              Belum ada rekomendasi yang dibuat.
            </div>
            <div v-else class="table-container">
              <table class="table">
                <thead>
                  <tr>
                    <th>Pasien</th>
                    <th>Tipe</th>
                    <th>Judul</th>
                    <th>Tanggal</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="rec in recommendations" :key="rec.id">
                    <td><strong>{{ rec.patient?.name }}</strong></td>
                    <td>
                      <span class="badge" :class="getTypeBadge(rec.type)">
                        {{ getTypeLabel(rec.type) }}
                      </span>
                    </td>
                    <td>{{ rec.title }}</td>
                    <td>{{ formatDate(rec.createdAt) }}</td>
                    <td>
                      <button @click="viewRecommendation(rec)" class="btn btn-sm btn-info mr-1">👁️</button>
                      <button @click="deleteRecommendation(rec.id)" class="btn btn-sm btn-danger">🗑️</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Add/Edit Modal -->
        <div v-if="showModal" class="modal-overlay" @click="showModal = false">
          <div class="modal" style="max-width: 600px;" @click.stop>
            <div class="modal-header">
              <h3 class="modal-title">➕ Buat Rekomendasi</h3>
              <button @click="showModal = false" class="modal-close">✕</button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="submitRecommendation">
                <div class="form-group">
                  <label class="form-label">Pilih Pasien</label>
                  <select v-model="form.patientId" class="form-input form-select" required>
                    <option value="">-- Pilih Pasien --</option>
                    <option v-for="patient in patients" :key="patient.id" :value="patient.id">
                      {{ patient.name }} ({{ patient.nik }})
                    </option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Tipe Rekomendasi</label>
                  <select v-model="form.type" class="form-input form-select" required>
                    <option value="diet">🥗 Diet</option>
                    <option value="exercise">🏃 Olahraga</option>
                    <option value="medication">💊 Medikasi</option>
                    <option value="stress_management">🧘 Manajemen Stres</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Judul</label>
                  <input v-model="form.title" type="text" class="form-input" placeholder="Judul rekomendasi" required />
                </div>
                <div class="form-group">
                  <label class="form-label">Deskripsi / Detail</label>
                  <textarea v-model="form.description" class="form-input" rows="4" placeholder="Deskripsi lengkap rekomendasi..."></textarea>
                </div>
                <button type="submit" class="btn btn-primary w-full" :disabled="submitting">
                  {{ submitting ? '⏳ Menyimpan...' : '💾 Simpan Rekomendasi' }}
                </button>
              </form>
            </div>
          </div>
        </div>

        <!-- View Modal -->
        <div v-if="showViewModal" class="modal-overlay" @click="showViewModal = false">
          <div class="modal" style="max-width: 600px;" @click.stop>
            <div class="modal-header">
              <h3 class="modal-title">📋 Detail Rekomendasi</h3>
              <button @click="showViewModal = false" class="modal-close">✕</button>
            </div>
            <div class="modal-body">
              <div v-if="viewingRec" class="space-y-3">
                <div class="mb-3">
                  <span class="badge" :class="getTypeBadge(viewingRec.type)">{{ getTypeLabel(viewingRec.type) }}</span>
                </div>
                <h4 style="font-size: 1.25rem; font-weight: 600;">{{ viewingRec.title }}</h4>
                <p class="text-muted">Pasien: <strong>{{ viewingRec.patient?.name }}</strong></p>
                <div style="background: var(--bg-tertiary); padding: 1rem; border-radius: var(--radius); margin-top: 1rem;">
                  <p style="white-space: pre-wrap;">{{ viewingRec.description || 'Tidak ada deskripsi.' }}</p>
                </div>
                <p class="text-muted" style="margin-top: 1rem;">Dibuat: {{ formatDate(viewingRec.createdAt) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../../services/api'
import Sidebar from '../../components/common/Sidebar.vue'
import TopHeader from '../../components/common/TopHeader.vue'

const recommendations = ref([])
const patients = ref([])
const loading = ref(true)
const submitting = ref(false)
const showModal = ref(false)
const showViewModal = ref(false)
const viewingRec = ref(null)

const form = ref({
  patientId: '',
  type: 'diet',
  title: '',
  description: ''
})

const stats = computed(() => ({
  total: recommendations.value.length,
  diet: recommendations.value.filter(r => r.type === 'diet').length,
  exercise: recommendations.value.filter(r => r.type === 'exercise').length,
  medication: recommendations.value.filter(r => r.type === 'medication').length
}))

const getTypeLabel = (type) => ({
  diet: '🥗 Diet',
  exercise: '🏃 Olahraga',
  medication: '💊 Medikasi',
  stress_management: '🧘 Manajemen Stres'
}[type] || type)

const getTypeBadge = (type) => ({
  diet: 'badge-success',
  exercise: 'badge-warning',
  medication: 'badge-danger',
  stress_management: 'badge-info'
}[type] || 'badge-primary')

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const fetchRecommendations = async () => {
  loading.value = true
  try {
    // Get all recommendations made by this doctor
    const [patientsRes] = await Promise.all([
      api.get('/users/patients')
    ])
    patients.value = patientsRes.data
    
    // Fetch all recommendations from all patients
    const allRecs = []
    for (const patient of patientsRes.data) {
      try {
        const res = await api.get(`/recommendations/patient/${patient.id}`)
        allRecs.push(...res.data.map(r => ({ ...r, patient })))
      } catch (e) { /* continue */ }
    }
    recommendations.value = allRecs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  } catch (error) {
    console.error('Error fetching data:', error)
  } finally {
    loading.value = false
  }
}

const openAddModal = () => {
  form.value = { patientId: '', type: 'diet', title: '', description: '' }
  showModal.value = true
}

const submitRecommendation = async () => {
  submitting.value = true
  try {
    await api.post('/recommendations', form.value)
    alert('Rekomendasi berhasil dibuat!')
    showModal.value = false
    fetchRecommendations()
  } catch (error) {
    alert(error.response?.data?.message || 'Gagal membuat rekomendasi')
  } finally {
    submitting.value = false
  }
}

const viewRecommendation = (rec) => {
  viewingRec.value = rec
  showViewModal.value = true
}

const deleteRecommendation = async (id) => {
  if (!confirm('Yakin hapus rekomendasi ini?')) return
  try {
    await api.delete(`/recommendations/${id}`)
    fetchRecommendations()
  } catch (error) {
    alert(error.response?.data?.message || 'Gagal menghapus')
  }
}

onMounted(fetchRecommendations)
</script>
