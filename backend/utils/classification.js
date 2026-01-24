/**
 * Klasifikasi Tekanan Darah berdasarkan JNC 7 Guidelines
 * @param {number} systolic - Tekanan sistolik
 * @param {number} diastolic - Tekanan diastolik
 * @returns {object} - Klasifikasi dan info
 */
const classifyBloodPressure = (systolic, diastolic) => {
    let classification, label, color, description, isEmergency = false;

    if (systolic > 180 || diastolic > 120) {
        classification = 'crisis';
        label = 'Krisis Hipertensi';
        color = '#DC2626';
        description = 'DARURAT! Segera hubungi dokter atau UGD.';
        isEmergency = true;
    } else if (systolic >= 160 || diastolic >= 100) {
        classification = 'hypertension_2';
        label = 'Hipertensi Tahap 2';
        color = '#EF4444';
        description = 'Tekanan darah tinggi. Perlu penanganan medis segera.';
    } else if (systolic >= 140 || diastolic >= 90) {
        classification = 'hypertension_1';
        label = 'Hipertensi Tahap 1';
        color = '#F97316';
        description = 'Tekanan darah tinggi. Konsultasi dengan dokter.';
    } else if (systolic >= 120 || diastolic >= 80) {
        classification = 'prehypertension';
        label = 'Pra-Hipertensi';
        color = '#EAB308';
        description = 'Waspada! Perlu perubahan gaya hidup.';
    } else {
        classification = 'normal';
        label = 'Normal';
        color = '#22C55E';
        description = 'Tekanan darah dalam batas normal.';
    }

    return {
        classification,
        label,
        color,
        description,
        isEmergency,
        systolic,
        diastolic
    };
};

module.exports = { classifyBloodPressure };
