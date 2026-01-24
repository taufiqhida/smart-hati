<template>
  <div class="app-layout">
    <Sidebar />
    <div class="main-content">
      <TopHeader title="Data Gaya Hidup" />
      <div class="page-container">
        <!-- Date Selector -->
        <div class="card mb-4">
          <div class="card-body">
            <div class="flex items-center gap-4">
              <label style="font-weight: 600;">📅 Pilih Tanggal:</label>
              <input 
                type="date" 
                v-model="selectedDate" 
                @change="loadDataForDate"
                class="form-control"
                style="max-width: 200px;"
              />
              <span class="text-muted" v-if="isToday">( Hari Ini )</span>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <!-- Food Intake Card -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">🍽️ Makanan Keseharian</h3>
            </div>
            <div class="card-body">
              <div class="form-group">
                <label class="form-label">Sarapan</label>
                <textarea 
                  v-model="form.breakfast" 
                  class="form-control" 
                  rows="2"
                  placeholder="Contoh: Nasi goreng, telur mata sapi, teh manis"
                ></textarea>
              </div>
              <div class="form-group">
                <label class="form-label">Makan Siang</label>
                <textarea 
                  v-model="form.lunch" 
                  class="form-control" 
                  rows="2"
                  placeholder="Contoh: Nasi, ayam goreng, sayur bayam"
                ></textarea>
              </div>
              <div class="form-group">
                <label class="form-label">Makan Malam</label>
                <textarea 
                  v-model="form.dinner" 
                  class="form-control" 
                  rows="2"
                  placeholder="Contoh: Nasi, ikan bakar, sup"
                ></textarea>
              </div>
              <div class="form-group">
                <label class="form-label">Camilan</label>
                <textarea 
                  v-model="form.snacks" 
                  class="form-control" 
                  rows="2"
                  placeholder="Contoh: Pisang, kacang, biskuit"
                ></textarea>
              </div>
              <div class="form-group">
                <label class="form-label">Konsumsi Air (gelas)</label>
                <input 
                  type="number" 
                  v-model.number="form.waterIntake" 
                  class="form-control" 
                  min="0" 
                  max="20"
                  placeholder="8"
                />
              </div>
            </div>
          </div>

          <!-- Stress & Activity Card -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">😌 Stress & Aktivitas</h3>
            </div>
            <div class="card-body">
              <!-- Stress Level Section -->
              <div class="section-title">Tingkat Stress</div>
              <div class="stress-selector mb-4">
                <button 
                  v-for="level in stressLevels" 
                  :key="level.value"
                  @click="form.stressLevel = level.value"
                  :class="['stress-btn', { active: form.stressLevel === level.value }, level.class]"
                >
                  {{ level.icon }} {{ level.label }}
                </button>
              </div>
              <div class="form-group">
                <label class="form-label">Catatan Penyebab Stress (opsional)</label>
                <textarea 
                  v-model="form.stressNotes" 
                  class="form-control" 
                  rows="2"
                  placeholder="Contoh: Pekerjaan menumpuk, kurang tidur"
                ></textarea>
              </div>

              <!-- Activity Level Section -->
              <div class="section-title mt-4">Level Aktivitas</div>
              <div class="form-group">
                <select v-model="form.activityLevel" class="form-control">
                  <option v-for="level in activityLevels" :key="level.value" :value="level.value">
                    {{ level.icon }} {{ level.label }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Aktivitas yang Dilakukan</label>
                <textarea 
                  v-model="form.activities" 
                  class="form-control" 
                  rows="2"
                  placeholder="Contoh: Jalan kaki ke kantor, naik tangga"
                ></textarea>
              </div>
              <div class="form-group">
                <label class="form-label">Durasi Olahraga (menit)</label>
                <input 
                  type="number" 
                  v-model.number="form.exerciseMinutes" 
                  class="form-control" 
                  min="0" 
                  max="300"
                  placeholder="30"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Save Button -->
        <div class="mt-4" style="text-align: right;">
          <button @click="saveData" class="btn btn-primary btn-lg" :disabled="saving">
            {{ saving ? '⏳ Menyimpan...' : '💾 Simpan Data' }}
          </button>
        </div>

        <!-- History Table -->
        <div class="card mt-4">
          <div class="card-header">
            <h3 class="card-title">📊 Riwayat 7 Hari Terakhir</h3>
          </div>
          <div class="card-body">
            <table class="table" v-if="history.length > 0">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Stress</th>
                  <th>Aktivitas</th>
                  <th>Air (gelas)</th>
                  <th>Olahraga</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="record in history" :key="record.id">
                  <td>{{ formatDate(record.date) }}</td>
                  <td>
                    <span :class="getStressClass(record.stressLevel)">
                      {{ getStressLabel(record.stressLevel) }}
                    </span>
                  </td>
                  <td>{{ getActivityLabel(record.activityLevel) }}</td>
                  <td>{{ record.waterIntake || '-' }}</td>
                  <td>{{ record.exerciseMinutes ? record.exerciseMinutes + ' menit' : '-' }}</td>
                </tr>
              </tbody>
            </table>
            <div v-else class="text-muted text-center" style="padding: 2rem;">
              Belum ada data gaya hidup yang tercatat.
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

const selectedDate = ref(new Date().toISOString().split('T')[0])
const saving = ref(false)
const history = ref([])

const form = ref({
  breakfast: '',
  lunch: '',
  dinner: '',
  snacks: '',
  waterIntake: null,
  stressLevel: 'low',
  stressNotes: '',
  activityLevel: 'sedentary',
  activities: '',
  exerciseMinutes: null
})

const stressLevels = [
  { value: 'low', label: 'Rendah', icon: '😊', class: 'stress-low' },
  { value: 'medium', label: 'Sedang', icon: '😐', class: 'stress-medium' },
  { value: 'high', label: 'Tinggi', icon: '😰', class: 'stress-high' }
]

const activityLevels = [
  { value: 'sedentary', label: 'Tidak Aktif (duduk sepanjang hari)', icon: '🪑' },
  { value: 'light', label: 'Aktivitas Ringan (jalan kaki singkat)', icon: '🚶' },
  { value: 'moderate', label: 'Aktivitas Sedang (olahraga 1-2x/minggu)', icon: '🏃' },
  { value: 'active', label: 'Aktif (olahraga 3-5x/minggu)', icon: '💪' },
  { value: 'very_active', label: 'Sangat Aktif (olahraga setiap hari)', icon: '🏆' }
]

const isToday = computed(() => {
  return selectedDate.value === new Date().toISOString().split('T')[0]
})

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  })
}

