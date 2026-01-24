const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const prisma = require('./lib/prisma');
const { initializeSocket } = require('./socket/chatSocket');

const PORT = process.env.PORT || 6001;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
    cors: {
        origin: ['http://localhost:5173', 'http://localhost:3000'],
        methods: ['GET', 'POST']
    }
});

initializeSocket(io);

// Database connection and server start
async function main() {
    try {
        // Test database connection
        await prisma.$connect();
        console.log('✅ Database connected successfully');

        server.listen(PORT, () => {
            console.log(`
╔════════════════════════════════════════════════╗
║                                                ║
║    🩺 SMART HATI API Server                   ║
║    Sistem Monitoring Hipertensi Terintegrasi  ║
║                                                ║
║    Server running on: http://localhost:${PORT}   ║
║    Socket.io: Enabled                          ║
║                                                ║
╚════════════════════════════════════════════════╝
      `);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down gracefully...');
    await prisma.$disconnect();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    await prisma.$disconnect();
    process.exit(0);
});

main();
