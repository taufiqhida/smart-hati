const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const bloodPressureRoutes = require('./routes/bloodPressureRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const chatRoutes = require('./routes/chatRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const riskAnalysisRoutes = require('./routes/riskAnalysisRoutes');
const lifestyleRoutes = require('./routes/lifestyleRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/blood-pressure', bloodPressureRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/risk-analysis', riskAnalysisRoutes);
app.use('/api/lifestyle', lifestyleRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'SMART HATI API is running',
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Terjadi kesalahan server.',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Endpoint tidak ditemukan.' });
});

module.exports = app;
