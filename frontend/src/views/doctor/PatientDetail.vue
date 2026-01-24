<template>
  <div class="app-layout">
    <Sidebar />
    <div class="main-content">
      <TopHeader :title="`Detail Pasien: ${patient?.name || ''}`" />
      <div class="page-container">
        <div class="grid grid-cols-3 gap-4">
          <!-- Patient Info -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">👤 Informasi Pasien</h3>
            </div>
            <div class="card-body">
              <div class="info-list">
                <div class="info-item"><span>Nama</span><strong>{{ patient?.name }}</strong></div>
                <div class="info-item"><span>NIK</span><span>{{ patient?.nik }}</span></div>
                <div class="info-item"><span>Usia</span><span>{{ patient?.profile?.age || '-' }} tahun</span></div>
                <div class="info-item"><span>BB/TB</span><span>{{ patient?.profile?.weight || '-' }} kg / {{ patient?.profile?.height || '-' }} cm</span></div>
                <div class="info-item"><span>Stres</span><span>{{ patient?.profile?.stressLevel || '-' }}</span></div>
              </div>
            </div>
          </div>

          <!-- Latest BP -->
          <div class="bp-card">
            <p class="bp-card-label">Tekanan Darah Terakhir</p>
            <div class="bp-card-value" v-if="latestRecord">
              {{ latestRecord.systolic }}<span>/{{ latestRecord.diastolic }}</span>
            </div>
            <div class="bp-card-value" v-else>---<span>/---</span></div>
            <div v-if="latestRecord" class="bp-card-classification" :class="latestRecord.classification">
              {{ getClassLabel(latestRecord.classification) }}
            </div>
          </div>

          <!-- Risk Analysis -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">⚠️ Risiko</h3>
            </div>
            <div class="card-body text-center">
              <div v-if="riskAnalysis" :style="{ color: riskAnalysis.overallRisk?.color }" style="font-size: 3rem;">
                {{ riskAnalysis.overallRisk?.category === 'high' ? '😰' : riskAnalysis.overallRisk?.category === 'medium' ? '😐' : '😊' }}
              </div>
              <div style="font-size: 1.25rem; font-weight: 700;">{{ riskAnalysis?.overallRisk?.label || '-' }}</div>
            </div>
          </div>
        </div>

        <!-- Recommendation Form -->
        <div class="card mt-4">
          <div class="card-header">
            <h3 class="card-title">📋 Buat Rekomendasi</h3>
          </div>
          <div class="card-body">
            <form @submit.prevent="submitRecommendation">
              <div class="grid grid-cols-2 gap-3">
                <div class="form-group">
                  <label class="form-label">Tipe Rekomendasi</label>
                  <select v-model="recForm.type" class="form-input form-select" required>
                    <option value="">Pilih tipe...</option>
                    <option value="medication">💊 Obat</option>
                    <option value="exercise">🏃 Olahraga</option>
                    <option value="diet">🥗 Makanan (DASH)</option>
                    <option value="stress_management">😌 Manajemen Stres</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Judul</label>
                  <input v-model="recForm.title" type="text" class="form-input" placeholder="Judul rekomendasi" required />
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Deskripsi</label>
                <textarea v-model="recForm.description" class="form-input" rows="3" placeholder="Detail rekomendasi..."></textarea>
              </div>
              <button type="submit" class="btn btn-primary" :disabled="submitLoading">
                {{ submitLoading ? '⏳ Menyimpan...' : '💾 Simpan Rekomendasi' }}
              </button>
            </form>
          </div>
        </div>

        <!-- Prescription Form -->
        <div class="card mt-4">
          <div class="card-header">
            <h3 class="card-title">💊 Buat Resep Digital</h3>
          </div>
          <div class="card-body">
            <form @submit.prevent="submitPrescription">
              <div class="grid grid-cols-2 gap-3">
                <div class="form-group">
                  <label class="form-label">Nama Obat</label>
                  <input v-model="presForm.medicationName" type="text" class="form-input" required />
                </div>
                <div class="form-group">
                  <label class="form-label">Dosis</label>
                  <input v-model="presForm.dosage" type="text" class="form-input" placeholder="Contoh: 5 mg" required />
                </div>
                <div class="form-group">
                  <label class="form-label">Frekuensi</label>
                  <input v-model="presForm.frequency" type="text" class="form-input" placeholder="Contoh: 1x sehari" required />
                </div>
                <div class="form-group">
                  <label class="form-label">Durasi</label>
                  <input v-model="presForm.duration" type="text" class="form-input" placeholder="Contoh: 30 hari" />
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Catatan</label>
                <textarea v-model="presForm.notes" class="form-input" rows="2"></textarea>
              </div>
              <button type="submit" class="btn btn-success" :disabled="prescLoading">
                {{ prescLoading ? '⏳ Menyimpan...' : '📄 Simpan Resep' }}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../../services/api'
import Sidebar from '../../components/common/Sidebar.vue'
import TopHeader from '../../components/common/TopHeader.vue'

const route = useRoute()
const patientId = route.params.id

const patient = ref(null)
const latestRecord = ref(null)
const riskAnalysis = ref(null)
const submitLoading = ref(false)
const prescLoading = ref(false)

const recForm = ref({ type: '', title: '', description: '' })
const presForm = ref({ medicationName: '', dosage: '', frequency: '', duration: '', notes: '' })

const getClassLabel = (classification) => {
  const labels = {
    normal: '✅ Normal',
    prehypertension: '⚠️ Pra-Hipertensi',
    hypertension_1: '🔶 Hipertensi 1',
    hypertension_2: '🔴 Hipertensi 2',
    crisis: '🚨 KRISIS'
  }
  return labels[classification] || classification
}

const submitRecommendation = async () => {
  submitLoading.value = true
  try {
    await api.post('/recommendations', {
      patientId: parseInt(patientId),
      ...recForm.value
    })
    alert('Rekomendasi berhasil disimpan!')
    recForm.value = { type: '', title: '', description: '' }
  } catch (error) {
    alert(error.response?.data?.message || 'Gagal menyimpan')
  } finally {
    submitLoading.value = false
  }
}

const submitPrescription = async () => {
  prescLoading.value = true
  try {
    await api.post('/prescriptions', {
      patientId: parseInt(patientId),
      ...presForm.value
    })
    alert('Resep berhasil disimpan!')
    presForm.value = { medicationName: '', dosage: '', frequency: '', duration: '', notes: '' }
  } catch (error) {
    alert(error.response?.data?.message || 'Gagal menyimpan')
  } finally {
    prescLoading.value = false
  }
}

onMounted(async () => {
  try {
    const [patientRes, bpRes, riskRes] = await Promise.all([
      api.get(`/users/${patientId}`),
      api.get(`/blood-pressure/latest/${patientId}`),
      api.get(`/risk-analysis/patient/${patientId}`)
    ])
    patient.value = patientRes.data
    latestRecord.value = bpRes.data
    riskAnalysis.value = riskRes.data
  } catch (error) {
    console.error('Error fetching patient detail:', error)
  }
})
</script>

<style scoped>
.info-list { display: flex; flex-direction: column; gap: 0.5rem; }
.info-item { display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid var(--border-color); }
.info-item:last-child { border-bottom: none; }
</style>
