const prisma = require('../lib/prisma');
const { analyzeHereditaryRisk } = require('../utils/riskAnalysis');

// Get risk analysis for patient
exports.getRiskAnalysis = async (req, res) => {
    try {
        const patientId = req.params.patientId || req.user.id;

        if (req.user.role === 'patient' && req.user.id !== parseInt(patientId)) {
            return res.status(403).json({ message: 'Tidak memiliki akses.' });
        }

        const profile = await prisma.patientProfile.findUnique({
            where: { userId: parseInt(patientId) },
            include: {
                user: { select: { name: true, nik: true, birthDate: true } }
            }
        });

        if (!profile) {
            return res.status(404).json({ message: 'Profil pasien tidak ditemukan.' });
        }

        // Analyze hereditary risk
        const hereditaryRisk = analyzeHereditaryRisk(profile.hereditaryHistory);

        // Get blood pressure trend
        const recentRecords = await prisma.bloodPressureRecord.findMany({
            where: {
                patientId: parseInt(patientId),
                recordedAt: {
                    gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                }
            },
            orderBy: { recordedAt: 'desc' }
        });

        // Calculate BP trend risk
        let bpRiskLevel = 'low';
        let bpRiskScore = 0;

        if (recentRecords.length > 0) {
            const crisisCount = recentRecords.filter(r => r.classification === 'crisis').length;
            const hypertension2Count = recentRecords.filter(r => r.classification === 'hypertension_2').length;
            const hypertension1Count = recentRecords.filter(r => r.classification === 'hypertension_1').length;

            bpRiskScore = (crisisCount * 30) + (hypertension2Count * 20) + (hypertension1Count * 10);

            if (bpRiskScore >= 50) bpRiskLevel = 'high';
            else if (bpRiskScore >= 25) bpRiskLevel = 'medium';
        }

        // Lifestyle risk factors
        let lifestyleRiskScore = 0;
        const lifestyleFactors = [];

        if (profile.lifestyle) {
            if (profile.lifestyle.smoking) {
                lifestyleRiskScore += 20;
                lifestyleFactors.push('Merokok');
            }
            if (profile.lifestyle.alcohol) {
                lifestyleRiskScore += 15;
                lifestyleFactors.push('Konsumsi alkohol');
            }
            if (profile.lifestyle.sedentary) {
                lifestyleRiskScore += 15;
                lifestyleFactors.push('Kurang aktivitas fisik');
            }
            if (profile.lifestyle.highSaltDiet) {
                lifestyleRiskScore += 15;
                lifestyleFactors.push('Diet tinggi garam');
            }
        }

        if (profile.stressLevel === 'high') {
            lifestyleRiskScore += 15;
            lifestyleFactors.push('Tingkat stres tinggi');
        }

        // Calculate BMI risk if height and weight available
        let bmiRisk = { score: 0, category: 'normal' };
        if (profile.weight && profile.height) {
            const heightInM = Number(profile.height) / 100;
            const bmi = Number(profile.weight) / (heightInM * heightInM);

            if (bmi >= 30) {
                bmiRisk = { score: 25, category: 'obesity', bmi: bmi.toFixed(1) };
                lifestyleFactors.push(`Obesitas (BMI: ${bmi.toFixed(1)})`);
            } else if (bmi >= 25) {
                bmiRisk = { score: 15, category: 'overweight', bmi: bmi.toFixed(1) };
                lifestyleFactors.push(`Berat badan berlebih (BMI: ${bmi.toFixed(1)})`);
            } else {
                bmiRisk.bmi = bmi.toFixed(1);
            }
        }

        // Comorbidities risk
        let comorbidityScore = 0;
        const comorbidityFactors = [];

        if (profile.comorbidities) {
            if (profile.comorbidities.diabetes) {
                comorbidityScore += 25;
                comorbidityFactors.push('Diabetes');
            }
            if (profile.comorbidities.kidneyDisease) {
                comorbidityScore += 20;
                comorbidityFactors.push('Penyakit ginjal');
            }
            if (profile.comorbidities.heartDisease) {
                comorbidityScore += 25;
                comorbidityFactors.push('Penyakit jantung');
            }
            if (profile.comorbidities.highCholesterol) {
                comorbidityScore += 15;
                comorbidityFactors.push('Kolesterol tinggi');
            }
        }

        // Overall risk calculation
        const totalScore =
            (hereditaryRisk.score * 0.25) +
            (bpRiskScore * 0.3) +
            (lifestyleRiskScore * 0.25) +
            (comorbidityScore * 0.2);

        let overallRisk, overallLabel, overallColor;
        if (totalScore >= 50) {
            overallRisk = 'high';
            overallLabel = 'Risiko Tinggi';
            overallColor = '#DC2626';
        } else if (totalScore >= 25) {
            overallRisk = 'medium';
            overallLabel = 'Risiko Sedang';
            overallColor = '#F97316';
        } else {
            overallRisk = 'low';
            overallLabel = 'Risiko Rendah';
            overallColor = '#22C55E';
        }

        res.json({
            patient: profile.user,
            overallRisk: {
                category: overallRisk,
                label: overallLabel,
                color: overallColor,
                score: Math.round(totalScore)
            },
            hereditaryRisk,
            bloodPressureRisk: {
                level: bpRiskLevel,
                score: bpRiskScore,
                recentRecordsCount: recentRecords.length
            },
            lifestyleRisk: {
                score: lifestyleRiskScore,
                factors: lifestyleFactors
            },
            bmiRisk,
            comorbidityRisk: {
                score: comorbidityScore,
                factors: comorbidityFactors
            },
            recommendations: generateRiskRecommendations(overallRisk, hereditaryRisk, lifestyleFactors)
        });
    } catch (error) {
        console.error('GetRiskAnalysis error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
};

// Generate recommendations based on risk
function generateRiskRecommendations(overallRisk, hereditaryRisk, lifestyleFactors) {
    const recommendations = [];

    if (overallRisk === 'high') {
        recommendations.push({
            priority: 'urgent',
            title: 'Konsultasi Dokter Segera',
            description: 'Anda memiliki risiko tinggi hipertensi. Segera konsultasikan dengan dokter untuk evaluasi lebih lanjut.'
        });
    }

    if (hereditaryRisk.category === 'high') {
        recommendations.push({
            priority: 'high',
            title: 'Pemeriksaan Rutin',
            description: 'Dengan riwayat keluarga hipertensi, lakukan pemeriksaan tekanan darah minimal 1x seminggu.'
        });
    }

    if (lifestyleFactors.includes('Merokok')) {
        recommendations.push({
            priority: 'high',
            title: 'Berhenti Merokok',
            description: 'Merokok meningkatkan risiko hipertensi dan penyakit jantung. Konsultasikan program berhenti merokok.'
        });
    }

    if (lifestyleFactors.includes('Kurang aktivitas fisik')) {
        recommendations.push({
            priority: 'medium',
            title: 'Tingkatkan Aktivitas Fisik',
            description: 'Lakukan olahraga aerobik minimal 30 menit per hari, 5 hari seminggu.'
        });
    }

    if (lifestyleFactors.includes('Diet tinggi garam')) {
        recommendations.push({
            priority: 'medium',
            title: 'Diet DASH',
            description: 'Kurangi konsumsi garam dan ikuti pola makan DASH yang kaya buah, sayur, dan rendah lemak.'
        });
    }

    recommendations.push({
        priority: 'normal',
        title: 'Kelola Stres',
        description: 'Praktikkan teknik relaksasi seperti meditasi, yoga, atau aktivitas yang menenangkan.'
    });

    return recommendations;
}
