// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Use the app's custom database client
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

// Initialize connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function createTestBuyer() {
    const client = await pool.connect();
    try {
        // Test Buyer details
        const email = 'buyer@test.com';
        const password = 'Buyer@123';
        const name = 'Test Buyer';

        // Hash the password
        const passwordHash = await bcrypt.hash(password, 10);

        // Check if buyer already exists
        const checkResult = await client.query('SELECT id FROM users WHERE email = $1', [email]);

        if (checkResult.rows.length > 0) {
            console.log('✅ Test buyer already exists. Updating password and adding balance...');

            await client.query(
                `UPDATE users SET 
                    password_hash = $1, 
                    is_buyer = true,
                    buyer_balance = 100000,
                    email_verified = true,
                    is_active = true,
                    updated_at = NOW() 
                WHERE email = $2`,
                [passwordHash, email]
            );

            console.log('✅ Password updated and buyer balance set to $1000.00!');
        } else {
            console.log('Creating new test buyer...');

            await client.query(
                `INSERT INTO users (email, password_hash, name, is_buyer, buyer_balance, email_verified, is_active)
                VALUES ($1, $2, $3, true, 100000, true, true)`,
                [email, passwordHash, name]
            );

            console.log('✅ Test buyer created successfully!');
        }

        console.log('\n💰 Test Buyer Credentials:');
        console.log('   Email:', email);
        console.log('   Password:', password);
        console.log('   Wallet Balance: $1000.00 (100000 cents)');
        console.log('\n🔗 Login at: http://localhost:3000');
        console.log('   After login, navigate to: http://localhost:3000/buyer\n');

    } catch (err) {
        console.error('❌ Error:', err.message);
        console.error(err);
    } finally {
        client.release();
        await pool.end();
    }
}

createTestBuyer();
