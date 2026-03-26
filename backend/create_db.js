require('dotenv').config();
const mysql = require('mysql2/promise');

async function createDatabase() {
    console.log('🔄 Connecting to MySQL server...');
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || ''
        });

        console.log('✅ Connected.');

        const dbName = process.env.DB_NAME || 'smart_hati';
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
        console.log(`✅ Database "${dbName}" created or already exists.`);

        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating database:', error.message);
        process.exit(1);
    }
}

createDatabase();
