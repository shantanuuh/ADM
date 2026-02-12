const db = require('../config/db');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

async function initializeAdmin() {
    let connection;
    try {
        await db.initialize();
        connection = await db.getPool().getConnection();

        // 1. Create Table if not exists
        const schemaPath = path.join(__dirname, '../db/admin_schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        // Split by semicolon (roughly) but the PL/SQL block is one statement
        // For simplicity, we'll execute the whole block.
        console.log('Creating Admins table...');
        try {
            await connection.execute(schemaSql);
            console.log('Admins table created or already exists.');
        } catch (err) {
            console.error('Error creating table:', err);
            // Verify if it's "name already used" error (ORA-00955)
            if (err && err.errorNum === 955) {
                console.log('Admins table already exists.');
            } else {
                throw err;
            }
        }

        // 2. Insert Default Admin
        const defaultUser = 'admin';
        const defaultPass = 'password123';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(defaultPass, salt);

        console.log('Checking for existing admin...');
        const result = await connection.execute(
            `SELECT COUNT(*) as count FROM admins WHERE username = :username`,
            [defaultUser],
            { outFormat: require('oracledb').OUT_FORMAT_OBJECT } // Dynamically require oracledb since it might not be global
        );

        if (result.rows[0].COUNT === 0) {
            console.log('Creating default admin user...');
            await connection.execute(
                `INSERT INTO admins (username, password_hash) VALUES (:username, :password)`,
                [defaultUser, hashedPassword],
                { autoCommit: true }
            );
            console.log(`Default admin created: ${defaultUser} / ${defaultPass}`);
        } else {
            console.log('Default admin already exists.');
        }

    } catch (err) {
        console.error('Failed to initialize admin:', err);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
        await db.close();
    }
}

initializeAdmin();
