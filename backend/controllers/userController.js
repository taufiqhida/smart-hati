const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');

// Get all users (Admin only)
exports.getAllUsers = async (req, res) => {
    try {
        const { role, search } = req.query;

        const where = {};
        if (role) where.role = role;
        if (search) {
            where.OR = [
                { name: { contains: search } },
                { nik: { contains: search } },
                { email: { contains: search } }
            ];
        }

        const users = await prisma.user.findMany({
            where,
            include: { profile: true },
            orderBy: { createdAt: 'desc' }
        });

        const usersWithoutPassword = users.map(user => {
            const { password: _, ...rest } = user;
            return rest;
        });

        res.json(usersWithoutPassword);
    } catch (error) {
        console.error('GetAllUsers error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
};

// Get user by ID
exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await prisma.user.findUnique({
            where: { id: parseInt(id) },
            include: { profile: true }
        });

        if (!user) {
            return res.status(404).json({ message: 'User tidak ditemukan.' });
        }

        const { password: _, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    } catch (error) {
        console.error('GetUserById error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
};

// Create user (Admin only)
exports.createUser = async (req, res) => {
    try {
        const { nik, name, email, password, role, phone, birthDate, gender, address } = req.body;

        if (!nik || !name || !password) {
            return res.status(400).json({ message: 'NIK, nama, dan password harus diisi.' });
        }

        // Check if NIK exists
        const existingUser = await prisma.user.findUnique({ where: { nik } });
        if (existingUser) {
            return res.status(400).json({ message: 'NIK sudah terdaftar.' });
        }

        // Check if email exists (if provided)
        if (email) {
            const existingEmail = await prisma.user.findUnique({ where: { email } });
            if (existingEmail) {
                return res.status(400).json({ message: 'Email sudah terdaftar.' });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                nik,
                name,
                email,
                password: hashedPassword,
                role: role || 'patient',
                phone,
                birthDate: birthDate ? new Date(birthDate) : null,
                gender,
                address
            }
        });

        // Create patient profile if role is patient
        if (user.role === 'patient') {
            await prisma.patientProfile.create({
                data: { userId: user.id }
            });
        }

        const { password: _, ...userWithoutPassword } = user;
        res.status(201).json({
            message: 'User berhasil dibuat.',
            user: userWithoutPassword
        });
    } catch (error) {
        console.error('CreateUser error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
};

// Update user
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, birthDate, gender, address, role } = req.body;

        const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });
        if (!user) {
            return res.status(404).json({ message: 'User tidak ditemukan.' });
        }

        // Check authorization
        if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
            return res.status(403).json({ message: 'Tidak memiliki akses.' });
        }

        const updatedUser = await prisma.user.update({
            where: { id: parseInt(id) },
            data: {
                name: name || user.name,
                email: email || user.email,
                phone: phone || user.phone,
                birthDate: birthDate ? new Date(birthDate) : user.birthDate,
                gender: gender || user.gender,
                address: address || user.address,
                role: req.user.role === 'admin' ? (role || user.role) : user.role
            },
            include: { profile: true }
        });

        const { password: _, ...userWithoutPassword } = updatedUser;
        res.json({
            message: 'User berhasil diupdate.',
            user: userWithoutPassword
        });
    } catch (error) {
        console.error('UpdateUser error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
};

// Delete user (Admin only)
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });
        if (!user) {
            return res.status(404).json({ message: 'User tidak ditemukan.' });
        }

        await prisma.user.delete({ where: { id: parseInt(id) } });

        res.json({ message: 'User berhasil dihapus.' });
    } catch (error) {
        console.error('DeleteUser error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
};

// Update patient profile
exports.updatePatientProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            age, weight, height, hereditaryHistory,
            comorbidities, lifestyle, stressLevel, dietPattern
        } = req.body;

        // Check authorization
        if (req.user.role !== 'admin' && req.user.role !== 'nurse' && req.user.id !== parseInt(id)) {
            return res.status(403).json({ message: 'Tidak memiliki akses.' });
        }

        let profile = await prisma.patientProfile.findUnique({
            where: { userId: parseInt(id) }
        });

        if (!profile) {
            // Create profile if not exists
            profile = await prisma.patientProfile.create({
                data: {
                    userId: parseInt(id),
                    age, weight, height, hereditaryHistory,
                    comorbidities, lifestyle, stressLevel, dietPattern
                }
            });
        } else {
            profile = await prisma.patientProfile.update({
                where: { userId: parseInt(id) },
                data: {
                    age: age ?? profile.age,
                    weight: weight ?? profile.weight,
                    height: height ?? profile.height,
                    hereditaryHistory: hereditaryHistory ?? profile.hereditaryHistory,
                    comorbidities: comorbidities ?? profile.comorbidities,
                    lifestyle: lifestyle ?? profile.lifestyle,
                    stressLevel: stressLevel ?? profile.stressLevel,
                    dietPattern: dietPattern ?? profile.dietPattern
                }
            });
        }

        res.json({
            message: 'Profil pasien berhasil diupdate.',
            profile
        });
    } catch (error) {
        console.error('UpdatePatientProfile error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
};

// Get all patients (Doctor/Nurse/Admin)
exports.getPatients = async (req, res) => {
    try {
        const patients = await prisma.user.findMany({
            where: { role: 'patient' },
            include: {
                profile: true,
                bloodPressureRecords: {
                    orderBy: { recordedAt: 'desc' },
                    take: 1
                }
            },
            orderBy: { name: 'asc' }
        });

        const patientsWithoutPassword = patients.map(p => {
            const { password: _, ...rest } = p;
            return rest;
        });

        res.json(patientsWithoutPassword);
    } catch (error) {
        console.error('GetPatients error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
};

// Get high risk patients (Doctor/Admin)
exports.getHighRiskPatients = async (req, res) => {
    try {
        // Get patients with recent crisis or hypertension_2 records
        const highRiskRecords = await prisma.bloodPressureRecord.findMany({
            where: {
                classification: { in: ['crisis', 'hypertension_2'] },
                recordedAt: {
                    gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
                }
            },
            include: {
                patient: {
                    include: { profile: true }
                }
            },
            orderBy: { recordedAt: 'desc' }
        });

        // Get unique patients
        const patientMap = new Map();
        highRiskRecords.forEach(record => {
            if (!patientMap.has(record.patientId)) {
                const { password: _, ...patientWithoutPassword } = record.patient;
                patientMap.set(record.patientId, {
                    ...patientWithoutPassword,
                    latestRecord: {
                        systolic: record.systolic,
                        diastolic: record.diastolic,
                        classification: record.classification,
                        recordedAt: record.recordedAt
                    }
                });
            }
        });

        res.json(Array.from(patientMap.values()));
    } catch (error) {
        console.error('GetHighRiskPatients error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
};
