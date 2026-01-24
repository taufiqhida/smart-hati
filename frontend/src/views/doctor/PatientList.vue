<template>
  <div class="app-layout">
    <Sidebar />
    <div class="main-content">
      <TopHeader title="Daftar Pasien" />
      <div class="page-container">
        <!-- Search & Filter -->
        <div class="card mb-4">
          <div class="card-body">
            <div class="flex gap-3">
              <input
                v-model="search"
                type="text"
                class="form-input"
                placeholder="Cari nama atau NIK..."
                style="max-width: 300px;"
              />
            </div>
          </div>
        </div>

        <!-- Patient List -->
        <div class="card">
          <div class="card-body">
            <div class="table-container">
              <table class="table">
                <thead>
                  <tr>
                    <th>Nama</th>
                    <th>NIK</th>
                    <th>Usia</th>
                    <th>Tekanan Darah Terakhir</th>
                    <th>Klasifikasi</th>
                    <th>Risiko</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="patient in filteredPatients" :key="patient.id">
                    <td><strong>{{ patient.name }}</strong></td>
                    <td>{{ patient.nik }}</td>
                    <td>{{ patient.profile?.age || '-' }}</td>
                    <td>
                      <span v-if="patient.bloodPressureRecords?.[0]">
                        {{ patient.bloodPressureRecords[0].systolic }}/{{ patient.bloodPressureRecords[0].diastolic }}
                      </span>
                      <span v-else class="text-muted">-</span>
                    </td>
                    <td>
                      <span v-if="patient.bloodPressureRecords?.[0]" :class="getBadgeClass(patient.bloodPressureRecords[0].classification)">
                        {{ getClassLabel(patient.bloodPressureRecords[0].classification) }}
                      </span>
                      <span v-else class="text-muted">-</span>
                    </td>
                    <td>
                      <span class="badge badge-warning">Sedang</span>
                    </td>
                    <td>
                      <router-link :to="`/doctor/patients/${patient.id}`" class="btn btn-sm btn-primary">
                        Detail
                      </router-link>
                    </td>
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
import { ref, computed, onMounted } from 'vue'
import api from '../../services/api'
import Sidebar from '../../components/common/Sidebar.vue'
import TopHeader from '../../components/common/TopHeader.vue'

const patients = ref([])
const search = ref('')

const filteredPatients = computed(() => {
  if (!search.value) return patients.value
  const q = search.value.toLowerCase()
  return patients.value.filter(p => 
    p.name.toLowerCase().includes(q) || p.nik.includes(q)
  )
})

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

const getClassLabel = (classification) => {
  const labels = {
    normal: 'Normal',
    prehypertension: 'Pra-Hipertensi',
    hypertension_1: 'Hipertensi 1',
    hypertension_2: 'Hipertensi 2',
    crisis: 'KRISIS'
  }
  return labels[classification] || classification
}

onMounted(async () => {
  try {
    const res = await api.get('/users/patients')
    patients.value = res.data
  } catch (error) {
    console.error('Error fetching patients:', error)
  }
})
</script>
