const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ message: 'Akses ditolak. Token tidak ditemukan.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({
            where: { id: decoded.id }
        });

        if (!user) {
            return res.status(401).json({ message: 'User tidak ditemukan.' });
        }

        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token tidak valid.' });
    }
};

module.exports = auth;