const getStressLabel = (level) => {
  const labels = { low: 'Rendah', medium: 'Sedang', high: 'Tinggi' }
  return labels[level] || level
}

const getStressClass = (level) => {
  const classes = { low: 'badge-success', medium: 'badge-warning', high: 'badge-danger' }
  return 'badge ' + (classes[level] || '')
}

const getActivityLabel = (level) => {
  const found = activityLevels.find(a => a.value === level)
  return found ? found.label.split('(')[0].trim() : level
}

const resetForm = () => {
  form.value = {
    breakfast: '',
    lunch: '',
    dinner: '',
    snacks: '',
    waterIntake: null,
    stressLevel: 'low',
    stressNotes: '',
    activityLevel: 'sedentary',
    activities: '',
    exerciseMinutes: null
  }
}

const loadDataForDate = async () => {
  try {
    const res = await api.get(`/lifestyle/daily/${selectedDate.value}`)
    form.value = {
      breakfast: res.data.breakfast || '',
      lunch: res.data.lunch || '',
      dinner: res.data.dinner || '',
      snacks: res.data.snacks || '',
      waterIntake: res.data.waterIntake,
      stressLevel: res.data.stressLevel || 'low',
      stressNotes: res.data.stressNotes || '',
      activityLevel: res.data.activityLevel || 'sedentary',
      activities: res.data.activities || '',
      exerciseMinutes: res.data.exerciseMinutes
    }
  } catch (error) {
    if (error.response?.status === 404) {
      resetForm()
    } else {
      console.error('Error loading data:', error)
    }
  }
}

const loadHistory = async () => {
  try {
    const res = await api.get('/lifestyle/history?limit=7')
    history.value = res.data
  } catch (error) {
    console.error('Error loading history:', error)
  }
}

const saveData = async () => {
  saving.value = true
  try {
    await api.post('/lifestyle/daily', {
      date: selectedDate.value,
      ...form.value
    })
    alert('✅ Data gaya hidup berhasil disimpan!')
    loadHistory()
  } catch (error) {
    console.error('Error saving:', error)
    alert('❌ Gagal menyimpan data. Silakan coba lagi.')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadDataForDate()
  loadHistory()
})
</script>

<style scoped>
.section-title {
  font-weight: 600;
  font-size: 0.95rem;
  margin-bottom: 0.75rem;
  color: var(--text-primary);
}

.stress-selector {
  display: flex;
  gap: 0.5rem;
}

.stress-btn {
  flex: 1;
  padding: 0.75rem;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.stress-btn:hover {
  border-color: var(--primary);
}

.stress-btn.active.stress-low {
  background: #dcfce7;
  border-color: #22c55e;
  color: #15803d;
}

.stress-btn.active.stress-medium {
  background: #fef9c3;
  border-color: #eab308;
  color: #a16207;
}

.stress-btn.active.stress-high {
  background: #fee2e2;
  border-color: #ef4444;
  color: #b91c1c;
}

.badge {
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  font-size: 0.8rem;
  font-weight: 500;
}

.badge-success {
  background: #dcfce7;
  color: #15803d;
}

.badge-warning {
  background: #fef9c3;
  color: #a16207;
}

.badge-danger {
  background: #fee2e2;
  color: #b91c1c;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th,
.table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

.table th {
  font-weight: 600;
  color: var(--text-secondary);
  font-size: 0.85rem;
}
</style>
