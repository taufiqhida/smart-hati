<template>
  <header class="top-header">
    <div class="header-left">
      <button class="mobile-menu-btn" @click="toggleSidebar">☰</button>
      <h1 class="page-title">{{ title }}</h1>
    </div>
    <div class="header-right">
      <button class="header-icon-btn" @click="showNotifications = !showNotifications">
        🔔
        <span v-if="unreadCount > 0" class="notification-badge">{{ unreadCount }}</span>
      </button>
      
      <!-- Notifications Dropdown -->
      <div v-if="showNotifications" class="notifications-dropdown">
        <div class="notifications-header">
          <strong>Notifikasi</strong>
          <button @click="markAllRead" class="btn btn-sm">Tandai Semua Dibaca</button>
        </div>
        <div class="notifications-list">
          <div v-if="notifications.length === 0" class="notification-empty">
            Tidak ada notifikasi
          </div>
          <div 
            v-for="notif in notifications.slice(0, 5)" 
            :key="notif.id"
            class="notification-item"
            :class="{ unread: !notif.isRead }"
            @click="markAsRead(notif.id)"
          >
            <div class="notification-icon">{{ getNotifIcon(notif.type) }}</div>
            <div class="notification-content">
              <div class="notification-title">{{ notif.title }}</div>
              <div class="notification-message">{{ notif.message }}</div>
              <div class="notification-time">{{ formatTime(notif.createdAt) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
  
  <!-- Sidebar Overlay for Mobile -->
  <div v-if="sidebarOpen" class="sidebar-overlay" @click="toggleSidebar"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../../services/api'

defineProps({
  title: {
    type: String,
    default: 'Dashboard'
  }
})

const showNotifications = ref(false)
const notifications = ref([])
const unreadCount = ref(0)
const sidebarOpen = ref(false)

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
  // Toggle sidebar class on the actual sidebar element
  const sidebar = document.querySelector('.sidebar')
  if (sidebar) {
    sidebar.classList.toggle('open', sidebarOpen.value)
  }
}

const getNotifIcon = (type) => {
  const icons = {
    crisis_alert: '🚨',
    new_recommendation: '📋',
    new_prescription: '💊',
    new_message: '💬',
    emergency_chat: '🆘'
  }
  return icons[type] || '🔔'
}

const formatTime = (date) => {
  const now = new Date()
  const notifDate = new Date(date)
  const diffMs = now - notifDate
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Baru saja'
  if (diffMins < 60) return `${diffMins} menit lalu`
  if (diffHours < 24) return `${diffHours} jam lalu`
  return `${diffDays} hari lalu`
}

const markAsRead = async (id) => {
  try {
    await api.put(`/notifications/${id}/read`)
    const notif = notifications.value.find(n => n.id === id)
    if (notif && !notif.isRead) {
      notif.isRead = true
      unreadCount.value--
    }
  } catch (error) {
    console.error('Error marking notification as read:', error)
  }
}

const markAllRead = async () => {
  try {
    await api.put('/notifications/read-all')
    notifications.value.forEach(n => n.isRead = true)
    unreadCount.value = 0
  } catch (error) {
    console.error('Error marking all as read:', error)
  }
}

onMounted(async () => {
  try {
    const [notifsRes, countRes] = await Promise.all([
      api.get('/notifications'),
      api.get('/notifications/unread-count')
    ])
    notifications.value = notifsRes.data
    unreadCount.value = countRes.data.unreadCount
  } catch (error) {
    console.error('Error fetching notifications:', error)
  }
})
</script>

<style scoped>
.notifications-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  width: 350px;
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-color);
  z-index: 100;
  margin-top: 0.5rem;
}

.notifications-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.notifications-list {
  max-height: 400px;
  overflow-y: auto;
}

.notification-empty {
  padding: 2rem;
  text-align: center;
  color: var(--text-secondary);
}

.notification-item {
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.notification-item:hover {
  background: var(--bg-tertiary);
}

.notification-item.unread {
  background: var(--primary-50);
}

.notification-icon {
  font-size: 1.5rem;
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-weight: 600;
  font-size: 0.9rem;
}

.notification-message {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
}

.notification-time {
  font-size: 0.7rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
}
</style>
