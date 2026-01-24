const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

// Login
exports.login = async (req, res) => {
    try {
        const { nik, email, identifier, password } = req.body;

        // Support login with nik, email, or identifier (which can be either)
        const loginId = nik || email || identifier;

        if (!loginId || !password) {
            return res.status(400).json({ message: 'NIK/Email dan password harus diisi.' });
        }

        // Check if loginId is email format
        const isEmail = loginId.includes('@');

        let user;
        if (isEmail) {
            user = await prisma.user.findUnique({
                where: { email: loginId },
                include: {
                    profile: true
                }
            });
        } else {
            user = await prisma.user.findUnique({
                where: { nik: loginId },
                include: {
                    profile: true
                }
            });
        }

        if (!user) {
            return res.status(401).json({ message: 'NIK/Email atau password salah.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'NIK atau password salah.' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        res.json({
            message: 'Login berhasil!',
            token,
            user: userWithoutPassword
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
};

// Get current user
exports.getMe = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            include: {
                profile: true
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'User tidak ditemukan.' });
        }

        const { password: _, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    } catch (error) {
        console.error('GetMe error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
};

// Logout (invalidate on client side)
exports.logout = async (req, res) => {
    res.json({ message: 'Logout berhasil.' });
};
