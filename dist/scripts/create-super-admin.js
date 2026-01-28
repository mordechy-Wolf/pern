"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/scripts/create-super-admin.ts
const dotenv_1 = __importDefault(require("dotenv"));
const pg_1 = require("pg");
const bcrypt_1 = __importDefault(require("bcrypt"));
dotenv_1.default.config();
async function createSuperAdmin() {
    const email = process.argv[2] || 'super@admin.com';
    const password = process.argv[3] || 'superpassword123';
    const firstName = 'Super';
    const lastName = 'Admin';
    if (!email || !password) {
        console.error('Usage: npm run create-super-admin <email> <password>');
        process.exit(1);
    }
    const pool = new pg_1.Pool({
        host: process.env.PGHOST || 'localhost',
        port: parseInt(process.env.PGPORT || '5432'),
        database: process.env.PGDATABASE,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
    });
    const client = await pool.connect();
    try {
        // בדיקה אם המשתמש כבר קיים
        const existing = await client.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existing.rowCount && existing.rowCount > 0) {
            console.error(`User with email ${email} already exists!`);
            process.exit(1);
        }
        // hashing הסיסמה
        const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '10');
        const hashedPassword = await bcrypt_1.default.hash(password, saltRounds);
        // יצירת המשתמש
        const userResult = await client.query(`INSERT INTO users (email, password, first_name, last_name, role, is_active)
       VALUES ($1, $2, $3, $4, 'USER', true)
       RETURNING id`, [email, hashedPassword, firstName, lastName]);
        const userId = userResult.rows[0].id;
        // הענקת הרשאות SUPER_ADMIN
        await client.query(`INSERT INTO admins (user_id, admin_level, granted_by, granted_at)
       VALUES ($1, 'SUPER_ADMIN', $1, NOW())`, [userId]);
        console.log(`✅ Super Admin created successfully!`);
        console.log(`   Email: ${email}`);
        console.log(`   Password: ${password} (raw - saved hashed)`);
        console.log(`   User ID: ${userId}`);
        console.log(`   Login at: POST /api/auth/login`);
    }
    catch (error) {
        console.error('❌ Failed to create super admin:', error);
        process.exit(1);
    }
    finally {
        client.release();
        await pool.end();
    }
}
createSuperAdmin();
