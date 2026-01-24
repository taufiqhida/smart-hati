const prisma = require('../lib/prisma');
const { generatePrescriptionPDF } = require('../utils/pdfGenerator');

// Create prescription (Doctor only)
exports.createPrescription = async (req, res) => {
    try {
        const { patientId, medicationName, dosage, frequency, duration, notes } = req.body;

        if (!patientId || !medicationName || !dosage || !frequency) {
            return res.status(400).json({
                message: 'ID pasien, nama obat, dosis, dan frekuensi harus diisi.'
            });
        }

        const patient = await prisma.user.findUnique({ where: { id: parseInt(patientId) } });
        if (!patient || patient.role !== 'patient') {
            return res.status(404).json({ message: 'Pasien tidak ditemukan.' });
        }

        const prescription = await prisma.prescription.create({
            data: {
                patientId: parseInt(patientId),
                doctorId: req.user.id,
                medicationName,
                dosage,
                frequency,
                duration,
                notes
            },
            include: {
                doctor: { select: { id: true, name: true } },
                patient: { select: { id: true, name: true, nik: true } }
            }
        });

        // Create notification and reminder for patient
        await prisma.notification.create({
            data: {
                userId: parseInt(patientId),
                type: 'new_prescription',
                title: 'Resep Baru',
                message: `Dr. ${req.user.name} memberikan resep: ${medicationName}`
            }
        });

        // Create medication reminder
        await prisma.reminder.create({
            data: {
                patientId: parseInt(patientId),
                type: 'medication',
                title: `Minum obat: ${medicationName}`,
                description: `Dosis: ${dosage}, Frekuensi: ${frequency}`,
                scheduledAt: new Date()
            }
        });

        res.status(201).json({
            message: 'Resep berhasil dibuat.',
            prescription
        });
    } catch (error) {
        console.error('CreatePrescription error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
};

// Get prescriptions for patient
exports.getPrescriptions = async (req, res) => {
    try {
        const patientId = req.params.patientId || req.user.id;

        if (req.user.role === 'patient' && req.user.id !== parseInt(patientId)) {
            return res.status(403).json({ message: 'Tidak memiliki akses.' });
        }

        const prescriptions = await prisma.prescription.findMany({
            where: { patientId: parseInt(patientId) },
            include: {
                doctor: { select: { id: true, name: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(prescriptions);
    } catch (error) {
        console.error('GetPrescriptions error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
};

// Download prescription as PDF
exports.downloadPrescriptionPDF = async (req, res) => {
    try {
        const { id } = req.params;

        const prescription = await prisma.prescription.findUnique({
            where: { id: parseInt(id) },
            include: {
                patient: true,
                doctor: true
            }
        });

        if (!prescription) {
            return res.status(404).json({ message: 'Resep tidak ditemukan.' });
        }

        // Check access
        if (req.user.role === 'patient' && prescription.patientId !== req.user.id) {
            return res.status(403).json({ message: 'Tidak memiliki akses.' });
        }

        const pdfBuffer = await generatePrescriptionPDF(
            prescription,
            prescription.patient,
            prescription.doctor
        );

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=resep_${prescription.id}.pdf`);
        res.send(pdfBuffer);
    } catch (error) {
        console.error('DownloadPrescriptionPDF error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
};

// Delete prescription
exports.deletePrescription = async (req, res) => {
    try {
        const { id } = req.params;

        const prescription = await prisma.prescription.findUnique({ where: { id: parseInt(id) } });
        if (!prescription) {
            return res.status(404).json({ message: 'Resep tidak ditemukan.' });
        }

        if (req.user.role !== 'admin' && prescription.doctorId !== req.user.id) {
            return res.status(403).json({ message: 'Tidak memiliki akses.' });
        }

        await prisma.prescription.delete({ where: { id: parseInt(id) } });

        res.json({ message: 'Resep berhasil dihapus.' });
    } catch (error) {
        console.error('DeletePrescription error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
};
