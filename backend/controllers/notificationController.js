const prisma = require('../lib/prisma');

// Get notifications
exports.getNotifications = async (req, res) => {
    try {
        const { unreadOnly, limit = 50 } = req.query;

        const where = { userId: req.user.id };
        if (unreadOnly === 'true') {
            where.isRead = false;
        }

        const notifications = await prisma.notification.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: parseInt(limit)
        });

        res.json(notifications);
    } catch (error) {
        console.error('GetNotifications error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;

        const notification = await prisma.notification.findUnique({
            where: { id: parseInt(id) }
        });

        if (!notification) {
            return res.status(404).json({ message: 'Notifikasi tidak ditemukan.' });
        }

        if (notification.userId !== req.user.id) {
            return res.status(403).json({ message: 'Tidak memiliki akses.' });
        }

        await prisma.notification.update({
            where: { id: parseInt(id) },
            data: { isRead: true }
        });

        res.json({ message: 'Notifikasi ditandai sudah dibaca.' });
    } catch (error) {
        console.error('MarkAsRead error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
};

// Mark all as read
exports.markAllAsRead = async (req, res) => {
    try {
        await prisma.notification.updateMany({
            where: { userId: req.user.id, isRead: false },
            data: { isRead: true }
        });

        res.json({ message: 'Semua notifikasi ditandai sudah dibaca.' });
    } catch (error) {
        console.error('MarkAllAsRead error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
};

// Get unread count
exports.getUnreadCount = async (req, res) => {
    try {
        const count = await prisma.notification.count({
            where: { userId: req.user.id, isRead: false }
        });

        res.json({ unreadCount: count });
    } catch (error) {
        console.error('GetUnreadCount error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;

        const notification = await prisma.notification.findUnique({
            where: { id: parseInt(id) }
        });

        if (!notification) {
            return res.status(404).json({ message: 'Notifikasi tidak ditemukan.' });
        }

        if (notification.userId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Tidak memiliki akses.' });
        }

        await prisma.notification.delete({ where: { id: parseInt(id) } });

        res.json({ message: 'Notifikasi berhasil dihapus.' });
    } catch (error) {
        console.error('DeleteNotification error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
};

// Get reminders
exports.getReminders = async (req, res) => {
    try {
        const patientId = req.params.patientId || req.user.id;
        const { upcoming, completed } = req.query;

        if (req.user.role === 'patient' && req.user.id !== parseInt(patientId)) {
            return res.status(403).json({ message: 'Tidak memiliki akses.' });
        }

        const where = { patientId: parseInt(patientId) };

        if (upcoming === 'true') {
            where.scheduledAt = { gte: new Date() };
            where.isCompleted = false;
        }

        if (completed === 'true') {
            where.isCompleted = true;
        }

        const reminders = await prisma.reminder.findMany({
            where,
            orderBy: { scheduledAt: 'asc' }
        });

        res.json(reminders);
    } catch (error) {
        console.error('GetReminders error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
};

// Create reminder
exports.createReminder = async (req, res) => {
    try {
        const { patientId, type, title, description, scheduledAt } = req.body;

        const targetPatientId = patientId || req.user.id;

        // Only staff can create reminders for others
        if (req.user.role === 'patient' && req.user.id !== parseInt(targetPatientId)) {
            return res.status(403).json({ message: 'Tidak memiliki akses.' });
        }

        const reminder = await prisma.reminder.create({
            data: {
                patientId: parseInt(targetPatientId),
                type,
                title,
                description,
                scheduledAt: new Date(scheduledAt)
            }
        });

        res.status(201).json({
            message: 'Reminder berhasil dibuat.',
            reminder
        });
    } catch (error) {
        console.error('CreateReminder error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
};

// Mark reminder as completed
exports.completeReminder = async (req, res) => {
    try {
        const { id } = req.params;

        const reminder = await prisma.reminder.findUnique({ where: { id: parseInt(id) } });
        if (!reminder) {
            return res.status(404).json({ message: 'Reminder tidak ditemukan.' });
        }

        if (req.user.role === 'patient' && reminder.patientId !== req.user.id) {
            return res.status(403).json({ message: 'Tidak memiliki akses.' });
        }

        await prisma.reminder.update({
            where: { id: parseInt(id) },
            data: { isCompleted: true }
        });

        res.json({ message: 'Reminder selesai.' });
    } catch (error) {
        console.error('CompleteReminder error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
};
