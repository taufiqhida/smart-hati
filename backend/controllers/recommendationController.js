const prisma = require('../lib/prisma');
const { generateRecommendationPDF } = require('../utils/pdfGenerator');

// Create recommendation (Doctor only)
exports.createRecommendation = async (req, res) => {
    try {
        const { patientId, type, title, description } = req.body;

        if (!patientId || !type || !title) {
            return res.status(400).json({ message: 'ID pasien, tipe, dan judul harus diisi.' });
        }

        const patient = await prisma.user.findUnique({ where: { id: parseInt(patientId) } });
        if (!patient || patient.role !== 'patient') {
            return res.status(404).json({ message: 'Pasien tidak ditemukan.' });
        }

        const recommendation = await prisma.recommendation.create({
            data: {
                patientId: parseInt(patientId),
                doctorId: req.user.id,
                type,
                title,
                description
            },
            include: {
                doctor: { select: { id: true, name: true } },
                patient: { select: { id: true, name: true, nik: true } }
            }
        });

        // Create notification for patient
        await prisma.notification.create({
            data: {
                userId: parseInt(patientId),
                type: 'new_recommendation',
                title: 'Rekomendasi Baru',
                message: `Dr. ${req.user.name} memberikan rekomendasi: ${title}`
            }
        });

        res.status(201).json({
            message: 'Rekomendasi berhasil dibuat.',
            recommendation
        });
    } catch (error) {
        console.error('CreateRecommendation error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
};

// Get recommendations for patient
exports.getRecommendations = async (req, res) => {
    try {
        const patientId = req.params.patientId || req.user.id;
        const { type } = req.query;

        if (req.user.role === 'patient' && req.user.id !== parseInt(patientId)) {
            return res.status(403).json({ message: 'Tidak memiliki akses.' });
        }

        const where = { patientId: parseInt(patientId) };
        if (type) where.type = type;

        const recommendations = await prisma.recommendation.findMany({
            where,
            include: {
                doctor: { select: { id: true, name: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(recommendations);
    } catch (error) {
        console.error('GetRecommendations error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
};

// Delete recommendation
exports.deleteRecommendation = async (req, res) => {
    try {
        const { id } = req.params;

        const recommendation = await prisma.recommendation.findUnique({ where: { id: parseInt(id) } });
        if (!recommendation) {
            return res.status(404).json({ message: 'Rekomendasi tidak ditemukan.' });
        }

        // Only doctor who created or admin can delete
        if (req.user.role !== 'admin' && recommendation.doctorId !== req.user.id) {
            return res.status(403).json({ message: 'Tidak memiliki akses.' });
        }

        await prisma.recommendation.delete({ where: { id: parseInt(id) } });

        res.json({ message: 'Rekomendasi berhasil dihapus.' });
    } catch (error) {
        console.error('DeleteRecommendation error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
};

// Download recommendations as PDF
exports.downloadRecommendationsPDF = async (req, res) => {
    try {
        const patientId = req.params.patientId || req.user.id;

        if (req.user.role === 'patient' && req.user.id !== parseInt(patientId)) {
            return res.status(403).json({ message: 'Tidak memiliki akses.' });
        }

        const patient = await prisma.user.findUnique({ where: { id: parseInt(patientId) } });
        const recommendations = await prisma.recommendation.findMany({
            where: { patientId: parseInt(patientId) },
            include: { doctor: { select: { name: true } } },
            orderBy: { createdAt: 'desc' }
        });

        if (recommendations.length === 0) {
            return res.status(404).json({ message: 'Tidak ada rekomendasi.' });
        }

        const doctor = recommendations[0].doctor;
        const pdfBuffer = await generateRecommendationPDF(recommendations, patient, doctor);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=rekomendasi_${patient.nik}.pdf`);
        res.send(pdfBuffer);
    } catch (error) {
        console.error('DownloadRecommendationsPDF error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
};
