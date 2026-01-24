/**
 * Analisis Risiko Keturunan Hipertensi
 * @param {object} hereditaryHistory - Riwayat keturunan
 * @returns {object} - Skor risiko dan kategori
 */
const analyzeHereditaryRisk = (hereditaryHistory) => {
    let score = 0;
    const factors = [];

    if (!hereditaryHistory) {
        return {
            score: 0,
            category: 'low',
            label: 'Risiko Rendah',
            color: '#22C55E',
            factors: [],
            description: 'Data riwayat keturunan tidak tersedia.'
        };
    }

    // Faktor orang tua
    if (hereditaryHistory.fatherHypertension) {
        score += 25;
        factors.push('Ayah memiliki riwayat hipertensi');
    }
    if (hereditaryHistory.motherHypertension) {
        score += 25;
        factors.push('Ibu memiliki riwayat hipertensi');
    }

    // Faktor saudara kandung
    if (hereditaryHistory.siblingHypertension) {
        score += 15;
        factors.push('Saudara kandung memiliki riwayat hipertensi');
    }

    // Faktor kakek/nenek
    if (hereditaryHistory.grandparentHypertension) {
        score += 10;
        factors.push('Kakek/Nenek memiliki riwayat hipertensi');
    }

    // Faktor riwayat stroke keluarga
    if (hereditaryHistory.familyStroke) {
        score += 15;
        factors.push('Ada riwayat stroke dalam keluarga');
    }

    // Faktor riwayat penyakit jantung keluarga
    if (hereditaryHistory.familyHeartDisease) {
        score += 10;
        factors.push('Ada riwayat penyakit jantung dalam keluarga');
    }

    // Tentukan kategori
    let category, label, color, description;

    if (score >= 50) {
        category = 'high';
        label = 'Risiko Tinggi';
        color = '#DC2626';
        description = 'Anda memiliki risiko tinggi hipertensi berdasarkan riwayat keluarga. Lakukan pemeriksaan rutin dan konsultasi dengan dokter.';
    } else if (score >= 25) {
        category = 'medium';
        label = 'Risiko Sedang';
        color = '#F97316';
        description = 'Anda memiliki risiko sedang hipertensi. Jaga pola hidup sehat dan lakukan pemeriksaan berkala.';
    } else {
        category = 'low';
        label = 'Risiko Rendah';
        color = '#22C55E';
        description = 'Risiko hipertensi dari faktor keturunan tergolong rendah. Tetap jaga pola hidup sehat.';
    }

    return {
        score,
        category,
        label,
        color,
        factors,
        description
    };
};

module.exports = { analyzeHereditaryRisk };
