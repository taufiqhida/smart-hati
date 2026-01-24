const prisma = require('../lib/prisma');

// Emergency keywords detection
const EMERGENCY_KEYWORDS = [
    'darurat', 'emergency', 'tolong', 'help', 'sesak', 'pingsan',
    'nyeri dada', 'tidak sadar', 'stroke', 'serangan jantung',
    'pusing parah', 'muntah darah', 'kejang'
];

const checkEmergency = (message) => {
    const lowerMessage = message.toLowerCase();
    return EMERGENCY_KEYWORDS.some(keyword => lowerMessage.includes(keyword));
};

// Send message
exports.sendMessage = async (req, res) => {
    try {
        const { receiverId, message } = req.body;

        if (!receiverId || !message) {
            return res.status(400).json({ message: 'Penerima dan pesan harus diisi.' });
        }

        const receiver = await prisma.user.findUnique({ where: { id: parseInt(receiverId) } });
        if (!receiver) {
            return res.status(404).json({ message: 'Penerima tidak ditemukan.' });
        }

        const isEmergency = checkEmergency(message);

        const chatMessage = await prisma.chatMessage.create({
            data: {
                senderId: req.user.id,
                receiverId: parseInt(receiverId),
                message,
                isEmergency
            },
            include: {
                sender: { select: { id: true, name: true, role: true } },
                receiver: { select: { id: true, name: true, role: true } }
            }
        });

        // If emergency, notify all doctors
        if (isEmergency) {
            const doctors = await prisma.user.findMany({ where: { role: 'doctor' } });

            await prisma.notification.createMany({
                data: doctors.map(doctor => ({
                    userId: doctor.id,
                    type: 'emergency_chat',
                    title: '🚨 PESAN DARURAT',
                    message: `${req.user.name} mengirim pesan darurat: "${message.substring(0, 50)}..."`
                }))
            });
        }

        // Create notification for receiver
        await prisma.notification.create({
            data: {
                userId: parseInt(receiverId),
                type: 'new_message',
                title: isEmergency ? '🚨 Pesan Darurat' : 'Pesan Baru',
                message: `${req.user.name}: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`
            }
        });

        res.status(201).json({
            message: 'Pesan berhasil dikirim.',
            chatMessage
        });
    } catch (error) {
        console.error('SendMessage error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
};

// Get conversation between two users
exports.getConversation = async (req, res) => {
    try {
        const { partnerId } = req.params;
        const { limit = 50, before } = req.query;

        const where = {
            OR: [
                { senderId: req.user.id, receiverId: parseInt(partnerId) },
                { senderId: parseInt(partnerId), receiverId: req.user.id }
            ]
        };

        if (before) {
            where.createdAt = { lt: new Date(before) };
        }

        const messages = await prisma.chatMessage.findMany({
            where,
            include: {
                sender: { select: { id: true, name: true, role: true } },
                receiver: { select: { id: true, name: true, role: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: parseInt(limit)
        });

        // Mark messages as read
        await prisma.chatMessage.updateMany({
            where: {
                senderId: parseInt(partnerId),
                receiverId: req.user.id,
                readAt: null
            },
            data: { readAt: new Date() }
        });

        res.json(messages.reverse());
    } catch (error) {
        console.error('GetConversation error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
};

// Get chat contacts (users user can chat with)
exports.getChatContacts = async (req, res) => {
    try {
        let contacts;

        if (req.user.role === 'patient') {
            // Patients can chat with doctors and nurses
            contacts = await prisma.user.findMany({
                where: { role: { in: ['doctor', 'nurse'] } },
                select: { id: true, name: true, role: true, phone: true }
            });
        } else if (req.user.role === 'nurse' || req.user.role === 'doctor') {
            // Staff can chat with patients and each other
            contacts = await prisma.user.findMany({
                where: {
                    id: { not: req.user.id }
                },
                select: { id: true, name: true, role: true, phone: true }
            });
        } else {
            // Admin can see everyone
            contacts = await prisma.user.findMany({
                where: { id: { not: req.user.id } },
                select: { id: true, name: true, role: true, phone: true }
            });
        }

        // Get unread count for each contact
        const contactsWithUnread = await Promise.all(
            contacts.map(async (contact) => {
                const unreadCount = await prisma.chatMessage.count({
                    where: {
                        senderId: contact.id,
                        receiverId: req.user.id,
                        readAt: null
                    }
                });
                return { ...contact, unreadCount };
            })
        );

        res.json(contactsWithUnread);
    } catch (error) {
        console.error('GetChatContacts error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
};

// Get unread messages count
exports.getUnreadCount = async (req, res) => {
    try {
        const count = await prisma.chatMessage.count({
            where: {
                receiverId: req.user.id,
                readAt: null
            }
        });

        res.json({ unreadCount: count });
    } catch (error) {
        console.error('GetUnreadCount error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
};
