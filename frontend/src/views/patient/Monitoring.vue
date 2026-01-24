<template>
  <div class="app-layout">
    <Sidebar />
    <div class="main-content">
      <TopHeader title="Monitoring Tekanan Darah" />
      <div class="page-container">
        <!-- Stats -->
        <div class="grid grid-cols-4 gap-4 mb-5">
          <div class="stat-card">
            <div class="stat-card-header">
              <div class="stat-card-icon primary">📊</div>
            </div>
            <div class="stat-card-value">{{ stats.totalRecords || 0 }}</div>
            <div class="stat-card-label">Total Pengukuran</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-header">
              <div class="stat-card-icon success">💚</div>
            </div>
            <div class="stat-card-value">{{ stats.averageSystolic || 0 }}/{{ stats.averageDiastolic || 0 }}</div>
            <div class="stat-card-label">Rata-rata</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-header">
              <div class="stat-card-icon warning">📈</div>
            </div>
            <div class="stat-card-value">{{ stats.maxSystolic || 0 }}</div>
            <div class="stat-card-label">Sistolik Tertinggi</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-header">
              <div class="stat-card-icon danger">📉</div>
            </div>
            <div class="stat-card-value">{{ stats.minSystolic || 0 }}</div>
            <div class="stat-card-label">Sistolik Terendah</div>
          </div>
        </div>

        <!-- Chart -->
        <div class="card mb-5">
          <div class="card-header">
            <h3 class="card-title">📈 Grafik Tekanan Darah (30 Hari Terakhir)</h3>
            <div class="flex gap-2">
              <select v-model="filterBy" class="form-input form-select" style="width: auto;">
                <option value="">Semua</option>
                <option value="patient">Input Mandiri</option>
                <option value="nurse">Input Perawat</option>
              </select>
            </div>
          </div>
          <div class="card-body">
            <div class="chart-container">
              <Line v-if="chartData" :data="chartData" :options="chartOptions" />
              <div v-else class="text-center text-muted" style="padding: 3rem;">
                Belum ada data untuk ditampilkan
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Records -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">📋 Riwayat Pengukuran</h3>
          </div>
          <div class="card-body">
            <div class="table-container">
              <table class="table">
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>Sistolik</th>
                    <th>Diastolik</th>
                    <th>Nadi</th>
                    <th>Klasifikasi</th>
                    <th>Sumber</th>
                    <th>Catatan</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="record in records" :key="record.id">
                    <td>{{ formatDate(record.recordedAt) }}</td>
                    <td><strong>{{ record.systolic }}</strong></td>
                    <td><strong>{{ record.diastolic }}</strong></td>
                    <td>{{ record.pulse || '-' }}</td>
                    <td>
                      <span :class="getBadgeClass(record.classification)">
                        {{ getClassificationLabel(record.classification) }}
                      </span>
                    </td>
                    <td>
                      <span class="badge" :class="record.inputBy === 'patient' ? 'badge-info' : 'badge-warning'">
                        {{ record.inputBy === 'patient' ? 'Mandiri' : 'Perawat' }}
                      </span>
                    </td>
                    <td>{{ record.notes || '-' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import api from '../../services/api'
import Sidebar from '../../components/common/Sidebar.vue'
import TopHeader from '../../components/common/TopHeader.vue'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const stats = ref({})
const records = ref([])
const filterBy = ref('')

const chartData = computed(() => {
  if (!stats.value.chartData || stats.value.chartData.length === 0) return null

  return {
    labels: stats.value.chartData.map(d => 
      new Date(d.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
    ),
    datasets: [
      {
        label: 'Sistolik',
        data: stats.value.chartData.map(d => d.systolic),
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Diastolik',
        data: stats.value.chartData.map(d => d.diastolic),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top'
    }
  },
  scales: {
    y: {
      min: 40,
      max: 200
    }
  }
}

const getClassificationLabel = (classification) => {
  const labels = {
    normal: 'Normal',
    prehypertension: 'Pra-Hipertensi',
    hypertension_1: 'Hipertensi 1',
    hypertension_2: 'Hipertensi 2',
    crisis: 'Krisis'
  }
  return labels[classification] || classification
}

const getBadgeClass = (classification) => {
  const classes = {
    normal: 'badge badge-bp-normal',
    prehypertension: 'badge badge-bp-prehypertension',
    hypertension_1: 'badge badge-bp-hypertension1',
    hypertension_2: 'badge badge-bp-hypertension2',
    crisis: 'badge badge-bp-crisis'
  }
  return classes[classification] || 'badge'
}

const formatDate = (date) => {
  return new Date(date).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const fetchData = async () => {
  try {
    const params = filterBy.value ? { inputBy: filterBy.value } : {}
    const [statsRes, recordsRes] = await Promise.all([
      api.get('/blood-pressure/statistics'),
      api.get('/blood-pressure/my-records', { params })
    ])
    stats.value = statsRes.data
    records.value = recordsRes.data
  } catch (error) {
    console.error('Error fetching monitoring data:', error)
  }
}

watch(filterBy, fetchData)
onMounted(fetchData)
</script>
