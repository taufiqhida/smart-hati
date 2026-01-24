const prisma = require('../lib/prisma');
const { classifyBloodPressure } = require('../utils/classification');

// Create blood pressure record
exports.createRecord = async (req, res) => {
    try {
        const { patientId, systolic, diastolic, pulse, notes } = req.body;

        if (!systolic || !diastolic) {
            return res.status(400).json({ message: 'Sistolik dan diastolik harus diisi.' });
        }

        // Determine patient ID and input source
        let targetPatientId = patientId;
        let inputBy = 'patient';
        let nurseId = null;

        if (req.user.role === 'nurse') {
            if (!patientId) {
                return res.status(400).json({ message: 'ID pasien harus diisi.' });
            }
            inputBy = 'nurse';
            nurseId = req.user.id;
        } else if (req.user.role === 'patient') {
            targetPatientId = req.user.id;
        }

        // Classify blood pressure
        const classificationResult = classifyBloodPressure(systolic, diastolic);

        const record = await prisma.bloodPressureRecord.create({
            data: {
                patientId: parseInt(targetPatientId),
                systolic,
                diastolic,
                pulse,
                classification: classificationResult.classification,
                inputBy,
                nurseId,
                notes
            },
            include: {
                patient: { select: { id: true, name: true, nik: true } },
                nurse: { select: { id: true, name: true } }
            }
        });

        // If crisis, create notification for doctors
        if (classificationResult.isEmergency) {
            const doctors = await prisma.user.findMany({
                where: { role: 'doctor' }
            });

            const patient = await prisma.user.findUnique({
                where: { id: parseInt(targetPatientId) }
            });

            await prisma.notification.createMany({
                data: doctors.map(doctor => ({
                    userId: doctor.id,
                    type: 'crisis_alert',
                    title: '🚨 KRISIS HIPERTENSI',
                    message: `Pasien ${patient.name} (${patient.nik}) memiliki tekanan darah ${systolic}/${diastolic}. Segera ditangani!`
                }))
            });
        }

        res.status(201).json({
            message: 'Data tekanan darah berhasil disimpan.',
            record,
            classification: classificationResult
        });
    } catch (error) {
        console.error('CreateRecord error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
};

// Get records for a patient
exports.getRecords = async (req, res) => {
    try {
        const { patientId } = req.params;
        const { startDate, endDate, limit, inputBy } = req.query;

        // Check authorization
        const targetPatientId = patientId || req.user.id;
        if (req.user.role === 'patient' && req.user.id !== parseInt(targetPatientId)) {
            return res.status(403).json({ message: 'Tidak memiliki akses.' });
        }

        const where = { patientId: parseInt(targetPatientId) };

        if (startDate || endDate) {
            where.recordedAt = {};
            if (startDate) where.recordedAt.gte = new Date(startDate);
            if (endDate) where.recordedAt.lte = new Date(endDate);
        }

        if (inputBy) {
            where.inputBy = inputBy;
        }

        const records = await prisma.bloodPressureRecord.findMany({
            where,
            include: {
                nurse: { select: { id: true, name: true } }
            },
            orderBy: { recordedAt: 'desc' },
            take: limit ? parseInt(limit) : undefined
        });

        // Add classification details to each record
        const recordsWithDetails = records.map(record => ({
            ...record,
            classificationDetails: classifyBloodPressure(record.systolic, record.diastolic)
        }));

        res.json(recordsWithDetails);
    } catch (error) {
        console.error('GetRecords error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
};

// Get latest record
exports.getLatestRecord = async (req, res) => {
    try {
        const patientId = req.params.patientId || req.user.id;

        if (req.user.role === 'patient' && req.user.id !== parseInt(patientId)) {
            return res.status(403).json({ message: 'Tidak memiliki akses.' });
        }

        const record = await prisma.bloodPressureRecord.findFirst({
            where: { patientId: parseInt(patientId) },
            orderBy: { recordedAt: 'desc' }
        });

        if (!record) {
            return res.status(404).json({ message: 'Belum ada data tekanan darah.' });
        }

        res.json({
            ...record,
            classificationDetails: classifyBloodPressure(record.systolic, record.diastolic)
        });
    } catch (error) {
        console.error('GetLatestRecord error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
};

// Get statistics
exports.getStatistics = async (req, res) => {
    try {
        const patientId = req.params.patientId || req.user.id;

        if (req.user.role === 'patient' && req.user.id !== parseInt(patientId)) {
            return res.status(403).json({ message: 'Tidak memiliki akses.' });
        }

        // Get records from last 30 days
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        const records = await prisma.bloodPressureRecord.findMany({
            where: {
                patientId: parseInt(patientId),
                recordedAt: { gte: thirtyDaysAgo }
            },
            orderBy: { recordedAt: 'asc' }
        });

        if (records.length === 0) {
            return res.json({
                totalRecords: 0,
                averageSystolic: 0,
                averageDiastolic: 0,
                minSystolic: 0,
                maxSystolic: 0,
                minDiastolic: 0,
                maxDiastolic: 0,
                classificationCounts: {}
            });
        }

        const systolicValues = records.map(r => r.systolic);
        const diastolicValues = records.map(r => r.diastolic);

        const classificationCounts = records.reduce((acc, r) => {
            acc[r.classification] = (acc[r.classification] || 0) + 1;
            return acc;
        }, {});

        res.json({
            totalRecords: records.length,
            averageSystolic: Math.round(systolicValues.reduce((a, b) => a + b, 0) / records.length),
            averageDiastolic: Math.round(diastolicValues.reduce((a, b) => a + b, 0) / records.length),
            minSystolic: Math.min(...systolicValues),
            maxSystolic: Math.max(...systolicValues),
            minDiastolic: Math.min(...diastolicValues),
            maxDiastolic: Math.max(...diastolicValues),
            classificationCounts,
            chartData: records.map(r => ({
                date: r.recordedAt,
                systolic: r.systolic,
                diastolic: r.diastolic,
                classification: r.classification
            }))
        });
    } catch (error) {
        console.error('GetStatistics error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
};

// Delete record (Admin only)
exports.deleteRecord = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.bloodPressureRecord.delete({
            where: { id: parseInt(id) }
        });

        res.json({ message: 'Data berhasil dihapus.' });
    } catch (error) {
        console.error('DeleteRecord error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
};

// Get today's records count (for nurse dashboard)
exports.getTodayCount = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const count = await prisma.bloodPressureRecord.count({
            where: {
                recordedAt: {
                    gte: today,
                    lt: tomorrow
                }
            }
        });

        // Count by nurse
        const byNurse = await prisma.bloodPressureRecord.count({
            where: {
                recordedAt: {
                    gte: today,
                    lt: tomorrow
                },
                inputBy: 'nurse'
            }
        });

        res.json({
            totalToday: count,
            byNurse,
            byPatient: count - byNurse
        });
    } catch (error) {
        console.error('GetTodayCount error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
};
