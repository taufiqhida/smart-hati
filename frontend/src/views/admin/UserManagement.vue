<template>
  <div class="app-layout">
    <Sidebar />
    <div class="main-content">
      <TopHeader title="Manajemen User" />
      <div class="page-container">
        <!-- Add User Button -->
        <button @click="showAddModal = true" class="btn btn-primary mb-4">
          ➕ Tambah User
        </button>

        <!-- Users Table -->
        <div class="card">
          <div class="card-body">
            <div class="table-container">
              <table class="table">
                <thead>
                  <tr>
                    <th>Nama</th>
                    <th>NIK</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Telepon</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="user in users" :key="user.id">
                    <td><strong>{{ user.name }}</strong></td>
                    <td>{{ user.nik }}</td>
                    <td>{{ user.email || '-' }}</td>
                    <td>
                      <span class="badge" :class="getRoleBadge(user.role)">
                        {{ getRoleLabel(user.role) }}
                      </span>
                    </td>
                    <td>{{ user.phone || '-' }}</td>
                    <td>
                      <button @click="deleteUser(user.id)" class="btn btn-sm btn-danger">
                        🗑️
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Add User Modal -->
        <div v-if="showAddModal" class="modal-overlay" @click="showAddModal = false">
          <div class="modal" @click.stop>
            <div class="modal-header">
              <h3 class="modal-title">➕ Tambah User</h3>
              <button @click="showAddModal = false" class="modal-close">✕</button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="addUser">
                <div class="form-group">
                  <label class="form-label">NIK</label>
                  <input v-model="form.nik" type="text" class="form-input" maxlength="16" required />
                </div>
                <div class="form-group">
                  <label class="form-label">Nama</label>
                  <input v-model="form.name" type="text" class="form-input" required />
                </div>
                <div class="form-group">
                  <label class="form-label">Email</label>
                  <input v-model="form.email" type="email" class="form-input" />
                </div>
                <div class="form-group">
                  <label class="form-label">Password</label>
                  <input v-model="form.password" type="password" class="form-input" required />
                </div>
                <div class="form-group">
                  <label class="form-label">Role</label>
                  <select v-model="form.role" class="form-input form-select" required>
                    <option value="patient">Pasien</option>
                    <option value="nurse">Perawat</option>
                    <option value="doctor">Dokter</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Telepon</label>
                  <input v-model="form.phone" type="text" class="form-input" />
                </div>
                <button type="submit" class="btn btn-primary w-full" :disabled="loading">
                  {{ loading ? '⏳ Menyimpan...' : '💾 Simpan' }}
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
import { ref, onMounted } from 'vue'
import api from '../../services/api'
import Sidebar from '../../components/common/Sidebar.vue'
import TopHeader from '../../components/common/TopHeader.vue'

const users = ref([])
const showAddModal = ref(false)
const loading = ref(false)
const form = ref({ nik: '', name: '', email: '', password: '', role: 'patient', phone: '' })

const getRoleLabel = (role) => ({ patient: 'Pasien', doctor: 'Dokter', nurse: 'Perawat', admin: 'Admin' }[role] || role)
const getRoleBadge = (role) => ({
  patient: 'badge-info',
  doctor: 'badge-success',
  nurse: 'badge-warning',
  admin: 'badge-primary'
}[role] || 'badge-primary')

const fetchUsers = async () => {
  try {
    const res = await api.get('/users')
    users.value = res.data
  } catch (error) { console.error('Error:', error) }
}

const addUser = async () => {
  loading.value = true
  try {
    await api.post('/users', form.value)
    alert('User berhasil ditambahkan!')
    showAddModal.value = false
    form.value = { nik: '', name: '', email: '', password: '', role: 'patient', phone: '' }
    fetchUsers()
  } catch (error) {
    alert(error.response?.data?.message || 'Gagal menambahkan user')
  } finally {
    loading.value = false
  }
}

const deleteUser = async (id) => {
  if (!confirm('Yakin hapus user ini?')) return
  try {
    await api.delete(`/users/${id}`)
    fetchUsers()
  } catch (error) {
    alert(error.response?.data?.message || 'Gagal menghapus user')
  }
}

onMounted(fetchUsers)
</script>
