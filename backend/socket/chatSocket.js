const prisma = require('../lib/prisma');
const jwt = require('jsonwebtoken');

// Store online users
const onlineUsers = new Map();

const initializeSocket = (io) => {
    // Authentication middleware for socket
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error('Authentication required'));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await prisma.user.findUnique({
                where: { id: decoded.id }
            });

            if (!user) {
                return next(new Error('User not found'));
            }

            socket.user = user;
            next();
        } catch (error) {
            next(new Error('Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.user.name} (${socket.user.role})`);

        // Add user to online users
        onlineUsers.set(socket.user.id, socket.id);

        // Join user to their own room
        socket.join(`user_${socket.user.id}`);

        // Emit online status
        io.emit('user_online', { userId: socket.user.id });

        // Handle private message
        socket.on('private_message', async (data) => {
            const { receiverId, message } = data;

            try {
                // Check for emergency keywords
                const emergencyKeywords = ['darurat', 'tolong', 'help', 'emergency', 'sesak', 'pingsan'];
                const isEmergency = emergencyKeywords.some(kw =>
                    message.toLowerCase().includes(kw)
                );

                // Save message to database
                const chatMessage = await prisma.chatMessage.create({
                    data: {
                        senderId: socket.user.id,
                        receiverId: parseInt(receiverId),
                        message,
                        isEmergency
                    },
                    include: {
                        sender: { select: { id: true, name: true, role: true } }
                    }
                });

                // Emit to receiver
                const receiverSocketId = onlineUsers.get(parseInt(receiverId));
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit('new_message', chatMessage);
                }

                // If emergency, notify all doctors
                if (isEmergency) {
                    const doctors = await prisma.user.findMany({ where: { role: 'doctor' } });
                    doctors.forEach(doctor => {
                        const doctorSocketId = onlineUsers.get(doctor.id);
                        if (doctorSocketId) {
                            io.to(doctorSocketId).emit('emergency_alert', {
                                patient: socket.user,
                                message: chatMessage
                            });
                        }
                    });
                }

                // Confirm to sender
                socket.emit('message_sent', chatMessage);
            } catch (error) {
                console.error('Error sending message:', error);
                socket.emit('message_error', { error: 'Failed to send message' });
            }
        });

        // Handle typing status
        socket.on('typing', (data) => {
            const receiverSocketId = onlineUsers.get(parseInt(data.receiverId));
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('user_typing', {
                    userId: socket.user.id,
                    name: socket.user.name
                });
            }
        });

        socket.on('stop_typing', (data) => {
            const receiverSocketId = onlineUsers.get(parseInt(data.receiverId));
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('user_stop_typing', {
                    userId: socket.user.id
                });
            }
        });

        // Handle disconnect
        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.user.name}`);
            onlineUsers.delete(socket.user.id);
            io.emit('user_offline', { userId: socket.user.id });
        });
    });

    return io;
};

module.exports = { initializeSocket, onlineUsers };
