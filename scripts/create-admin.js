const { Pool } = require('pg');
const bcrypt = require('bcrypt');

// Use the connection string from environment or default
const pool = new Pool({
    connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL
});

async function createAdmin() {
    const client = await pool.connect();
    try {
        // Admin details
        const email = 'nanoo.shashwat@gmail.com';
        const password = 'Admin@123';
        const name = 'Shashwat Kumar';
        const role = 'super_admin';

        // Hash the password
        const passwordHash = await bcrypt.hash(password, 10);

        // Check if admin already exists
        const checkResult = await client.query(
            'SELECT id FROM admin_users WHERE email = $1',
            [email]
        );

        if (checkResult.rows.length > 0) {
            console.log('✅ Admin user already exists. Updating password...');

            await client.query(
                'UPDATE admin_users SET password_hash = $1, updated_at = NOW() WHERE email = $2',
                [passwordHash, email]
            );

            console.log('✅ Password updated successfully!');
        } else {
            console.log('Creating new admin user...');

            await client.query(
                `INSERT INTO admin_users (email, password_hash, name, role, is_active)
                 VALUES ($1, $2, $3, $4, true)`,
                [email, passwordHash, name, role]
            );

            console.log('✅ Admin user created successfully!');
        }

        console.log('\n📧 Admin Credentials:');
        console.log('   Email:', email);
        console.log('   Password:', password);
        console.log('   Role:', role);
        console.log('\n🔗 Login at: http://localhost:3003/admin/login\n');

    } catch (err) {
        console.error('❌ Error:', err.message);
        console.error(err);
    } finally {
        client.release();
        await pool.end();
    }
}

createAdmin();
