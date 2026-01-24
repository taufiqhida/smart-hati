<template>
  <div class="app-layout">
    <Sidebar />
    <div class="main-content">
      <TopHeader title="Input Tekanan Darah" />
      <div class="page-container">
        <div class="grid grid-cols-2 gap-4">
          <!-- Input Form -->
          <div class="card animate-slideInUp">
            <div class="card-header">
              <h3 class="card-title">💓 Catat Tekanan Darah</h3>
            </div>
            <div class="card-body">
              <form @submit.prevent="handleSubmit">
                <div class="grid grid-cols-2 gap-3">
                  <div class="form-group">
                    <label class="form-label">Sistolik (mmHg)</label>
                    <input
                      type="number"
                      v-model.number="form.systolic"
                      class="form-input"
                      placeholder="120"
                      min="60"
                      max="250"
                      required
                    />
                    <p class="form-help">Tekanan saat jantung memompa</p>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Diastolik (mmHg)</label>
                    <input
                      type="number"
                      v-model.number="form.diastolic"
                      class="form-input"
                      placeholder="80"
                      min="40"
                      max="150"
                      required
                    />
                    <p class="form-help">Tekanan saat jantung beristirahat</p>
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">Denyut Nadi (bpm) - Opsional</label>
                  <input
                    type="number"
                    v-model.number="form.pulse"
                    class="form-input"
                    placeholder="72"
                    min="40"
                    max="200"
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">Catatan - Opsional</label>
                  <textarea
                    v-model="form.notes"
                    class="form-input"
                    rows="3"
                    placeholder="Contoh: Setelah olahraga, sebelum minum obat, dll"
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  class="btn btn-primary btn-lg w-full"
                  :disabled="loading"
                >
                  {{ loading ? '⏳ Menyimpan...' : '💾 Simpan Data' }}
                </button>
              </form>
            </div>
          </div>

          <!-- Classification Preview -->
          <div>
            <div class="bp-card mb-4">
              <p class="bp-card-label">Preview Tekanan Darah</p>
              <div class="bp-card-value">
                {{ form.systolic || '---' }}<span>/{{ form.diastolic || '---' }}</span>
                <span> mmHg</span>
              </div>
              <div 
                v-if="classification"
                class="bp-card-classification"
                :class="classification.classification"
              >
                {{ classification.label }}
              </div>
            </div>

            <!-- Classification Info -->
            <div class="card">
              <div class="card-header">
                <h3 class="card-title">📋 Panduan Klasifikasi</h3>
              </div>
              <div class="card-body">
                <div class="classification-guide">
                  <div class="classification-item">
                    <span class="badge badge-bp-normal">Normal</span>
                    <span>&lt; 120/80 mmHg</span>
                  </div>
                  <div class="classification-item">
                    <span class="badge badge-bp-prehypertension">Pra-Hipertensi</span>
                    <span>120-139 / 80-89 mmHg</span>
                  </div>
                  <div class="classification-item">
                    <span class="badge badge-bp-hypertension1">Hipertensi Tahap 1</span>
                    <span>140-159 / 90-99 mmHg</span>
                  </div>
                  <div class="classification-item">
                    <span class="badge badge-bp-hypertension2">Hipertensi Tahap 2</span>
                    <span>≥ 160 / ≥ 100 mmHg</span>
                  </div>
                  <div class="classification-item">
                    <span class="badge badge-bp-crisis">Krisis Hipertensi</span>
                    <span>&gt; 180 / &gt; 120 mmHg 🚨</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Success Modal -->
        <div v-if="showSuccess" class="modal-overlay" @click="showSuccess = false">
          <div class="modal" @click.stop>
            <div class="modal-header">
              <h3 class="modal-title">✅ Berhasil!</h3>
              <button @click="showSuccess = false" class="modal-close">✕</button>
            </div>
            <div class="modal-body text-center">
              <div style="font-size: 4rem; margin-bottom: 1rem;">
                {{ getClassificationEmoji(lastResult?.classification?.classification) }}
              </div>
              <h3 style="font-size: 1.5rem; margin-bottom: 0.5rem;">
                {{ lastResult?.record?.systolic }}/{{ lastResult?.record?.diastolic }} mmHg
              </h3>
              <p class="text-muted">{{ lastResult?.classification?.label }}</p>
              <p style="margin-top: 1rem;">{{ lastResult?.classification?.description }}</p>
            </div>
            <div class="modal-footer">
              <router-link to="/monitoring" class="btn btn-secondary">
                📊 Lihat Grafik
              </router-link>
              <button @click="resetForm" class="btn btn-primary">
                ➕ Input Lagi
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import api from '../../services/api'
import Sidebar from '../../components/common/Sidebar.vue'
import TopHeader from '../../components/common/TopHeader.vue'

const loading = ref(false)
const showSuccess = ref(false)
const lastResult = ref(null)

const form = ref({
  systolic: null,
  diastolic: null,
  pulse: null,
  notes: ''
})

const classification = computed(() => {
  if (!form.value.systolic || !form.value.diastolic) return null
  
  const sys = form.value.systolic
  const dia = form.value.diastolic

  if (sys > 180 || dia > 120) {
    return { classification: 'crisis', label: '🚨 Krisis Hipertensi' }
  } else if (sys >= 160 || dia >= 100) {
    return { classification: 'hypertension_2', label: '🔴 Hipertensi Tahap 2' }
  } else if (sys >= 140 || dia >= 90) {
    return { classification: 'hypertension_1', label: '🔶 Hipertensi Tahap 1' }
  } else if (sys >= 120 || dia >= 80) {
    return { classification: 'prehypertension', label: '⚠️ Pra-Hipertensi' }
  } else {
    return { classification: 'normal', label: '✅ Normal' }
  }
})

const getClassificationEmoji = (classification) => {
  const emojis = {
    normal: '💚',
    prehypertension: '💛',
    hypertension_1: '🧡',
    hypertension_2: '❤️',
    crisis: '🚨'
  }
  return emojis[classification] || '💓'
}

const handleSubmit = async () => {
  loading.value = true
  try {
    const response = await api.post('/blood-pressure', {
      systolic: form.value.systolic,
      diastolic: form.value.diastolic,
      pulse: form.value.pulse || null,
      notes: form.value.notes || null
    })
    lastResult.value = response.data
    showSuccess.value = true
  } catch (error) {
    console.error('Error saving blood pressure:', error)
    alert(error.response?.data?.message || 'Gagal menyimpan data')
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  form.value = {
    systolic: null,
    diastolic: null,
    pulse: null,
    notes: ''
  }
  showSuccess.value = false
}
</script>

<style scoped>
.classification-guide {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.classification-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border-color);
}

.classification-item:last-child {
  border-bottom: none;
}
</style>
