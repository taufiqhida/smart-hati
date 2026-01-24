<template>
  <div class="app-layout">
    <Sidebar />
    <div class="main-content">
      <TopHeader title="Konsultasi" />
      <div class="page-container">
        <div class="chat-container">
          <!-- Contacts -->
          <div class="chat-sidebar">
            <div style="padding: 1rem; border-bottom: 1px solid var(--border-color);">
              <h3 style="font-weight: 600;">💬 Pesan</h3>
            </div>
            <div class="chat-contact-list">
              <div 
                v-for="contact in contacts" 
                :key="contact.id"
                @click="selectContact(contact)"
                class="chat-contact"
                :class="{ active: selectedContact?.id === contact.id }"
              >
                <div class="chat-contact-avatar">
                  {{ getInitials(contact.name) }}
                </div>
                <div class="chat-contact-info">
                  <div class="chat-contact-name">{{ contact.name }}</div>
                  <div class="chat-contact-role">{{ getRoleLabel(contact.role) }}</div>
                </div>
                <span v-if="contact.unreadCount > 0" class="nav-item-badge">
                  {{ contact.unreadCount }}
                </span>
              </div>
            </div>
          </div>

          <!-- Chat Area -->
          <div class="chat-main">
            <template v-if="selectedContact">
              <!-- Chat Header -->
              <div style="padding: 1rem; border-bottom: 1px solid var(--border-color); display: flex; align-items: center; gap: 0.75rem;">
                <div class="chat-contact-avatar">
                  {{ getInitials(selectedContact.name) }}
                </div>
                <div>
                  <div style="font-weight: 600;">{{ selectedContact.name }}</div>
                  <div class="text-muted" style="font-size: 0.8rem;">{{ getRoleLabel(selectedContact.role) }}</div>
                </div>
              </div>

              <!-- Messages -->
              <div class="chat-messages" ref="messagesContainer">
                <div 
                  v-for="msg in messages" 
                  :key="msg.id"
                  class="chat-message"
                  :class="{ 
                    sent: msg.senderId === authStore.user?.id, 
                    received: msg.senderId !== authStore.user?.id,
                    emergency: msg.isEmergency 
                  }"
                >
                  <div>{{ msg.message }}</div>
                  <div style="font-size: 0.65rem; opacity: 0.7; margin-top: 0.25rem;">
                    {{ formatTime(msg.createdAt) }}
                  </div>
                </div>
              </div>

              <!-- Input -->
              <div class="chat-input-container">
                <input
                  v-model="newMessage"
                  @keyup.enter="sendMessage"
                  type="text"
                  class="chat-input"
                  placeholder="Ketik pesan..."
                />
                <button @click="sendMessage" class="btn btn-primary">
                  ➤
                </button>
              </div>
            </template>

            <div v-else class="flex items-center justify-center h-full text-muted">
              <div class="text-center">
                <div style="font-size: 4rem;">💬</div>
                <p>Pilih kontak untuk memulai percakapan</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import api from '../../services/api'
import { initSocket, getSocket, disconnectSocket } from '../../services/socket'
import { useAuthStore } from '../../stores/auth'
import Sidebar from '../../components/common/Sidebar.vue'
import TopHeader from '../../components/common/TopHeader.vue'

const authStore = useAuthStore()

const contacts = ref([])
const selectedContact = ref(null)
const messages = ref([])
const newMessage = ref('')
const messagesContainer = ref(null)

const getInitials = (name) => {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const getRoleLabel = (role) => {
  const labels = { patient: 'Pasien', doctor: 'Dokter', nurse: 'Perawat', admin: 'Admin' }
  return labels[role] || role
}

const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

const selectContact = async (contact) => {
  selectedContact.value = contact
  try {
    const res = await api.get(`/chat/conversation/${contact.id}`)
    messages.value = res.data
    contact.unreadCount = 0
    await nextTick()
    scrollToBottom()
  } catch (error) {
    console.error('Error fetching conversation:', error)
  }
}

const sendMessage = async () => {
  if (!newMessage.value.trim() || !selectedContact.value) return

  try {
    const res = await api.post('/chat/send', {
      receiverId: selectedContact.value.id,
      message: newMessage.value
    })
    messages.value.push(res.data.chatMessage)
    newMessage.value = ''
    await nextTick()
    scrollToBottom()
  } catch (error) {
    console.error('Error sending message:', error)
  }
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

onMounted(async () => {
  // Fetch contacts
  try {
    const res = await api.get('/chat/contacts')
    contacts.value = res.data
  } catch (error) {
    console.error('Error fetching contacts:', error)
  }

  // Initialize socket
  const token = localStorage.getItem('token')
  if (token) {
    const socket = initSocket(token)
    
    socket.on('new_message', (message) => {
      if (selectedContact.value?.id === message.senderId) {
        messages.value.push(message)
        nextTick(scrollToBottom)
      } else {
        const contact = contacts.value.find(c => c.id === message.senderId)
        if (contact) contact.unreadCount++
      }
    })
  }
})
</script>
