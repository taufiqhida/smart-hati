const mysql = require('mysql2/promise');

async function createDatabase() {
    console.log('🔄 Connecting to MySQL server...');
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '' // Assuming default XAMPP/Laragon password is empty
        });

        console.log('✅ Connected.');

        await connection.query('CREATE DATABASE IF NOT EXISTS smart_hati');
        console.log('✅ Database "smart_hati" created or already exists.');

        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating database:', error.message);
        process.exit(1);
    }
}

createDatabase();
