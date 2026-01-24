<template>
  <div class="app-layout">
    <Sidebar />
    <div class="main-content">
      <TopHeader title="Resep Saya" />
      <div class="page-container">
        <!-- Loading State -->
        <div v-if="loading" class="text-center" style="padding: 3rem;">
          <p class="text-muted">⏳ Memuat resep...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="prescriptions.length === 0" class="text-center" style="padding: 3rem;">
          <div style="font-size: 4rem; margin-bottom: 1rem;">💊</div>
          <h3 style="margin-bottom: 0.5rem;">Belum Ada Resep</h3>
          <p class="text-muted">Anda belum memiliki resep dari dokter</p>
        </div>

        <!-- Prescriptions List -->
        <div v-else class="flex flex-col gap-4">
          <div 
            v-for="prescription in prescriptions" 
            :key="prescription.id"
            class="card animate-fadeIn"
          >
            <div class="card-header">
              <div class="flex items-center gap-3">
                <span style="font-size: 1.5rem;">💊</span>
                <div>
                  <h3 class="card-title" style="margin: 0;">{{ prescription.medicationName }}</h3>
                  <span class="text-muted" style="font-size: 0.85rem;">
                    Dari: Dr. {{ prescription.doctor?.name || 'Tidak diketahui' }}
                  </span>
                </div>
              </div>
              <span class="badge badge-primary">
                {{ formatDate(prescription.createdAt) }}
              </span>
            </div>
            <div class="card-body">
              <div class="grid grid-cols-3 gap-4" style="margin-bottom: 1rem;">
                <div>
                  <div class="text-muted" style="font-size: 0.75rem; margin-bottom: 0.25rem;">Dosis</div>
                  <div style="font-weight: 600;">{{ prescription.dosage }}</div>
                </div>
                <div>
                  <div class="text-muted" style="font-size: 0.75rem; margin-bottom: 0.25rem;">Frekuensi</div>
                  <div style="font-weight: 600;">{{ prescription.frequency }}</div>
                </div>
                <div>
                  <div class="text-muted" style="font-size: 0.75rem; margin-bottom: 0.25rem;">Durasi</div>
                  <div style="font-weight: 600;">{{ prescription.duration || '-' }}</div>
                </div>
              </div>
              
              <div v-if="prescription.notes" style="margin-bottom: 1rem;">
                <div class="text-muted" style="font-size: 0.75rem; margin-bottom: 0.25rem;">Catatan Dokter</div>
                <div style="padding: 0.75rem; background: var(--bg-tertiary); border-radius: var(--radius); font-size: 0.9rem;">
                  {{ prescription.notes }}
                </div>
              </div>

              <button 
                @click="downloadPDF(prescription.id)"
                class="btn btn-secondary"
                :disabled="downloadingId === prescription.id"
              >
                {{ downloadingId === prescription.id ? '⏳ Mengunduh...' : '📥 Download PDF' }}
              </button>
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

const prescriptions = ref([])
const loading = ref(true)
const downloadingId = ref(null)

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const downloadPDF = async (id) => {
  try {
    downloadingId.value = id
    const response = await api.get(`/prescriptions/download/pdf/${id}`, {
      responseType: 'blob'
    })
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `resep_${id}.pdf`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error downloading PDF:', error)
    alert('Gagal mengunduh PDF resep')
  } finally {
    downloadingId.value = null
  }
}

onMounted(async () => {
  try {
    const response = await api.get('/prescriptions/my-prescriptions')
    prescriptions.value = response.data
  } catch (error) {
    console.error('Error fetching prescriptions:', error)
  } finally {
    loading.value = false
  }
})
</script>
