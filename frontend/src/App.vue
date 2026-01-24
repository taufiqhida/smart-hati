<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'

const authStore = useAuthStore()

onMounted(async () => {
  // Check if user is logged in
  const token = localStorage.getItem('token')
  if (token) {
    try {
      await authStore.fetchUser()
    } catch (error) {
      authStore.logout()
    }
  }
})
</script>
