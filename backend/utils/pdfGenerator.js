const PDFDocument = require('pdfkit');

/**
 * Generate PDF Resep Digital
 */
const generatePrescriptionPDF = (prescription, patient, doctor) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ size: 'A4', margin: 50 });
            const chunks = [];

            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));

            // Header
            doc.fontSize(20).font('Helvetica-Bold').fillColor('#DC2626')
                .text('SMART HATI', { align: 'center' });
            doc.fontSize(10).font('Helvetica').fillColor('#666')
                .text('Sistem Monitoring & Edukasi Pasien Hipertensi', { align: 'center' });
            doc.moveDown();

            // Line separator
            doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#DC2626');
            doc.moveDown();

            // Title
            doc.fontSize(16).font('Helvetica-Bold').fillColor('#333')
                .text('RESEP DIGITAL', { align: 'center' });
            doc.moveDown();

            // Patient info
            doc.fontSize(12).font('Helvetica-Bold').fillColor('#333')
                .text('Data Pasien:');
            doc.font('Helvetica').fontSize(11)
                .text(`Nama: ${patient.name}`)
                .text(`NIK: ${patient.nik}`)
                .text(`Tanggal Lahir: ${patient.birthDate || '-'}`);
            doc.moveDown();

            // Prescription info
            doc.fontSize(12).font('Helvetica-Bold').fillColor('#333')
                .text('Resep Obat:');
            doc.font('Helvetica').fontSize(11)
                .text(`Nama Obat: ${prescription.medicationName}`)
                .text(`Dosis: ${prescription.dosage}`)
                .text(`Frekuensi: ${prescription.frequency}`)
                .text(`Durasi: ${prescription.duration || '-'}`)
                .text(`Catatan: ${prescription.notes || '-'}`);
            doc.moveDown(2);

            // Doctor info
            doc.fontSize(12).font('Helvetica-Bold').fillColor('#333')
                .text('Dokter Penulis Resep:');
            doc.font('Helvetica').fontSize(11)
                .text(`Nama: ${doctor.name}`)
                .text(`Tanggal: ${new Date(prescription.createdAt).toLocaleDateString('id-ID')}`);
            doc.moveDown(2);

            // Footer
            doc.fontSize(8).fillColor('#999')
                .text('Dokumen ini digenerate oleh sistem SMART HATI', { align: 'center' })
                .text('© 2026 SMART HATI - Pantau, Cegah, Kendalikan Hipertensi Sejak Dini', { align: 'center' });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

/**
 * Generate PDF Rekomendasi
 */
const generateRecommendationPDF = (recommendations, patient, doctor) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ size: 'A4', margin: 50 });
            const chunks = [];

            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));

            // Header
            doc.fontSize(20).font('Helvetica-Bold').fillColor('#DC2626')
                .text('SMART HATI', { align: 'center' });
            doc.fontSize(10).font('Helvetica').fillColor('#666')
                .text('Sistem Monitoring & Edukasi Pasien Hipertensi', { align: 'center' });
            doc.moveDown();

            doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#DC2626');
            doc.moveDown();

            doc.fontSize(16).font('Helvetica-Bold').fillColor('#333')
                .text('REKOMENDASI KESEHATAN', { align: 'center' });
            doc.moveDown();

            // Patient info
            doc.fontSize(12).font('Helvetica-Bold').fillColor('#333')
                .text('Data Pasien:');
            doc.font('Helvetica').fontSize(11)
                .text(`Nama: ${patient.name}`)
                .text(`NIK: ${patient.nik}`);
            doc.moveDown();

            // Recommendations
            const typeLabels = {
                medication: '💊 Obat',
                exercise: '🏃 Olahraga',
                diet: '🥗 Makanan (DASH)',
                stress_management: '😌 Manajemen Stres'
            };

            recommendations.forEach((rec, index) => {
                doc.fontSize(12).font('Helvetica-Bold').fillColor('#333')
                    .text(`${index + 1}. ${typeLabels[rec.type] || rec.type}: ${rec.title}`);
                doc.font('Helvetica').fontSize(11).fillColor('#555')
                    .text(rec.description || '-');
                doc.moveDown();
            });

            // Doctor info
            doc.moveDown();
            doc.fontSize(12).font('Helvetica-Bold').fillColor('#333')
                .text('Dokter:');
            doc.font('Helvetica').fontSize(11)
                .text(`Nama: ${doctor.name}`)
                .text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`);

            // Footer
            doc.moveDown(2);
            doc.fontSize(8).fillColor('#999')
                .text('Dokumen ini digenerate oleh sistem SMART HATI', { align: 'center' });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = { generatePrescriptionPDF, generateRecommendationPDF };
