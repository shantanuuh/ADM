const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const authController = {
    login: async (req, res) => {
        const { username, password } = req.body;
        let connection;
        try {
            connection = await db.getPool().getConnection();

            // Check if user exists
            const result = await connection.execute(
                `SELECT * FROM admins WHERE username = :username`,
                [username],
                { outFormat: require('oracledb').OUT_FORMAT_OBJECT }
            );

            if (result.rows.length === 0) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            const user = result.rows[0];

            // Verify password
            const isMatch = await bcrypt.compare(password, user.PASSWORD_HASH);
            if (!isMatch) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Create JWT
            const payload = {
                user: {
                    id: user.ID,
                    username: user.USERNAME
                }
            };

            // Use a secret from env or a fallback for dev
            const secret = process.env.JWT_SECRET || 'dev_secret_key_123';

            jwt.sign(
                payload,
                secret,
                { expiresIn: '1h' },
                (err, token) => {
                    if (err) throw err;
                    res.json({ token });
                }
            );

        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server error' });
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (err) {
                    console.error(err);
                }
            }
        }
    }
};

module.exports = authController;
