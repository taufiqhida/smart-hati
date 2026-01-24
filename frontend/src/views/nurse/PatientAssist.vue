<template>
  <div class="app-layout">
    <Sidebar />
    <div class="main-content">
      <TopHeader title="Bantu Input Pasien" />
      <div class="page-container">
        <div class="grid grid-cols-2 gap-4">
          <!-- Patient Selection -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">👤 Pilih Pasien</h3>
            </div>
            <div class="card-body">
              <input v-model="search" type="text" class="form-input mb-3" placeholder="Cari nama atau NIK..." />
              <div style="max-height: 400px; overflow-y: auto;">
                <div 
                  v-for="patient in filteredPatients" 
                  :key="patient.id"
                  @click="selectedPatient = patient"
                  class="chat-contact"
                  :class="{ active: selectedPatient?.id === patient.id }"
                  style="border-bottom: 1px solid var(--border-color);"
                >
                  <div class="chat-contact-avatar">{{ patient.name.charAt(0) }}</div>
                  <div class="chat-contact-info">
                    <div class="chat-contact-name">{{ patient.name }}</div>
                    <div class="chat-contact-role">{{ patient.nik }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Input Form -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">💓 Input Tekanan Darah</h3>
            </div>
            <div class="card-body">
              <div v-if="!selectedPatient" class="text-center text-muted" style="padding: 3rem;">
                Pilih pasien terlebih dahulu
              </div>
              <form v-else @submit.prevent="handleSubmit">
                <div class="mb-3" style="padding: 1rem; background: var(--bg-tertiary); border-radius: var(--radius);">
                  <strong>Pasien:</strong> {{ selectedPatient.name }} ({{ selectedPatient.nik }})
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div class="form-group">
                    <label class="form-label">Sistolik (mmHg)</label>
                    <input v-model.number="form.systolic" type="number" class="form-input" required />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Diastolik (mmHg)</label>
                    <input v-model.number="form.diastolic" type="number" class="form-input" required />
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">Denyut Nadi (bpm)</label>
                  <input v-model.number="form.pulse" type="number" class="form-input" />
                </div>
                <div class="form-group">
                  <label class="form-label">Catatan</label>
                  <textarea v-model="form.notes" class="form-input" rows="2"></textarea>
                </div>
                <button type="submit" class="btn btn-primary w-full" :disabled="loading">
                  {{ loading ? '⏳ Menyimpan...' : '💾 Simpan Data' }}
                </button>
              </form>
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

const patients = ref([])
const search = ref('')
const selectedPatient = ref(null)
const loading = ref(false)
const form = ref({ systolic: null, diastolic: null, pulse: null, notes: '' })

const filteredPatients = computed(() => {
  if (!search.value) return patients.value
  const q = search.value.toLowerCase()
  return patients.value.filter(p => p.name.toLowerCase().includes(q) || p.nik.includes(q))
})

const handleSubmit = async () => {
  loading.value = true
  try {
    await api.post('/blood-pressure', {
      patientId: selectedPatient.value.id,
      ...form.value
    })
    alert('Data berhasil disimpan!')
    form.value = { systolic: null, diastolic: null, pulse: null, notes: '' }
    selectedPatient.value = null
  } catch (error) {
    alert(error.response?.data?.message || 'Gagal menyimpan')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    const res = await api.get('/users/patients')
    patients.value = res.data
  } catch (error) { console.error('Error:', error) }
})
</script>
