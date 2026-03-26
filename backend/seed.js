require('dotenv').config();
const bcrypt = require('bcryptjs');
const prisma = require('./lib/prisma');

const ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 10;

async function seed() {
    console.log('🌱 Seeding database...');

    try {
        // Create Admin
        const adminPassword = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD || 'admin123', ROUNDS);
        const admin = await prisma.user.upsert({
            where: { nik: process.env.SEED_ADMIN_NIK || '1234567890123456' },
            update: {},
            create: {
                nik: process.env.SEED_ADMIN_NIK || '1234567890123456',
                name: 'Administrator',
                email: process.env.SEED_ADMIN_EMAIL || 'admin@smarthati.com',
                password: adminPassword,
                role: 'admin',
                phone: process.env.SEED_ADMIN_PHONE || '08123456789',
                gender: 'male'
            }
        });
        console.log('✅ Admin created:', admin.name);

        // Create Doctor
        const doctorPassword = await bcrypt.hash(process.env.SEED_DOCTOR_PASSWORD || 'dokter123', ROUNDS);
        const doctor = await prisma.user.upsert({
            where: { nik: process.env.SEED_DOCTOR_NIK || '2234567890123456' },
            update: {},
            create: {
                nik: process.env.SEED_DOCTOR_NIK || '2234567890123456',
                name: process.env.SEED_DOCTOR_NAME || 'Dr. Budi Hartono, Sp.JP',
                email: process.env.SEED_DOCTOR_EMAIL || 'dr.budi@smarthati.com',
                password: doctorPassword,
                role: 'doctor',
                phone: process.env.SEED_DOCTOR_PHONE || '08234567890',
                gender: 'male'
            }
        });
        console.log('✅ Doctor created:', doctor.name);

        // Create Nurse
        const nursePassword = await bcrypt.hash(process.env.SEED_NURSE_PASSWORD || 'perawat123', ROUNDS);
        const nurse = await prisma.user.upsert({
            where: { nik: process.env.SEED_NURSE_NIK || '3234567890123456' },
            update: {},
            create: {
                nik: process.env.SEED_NURSE_NIK || '3234567890123456',
                name: process.env.SEED_NURSE_NAME || 'Ns. Siti Rahayu, S.Kep',
                email: process.env.SEED_NURSE_EMAIL || 'siti.rahayu@smarthati.com',
                password: nursePassword,
                role: 'nurse',
                phone: process.env.SEED_NURSE_PHONE || '08345678901',
                gender: 'female'
            }
        });
        console.log('✅ Nurse created:', nurse.name);

        // Create Patient
        const patientPassword = await bcrypt.hash(process.env.SEED_PATIENT_PASSWORD || 'pasien123', ROUNDS);
        const patient = await prisma.user.upsert({
            where: { nik: process.env.SEED_PATIENT_NIK || '4234567890123456' },
            update: {},
            create: {
                nik: process.env.SEED_PATIENT_NIK || '4234567890123456',
                name: 'Ahmad Wijaya',
                email: process.env.SEED_PATIENT_EMAIL || 'ahmad.wijaya@email.com',
                password: patientPassword,
                role: 'patient',
                phone: process.env.SEED_PATIENT_PHONE || '08456789012',
                birthDate: new Date('1975-05-15'),
                gender: 'male',
                address: 'Jl. Merdeka No. 123, Jakarta'
            }
        });
        console.log('✅ Patient created:', patient.name);

        // Create Patient Profile
        await prisma.patientProfile.upsert({
            where: { userId: patient.id },
            update: {},
            create: {
                userId: patient.id,
                age: 50,
                weight: 78.5,
                height: 170,
                hereditaryHistory: {
                    fatherHypertension: true,
                    motherHypertension: false,
                    siblingHypertension: false,
                    grandparentHypertension: true,
                    familyStroke: false,
                    familyHeartDisease: true
                },
                comorbidities: {
                    diabetes: false,
                    kidneyDisease: false,
                    heartDisease: false,
                    highCholesterol: true
                },
                lifestyle: {
                    smoking: false,
                    alcohol: false,
                    sedentary: true,
                    highSaltDiet: true
                },
                stressLevel: 'medium',
                dietPattern: 'Makan 3x sehari, jarang mengonsumsi sayur dan buah'
            }
        });
        console.log('✅ Patient profile created');

        // Create sample blood pressure records
        const today = new Date();

        for (let i = 30; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);

            const systolic = 120 + Math.floor(Math.random() * 40);
            const diastolic = 75 + Math.floor(Math.random() * 25);

            let classification;
            if (systolic > 180 || diastolic > 120) classification = 'crisis';
            else if (systolic >= 160 || diastolic >= 100) classification = 'hypertension_2';
            else if (systolic >= 140 || diastolic >= 90) classification = 'hypertension_1';
            else if (systolic >= 120 || diastolic >= 80) classification = 'prehypertension';
            else classification = 'normal';

            await prisma.bloodPressureRecord.create({
                data: {
                    patientId: patient.id,
                    systolic,
                    diastolic,
                    pulse: 60 + Math.floor(Math.random() * 30),
                    classification,
                    inputBy: Math.random() > 0.7 ? 'nurse' : 'patient',
                    nurseId: Math.random() > 0.7 ? nurse.id : null,
                    recordedAt: date
                }
            });
        }
        console.log('✅ Blood pressure records created (31 days)');

        // Create sample recommendations
        await prisma.recommendation.createMany({
            data: [
                {
                    patientId: patient.id,
                    doctorId: doctor.id,
                    type: 'diet',
                    title: 'Diet DASH (Dietary Approaches to Stop Hypertension)',
                    description: 'Tingkatkan konsumsi buah, sayuran, dan biji-bijian. Kurangi garam (maksimal 2.300 mg/hari), lemak jenuh, dan makanan olahan.'
                },
                {
                    patientId: patient.id,
                    doctorId: doctor.id,
                    type: 'exercise',
                    title: 'Olahraga Aerobik Teratur',
                    description: 'Lakukan jalan cepat, bersepeda, atau berenang minimal 30 menit per hari, 5 hari seminggu. Mulai perlahan dan tingkatkan intensitas secara bertahap.'
                },
                {
                    patientId: patient.id,
                    doctorId: doctor.id,
                    type: 'stress_management',
                    title: 'Teknik Relaksasi & Meditasi',
                    description: 'Praktikkan teknik pernapasan dalam, meditasi 10-15 menit setiap hari. Tidur cukup 7-8 jam per malam.'
                }
            ]
        });
        console.log('✅ Recommendations created');

        // Create sample prescription
        await prisma.prescription.create({
            data: {
                patientId: patient.id,
                doctorId: doctor.id,
                medicationName: 'Amlodipine',
                dosage: '5 mg',
                frequency: '1x sehari (pagi)',
                duration: '30 hari',
                notes: 'Diminum setelah makan. Kontrol tekanan darah 2 minggu setelah mulai obat.'
            }
        });
        console.log('✅ Prescription created');

        // Create reminders
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(8, 0, 0, 0);

        await prisma.reminder.createMany({
            data: [
                {
                    patientId: patient.id,
                    type: 'medication',
                    title: 'Minum Amlodipine',
                    description: 'Jangan lupa minum obat Amlodipine 5mg setelah sarapan',
                    scheduledAt: tomorrow
                },
                {
                    patientId: patient.id,
                    type: 'blood_pressure_input',
                    title: 'Catat Tekanan Darah',
                    description: 'Waktu mencatat tekanan darah pagi hari',
                    scheduledAt: tomorrow
                }
            ]
        });
        console.log('✅ Reminders created');

        console.log('\n🎉 Database seeding completed!');
        console.log('\n📋 Login credentials:');
        console.log(`   Admin    : NIK: ${process.env.SEED_ADMIN_NIK || '1234567890123456'} | Password: ${process.env.SEED_ADMIN_PASSWORD || 'admin123'}`);
        console.log(`   Dokter   : NIK: ${process.env.SEED_DOCTOR_NIK || '2234567890123456'} | Password: ${process.env.SEED_DOCTOR_PASSWORD || 'dokter123'}`);
        console.log(`   Perawat  : NIK: ${process.env.SEED_NURSE_NIK || '3234567890123456'} | Password: ${process.env.SEED_NURSE_PASSWORD || 'perawat123'}`);
        console.log(`   Pasien   : NIK: ${process.env.SEED_PATIENT_NIK || '4234567890123456'} | Password: ${process.env.SEED_PATIENT_PASSWORD || 'pasien123'}`);

    } catch (error) {
        console.error('❌ Seeding error:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

seed();
