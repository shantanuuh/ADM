require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const config = {
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    port: process.env.POSTGRES_PORT || 5432,
};

async function setupDatabase() {
    console.log("🚀 Starting Automated Database Setup...");
    console.log(`User: ${config.user}`);

    // 1. Connect to default 'postgres' database to create new DB
    const client = new Client({ ...config, database: 'postgres' });

    try {
        await client.connect();

        // Check if database exists
        const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = 'smartcitygis'`);
        if (res.rowCount === 0) {
            console.log("Creating database 'smartcitygis'...");
            await client.query('CREATE DATABASE smartcitygis');
            console.log("✅ Database created.");
        } else {
            console.log("ℹ️ Database 'smartcitygis' already exists.");
        }
        await client.end();

        // 2. Connect to the new 'smartcitygis' database
        const dbClient = new Client({ ...config, database: 'smartcitygis' });
        await dbClient.connect();

        // 3. Read and execute init_postgis.sql
        const sqlPath = path.join(__dirname, 'sql', 'init_postgis.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log("Executing SQL script (Enabling PostGIS, creating tables)...");
        await dbClient.query(sql);
        console.log("✅ Schema initialized successfully!");

        await dbClient.end();
        console.log("\n🎉 Setup Complete! You can now run 'npm start'");

    } catch (err) {
        console.error("❌ Setup Failed:", err.message);
        if (err.message.includes('password authentication failed')) {
            console.error("👉 ACTION REQUIRED: Update 'POSTGRES_PASSWORD' in backend/.env to the password you set during installation.");
        }
    }
}

setupDatabase();
