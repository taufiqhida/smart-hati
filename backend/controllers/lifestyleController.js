const prisma = require('../lib/prisma');

// Create or update daily lifestyle record
exports.createOrUpdateDaily = async (req, res) => {
    try {
        const patientId = req.user.id;
        const {
            date, breakfast, lunch, dinner, snacks, waterIntake,
            stressLevel, stressNotes, activityLevel, activities, exerciseMinutes
        } = req.body;

        // Parse date as UTC to avoid timezone issues
        const [year, month, day] = date.split('-').map(Number);
        const recordDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));

        // Use upsert for atomic create or update
        const record = await prisma.dailyLifestyle.upsert({
            where: {
                patientId_date: {
                    patientId,
                    date: recordDate
                }
            },
            update: {
                breakfast: breakfast || null,
                lunch: lunch || null,
                dinner: dinner || null,
                snacks: snacks || null,
                waterIntake: waterIntake ? parseInt(waterIntake) : null,
                stressLevel: stressLevel || 'low',
                stressNotes: stressNotes || null,
                activityLevel: activityLevel || 'sedentary',
                activities: activities || null,
                exerciseMinutes: exerciseMinutes ? parseInt(exerciseMinutes) : null
            },
            create: {
                patientId,
                date: recordDate,
                breakfast: breakfast || null,
                lunch: lunch || null,
                dinner: dinner || null,
                snacks: snacks || null,
                waterIntake: waterIntake ? parseInt(waterIntake) : null,
                stressLevel: stressLevel || 'low',
                stressNotes: stressNotes || null,
                activityLevel: activityLevel || 'sedentary',
                activities: activities || null,
                exerciseMinutes: exerciseMinutes ? parseInt(exerciseMinutes) : null
            }
        });

        res.status(200).json({
            message: 'Data gaya hidup berhasil disimpan.',
            record
        });
    } catch (error) {
        console.error('CreateOrUpdateDaily error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server.', error: error.message });
    }
};

// Get my lifestyle history
exports.getMyHistory = async (req, res) => {
    try {
        const patientId = req.user.id;
        const { limit = 7 } = req.query;

        const records = await prisma.dailyLifestyle.findMany({
            where: { patientId },
            orderBy: { date: 'desc' },
            take: parseInt(limit)
        });

        res.json(records);
    } catch (error) {
        console.error('GetMyHistory error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
};

// Get daily record by date
exports.getDailyByDate = async (req, res) => {
    try {
        const patientId = req.user.id;
        const { date } = req.params;

        // Parse date as UTC to match createOrUpdateDaily
        const [year, month, day] = date.split('-').map(Number);
        const recordDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));

        const record = await prisma.dailyLifestyle.findUnique({
            where: {
                patientId_date: {
                    patientId,
                    date: recordDate
                }
            }
        });

        if (!record) {
            return res.status(404).json({ message: 'Data tidak ditemukan.' });
        }

        res.json(record);
    } catch (error) {
        console.error('GetDailyByDate error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
};

// Get patient lifestyle history (for doctor/nurse)
exports.getPatientHistory = async (req, res) => {
    try {
        const { patientId } = req.params;
        const { limit = 30 } = req.query;

        // Only doctor, nurse, admin can access
        if (!['doctor', 'nurse', 'admin'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Tidak memiliki akses.' });
        }

        const records = await prisma.dailyLifestyle.findMany({
            where: { patientId: parseInt(patientId) },
            orderBy: { date: 'desc' },
            take: parseInt(limit),
            include: {
                patient: {
                    select: { id: true, name: true, nik: true }
                }
            }
        });

        res.json(records);
    } catch (error) {
        console.error('GetPatientHistory error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
};
