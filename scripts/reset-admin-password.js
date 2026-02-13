const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/pressscape'
});

async function main() {
    const client = await pool.connect();
    try {
        const password = 'Admin@123';
        const hashedPassword = await bcrypt.hash(password, 10);

        const res = await client.query(
            "UPDATE users SET password_hash = $1 WHERE email = 'nanoo.shashwat@gmail.com' RETURNING email",
            [hashedPassword]
        );

        if (res.rows.length > 0) {
            console.log(`Password reset successful for ${res.rows[0].email}`);
        } else {
            console.log('User not found');
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

main();
