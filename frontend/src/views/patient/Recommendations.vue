<template>
  <div class="app-layout">
    <Sidebar />
    <div class="main-content">
      <TopHeader title="Rekomendasi Kesehatan" />
      <div class="page-container">
        <!-- Tabs -->
        <div class="flex gap-2 mb-5">
          <button 
            v-for="type in types" 
            :key="type.value"
            @click="activeType = type.value"
            class="btn"
            :class="activeType === type.value ? 'btn-primary' : 'btn-secondary'"
          >
            {{ type.icon }} {{ type.label }}
          </button>
        </div>

        <!-- Recommendations Grid -->
        <div class="grid grid-cols-2 gap-4">
          <div 
            v-for="rec in filteredRecommendations" 
            :key="rec.id"
            class="card animate-fadeIn"
          >
            <div class="card-header">
              <h3 class="card-title">
                {{ getTypeIcon(rec.type) }} {{ rec.title }}
              </h3>
              <span class="badge" :class="getTypeBadge(rec.type)">
                {{ getTypeLabel(rec.type) }}
              </span>
            </div>
            <div class="card-body">
              <p>{{ rec.description }}</p>
              <div class="text-muted mt-3" style="font-size: 0.8rem;">
                Dari: Dr. {{ rec.doctor?.name || 'Unknown' }} <br>
                Tanggal: {{ formatDate(rec.createdAt) }}
              </div>
            </div>
          </div>
        </div>

        <div v-if="filteredRecommendations.length === 0" class="text-center text-muted" style="padding: 3rem;">
          Belum ada rekomendasi dari dokter
        </div>

        <!-- Download Button -->
        <div v-if="recommendations.length > 0" class="mt-5 text-center">
          <button @click="downloadPDF" class="btn btn-primary btn-lg" :disabled="downloading">
            {{ downloading ? '⏳ Mengunduh...' : '📄 Download PDF' }}
          </button>
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
const activeType = ref('')
const downloading = ref(false)

const types = [
  { value: '', label: 'Semua', icon: '📋' },
  { value: 'medication', label: 'Obat', icon: '💊' },
  { value: 'exercise', label: 'Olahraga', icon: '🏃' },
  { value: 'diet', label: 'Makanan', icon: '🥗' },
  { value: 'stress_management', label: 'Stres', icon: '😌' }
]

const filteredRecommendations = computed(() => {
  if (!activeType.value) return recommendations.value
  return recommendations.value.filter(r => r.type === activeType.value)
})

const getTypeIcon = (type) => {
  const icons = { medication: '💊', exercise: '🏃', diet: '🥗', stress_management: '😌' }
  return icons[type] || '📋'
}

const getTypeLabel = (type) => {
  const labels = { medication: 'Obat', exercise: 'Olahraga', diet: 'Makanan', stress_management: 'Stres' }
  return labels[type] || type
}

const getTypeBadge = (type) => {
  const badges = {
    medication: 'badge-primary',
    exercise: 'badge-success',
    diet: 'badge-warning',
    stress_management: 'badge-info'
  }
  return badges[type] || 'badge-primary'
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const downloadPDF = async () => {
  downloading.value = true
  try {
    const response = await api.get('/recommendations/download/pdf', {
      responseType: 'blob'
    })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.download = 'rekomendasi_kesehatan.pdf'
    link.click()
  } catch (error) {
    console.error('Error downloading PDF:', error)
    alert('Gagal mengunduh PDF')
  } finally {
    downloading.value = false
  }
}

onMounted(async () => {
  try {
    const res = await api.get('/recommendations/my-recommendations')
    recommendations.value = res.data
  } catch (error) {
    console.error('Error fetching recommendations:', error)
  }
})
</script>
