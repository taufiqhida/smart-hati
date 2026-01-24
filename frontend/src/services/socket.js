import { io } from 'socket.io-client'

let socket = null

export const initSocket = (token) => {
    if (socket) {
        socket.disconnect()
    }

    socket = io(import.meta.env.VITE_API_URL || 'http://localhost:6001', {
        auth: { token }
    })

    socket.on('connect', () => {
        console.log('Socket connected')
    })

    socket.on('disconnect', () => {
        console.log('Socket disconnected')
    })

    socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error.message)
    })

    return socket
}

export const getSocket = () => socket

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect()
        socket = null
    }
}

export default { initSocket, getSocket, disconnectSocket }
