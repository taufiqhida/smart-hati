<template>
  <div class="app-layout">
    <Sidebar />
    <div class="main-content">
      <TopHeader title="Data Gaya Hidup" />
      <div class="page-container">

        <!-- Date Selector -->
        <div class="date-card mb-4">
          <div class="date-card-body">
            <span class="date-icon">📅</span>
            <label class="date-label">Pilih Tanggal:</label>
            <input
              type="date"
              v-model="selectedDate"
              @change="loadDataForDate"
              class="date-input"
            />
            <span class="today-badge" v-if="isToday">Hari Ini</span>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <!-- Food Intake Card -->
          <div class="form-card">
            <div class="form-card-header food-header">
              <span class="header-icon">🍽️</span>
              <h3 class="form-card-title">Makanan Keseharian</h3>
            </div>
            <div class="form-card-body">

              <div class="field-group">
                <label class="field-label">
                  <span class="field-dot dot-breakfast"></span>
                  Sarapan
                </label>
                <textarea
                  v-model="form.breakfast"
                  class="field-textarea"
                  rows="3"
                  placeholder="Contoh: Nasi goreng, telur mata sapi, teh manis"
                ></textarea>
              </div>

              <div class="field-group">
                <label class="field-label">
                  <span class="field-dot dot-lunch"></span>
                  Makan Siang
                </label>
                <textarea
                  v-model="form.lunch"
                  class="field-textarea"
                  rows="3"
                  placeholder="Contoh: Nasi, ayam goreng, sayur bayam"
                ></textarea>
              </div>

              <div class="field-group">
                <label class="field-label">
                  <span class="field-dot dot-dinner"></span>
                  Makan Malam
                </label>
                <textarea
                  v-model="form.dinner"
                  class="field-textarea"
                  rows="3"
                  placeholder="Contoh: Nasi, ikan bakar, sup"
                ></textarea>
              </div>

              <div class="field-group">
                <label class="field-label">
                  <span class="field-dot dot-snack"></span>
                  Camilan
                </label>
                <textarea
                  v-model="form.snacks"
                  class="field-textarea"
                  rows="2"
                  placeholder="Contoh: Pisang, kacang, biskuit"
                ></textarea>
              </div>

              <div class="field-group">
                <label class="field-label">💧 Konsumsi Air (gelas)</label>
                <div class="number-input-wrapper">
                  <input
                    type="number"
                    v-model.number="form.waterIntake"
                    class="field-number"
                    min="0"
                    max="20"
                    placeholder="0"
                  />
                  <span class="number-unit">gelas / hari</span>
                </div>
              </div>

            </div>
          </div>

          <!-- Stress & Activity Card -->
          <div class="form-card">
            <div class="form-card-header stress-header">
              <span class="header-icon">😌</span>
              <h3 class="form-card-title">Stress & Aktivitas</h3>
            </div>
            <div class="form-card-body">

              <!-- Stress Level -->
              <div class="field-group">
                <label class="field-label">Tingkat Stress</label>
                <div class="stress-selector">
                  <button
                    v-for="level in stressLevels"
                    :key="level.value"
                    @click="form.stressLevel = level.value"
                    :class="['stress-btn', level.class, { active: form.stressLevel === level.value }]"
                  >
                    <span class="stress-icon">{{ level.icon }}</span>
                    <span class="stress-label">{{ level.label }}</span>
                  </button>
                </div>
              </div>

              <div class="field-group">
                <label class="field-label">📝 Catatan Penyebab Stress <span class="optional-tag">Opsional</span></label>
                <textarea
                  v-model="form.stressNotes"
                  class="field-textarea"
                  rows="3"
                  placeholder="Contoh: Pekerjaan menumpuk, kurang tidur, deadline mendesak"
                ></textarea>
              </div>

              <!-- Activity Level -->
              <div class="field-group">
                <label class="field-label">🏃 Level Aktivitas</label>
                <div class="activity-options">
                  <label
                    v-for="level in activityLevels"
                    :key="level.value"
                    :class="['activity-option', { active: form.activityLevel === level.value }]"
                  >
                    <input
                      type="radio"
                      :value="level.value"
                      v-model="form.activityLevel"
                      style="display:none"
                    />
                    <span class="activity-icon">{{ level.icon }}</span>
                    <span class="activity-text">{{ level.label }}</span>
                  </label>
                </div>
              </div>

              <div class="field-group">
                <label class="field-label">🚶 Aktivitas yang Dilakukan</label>
                <textarea
                  v-model="form.activities"
                  class="field-textarea"
                  rows="3"
                  placeholder="Contoh: Jalan kaki ke kantor, naik tangga, stretching pagi"
                ></textarea>
              </div>

              <div class="field-group">
                <label class="field-label">⏱️ Durasi Olahraga (menit)</label>
                <div class="number-input-wrapper">
                  <input
                    type="number"
                    v-model.number="form.exerciseMinutes"
                    class="field-number"
                    min="0"
                    max="300"
                    placeholder="0"
                  />
                  <span class="number-unit">menit / hari</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        <!-- Save Button -->
        <div class="save-row mt-4">
          <button @click="saveData" class="save-btn" :disabled="saving">
            <span v-if="saving">⏳ Menyimpan...</span>
            <span v-else>💾 Simpan Data Gaya Hidup</span>
          </button>
        </div>

        <!-- History Table -->
        <div class="form-card mt-4">
          <div class="form-card-header history-header">
            <span class="header-icon">📊</span>
            <h3 class="form-card-title">Riwayat 7 Hari Terakhir</h3>
          </div>
          <div class="form-card-body">
            <table class="history-table" v-if="history.length > 0">
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
            <div v-else class="empty-history">
              <span>📭</span>
              <p>Belum ada data gaya hidup yang tercatat.</p>
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
  const labels = { low: '😊 Rendah', medium: '😐 Sedang', high: '😰 Tinggi' }
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
/* ─── Date Card ─────────────────────────────────────── */
.date-card {
  background: var(--bg-primary, #fff);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 14px;
  padding: 1rem 1.5rem;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}
.date-card-body {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.date-icon { font-size: 1.2rem; }
.date-label {
  font-weight: 600;
  color: var(--text-primary, #111);
  white-space: nowrap;
}
.date-input {
  padding: 0.45rem 0.75rem;
  border: 1.5px solid var(--border-color, #d1d5db);
  border-radius: 8px;
  font-size: 0.95rem;
  color: var(--text-primary, #111);
  background: var(--bg-secondary, #f9fafb);
  outline: none;
  transition: border-color 0.2s;
}
.date-input:focus { border-color: var(--primary, #7c3aed); }
.today-badge {
  background: #ede9fe;
  color: #6d28d9;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  letter-spacing: 0.02em;
}

/* ─── Form Card ─────────────────────────────────────── */
.form-card {
  background: var(--bg-primary, #fff);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.form-card-header {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
}
.food-header { background: linear-gradient(135deg, #fef3c7, #fde68a33); }
.stress-header { background: linear-gradient(135deg, #ede9fe, #ddd6fe33); }
.history-header { background: linear-gradient(135deg, #e0f2fe, #bae6fd33); }

.header-icon { font-size: 1.25rem; }
.form-card-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary, #111);
  margin: 0;
}
.form-card-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; }

/* ─── Field Groups ──────────────────────────────────── */
.field-group { display: flex; flex-direction: column; gap: 0.4rem; }
.field-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary, #374151);
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.optional-tag {
  font-size: 0.7rem;
  font-weight: 500;
  background: #f3f4f6;
  color: #6b7280;
  padding: 0.1rem 0.5rem;
  border-radius: 20px;
  margin-left: 0.25rem;
}
.field-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.dot-breakfast { background: #f59e0b; }
.dot-lunch     { background: #10b981; }
.dot-dinner    { background: #6366f1; }
.dot-snack     { background: #ec4899; }

/* ─── Textarea & Input ──────────────────────────────── */
.field-textarea {
  width: 100%;
  padding: 0.65rem 0.9rem;
  border: 1.5px solid var(--border-color, #d1d5db);
  border-radius: 10px;
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--text-primary, #111);
  background: var(--bg-secondary, #f9fafb);
  resize: vertical;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
  font-family: inherit;
}
.field-textarea:focus {
  border-color: var(--primary, #7c3aed);
  box-shadow: 0 0 0 3px rgba(124,58,237,0.1);
  background: #fff;
}
.field-textarea::placeholder { color: #9ca3af; font-size: 0.85rem; }

.number-input-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.field-number {
  width: 100px;
  padding: 0.55rem 0.75rem;
  border: 1.5px solid var(--border-color, #d1d5db);
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary, #111);
  background: var(--bg-secondary, #f9fafb);
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  text-align: center;
}
.field-number:focus {
  border-color: var(--primary, #7c3aed);
  box-shadow: 0 0 0 3px rgba(124,58,237,0.1);
  background: #fff;
}
.number-unit {
  font-size: 0.85rem;
  color: #6b7280;
}

/* ─── Stress Buttons ────────────────────────────────── */
.stress-selector {
  display: flex;
  gap: 0.6rem;
}
.stress-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.75rem 0.5rem;
  border: 2px solid var(--border-color, #e5e7eb);
  border-radius: 12px;
  background: var(--bg-secondary, #f9fafb);
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}
.stress-icon { font-size: 1.5rem; }
.stress-label { font-size: 0.8rem; font-weight: 600; color: var(--text-secondary, #374151); }

.stress-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.08); }

.stress-btn.stress-low.active   { background: #dcfce7; border-color: #22c55e; }
.stress-btn.stress-medium.active{ background: #fef9c3; border-color: #eab308; }
.stress-btn.stress-high.active  { background: #fee2e2; border-color: #ef4444; }
.stress-btn.stress-low.active .stress-label   { color: #15803d; }
.stress-btn.stress-medium.active .stress-label{ color: #a16207; }
.stress-btn.stress-high.active .stress-label  { color: #b91c1c; }

/* ─── Activity Options ──────────────────────────────── */
.activity-options {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.activity-option {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.55rem 0.85rem;
  border: 1.5px solid var(--border-color, #e5e7eb);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.18s ease;
  background: var(--bg-secondary, #f9fafb);
}
.activity-option:hover { border-color: var(--primary, #7c3aed); background: #f5f3ff; }
.activity-option.active {
  border-color: var(--primary, #7c3aed);
  background: #ede9fe;
}
.activity-icon { font-size: 1.1rem; flex-shrink: 0; }
.activity-text { font-size: 0.85rem; color: var(--text-primary, #111); font-weight: 500; }
.activity-option.active .activity-text { color: #6d28d9; font-weight: 600; }

/* ─── Save Button ───────────────────────────────────── */
.save-row { display: flex; justify-content: flex-end; }
.save-btn {
  padding: 0.75rem 2rem;
  background: var(--primary, #7c3aed);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
  box-shadow: 0 4px 12px rgba(124,58,237,0.25);
}
.save-btn:hover:not(:disabled) {
  background: #6d28d9;
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(124,58,237,0.35);
}
.save-btn:disabled { opacity: 0.65; cursor: not-allowed; }

/* ─── History Table ─────────────────────────────────── */
.history-table {
  width: 100%;
  border-collapse: collapse;
}
.history-table th,
.history-table td {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
  font-size: 0.875rem;
}
.history-table th {
  font-weight: 700;
  color: var(--text-secondary, #6b7280);
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  background: var(--bg-secondary, #f9fafb);
}
.history-table tbody tr:hover { background: #f5f3ff; }
.history-table tbody tr:last-child td { border-bottom: none; }

.badge {
  padding: 0.25rem 0.65rem;
  border-radius: 20px;
  font-size: 0.78rem;
  font-weight: 600;
  white-space: nowrap;
}
.badge-success { background: #dcfce7; color: #15803d; }
.badge-warning { background: #fef9c3; color: #a16207; }
.badge-danger  { background: #fee2e2; color: #b91c1c; }

.empty-history {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 2.5rem;
  color: var(--text-secondary, #9ca3af);
  font-size: 0.9rem;
}
.empty-history span { font-size: 2rem; }
</style>
