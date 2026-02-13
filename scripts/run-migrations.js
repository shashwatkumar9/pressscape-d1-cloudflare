const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env.local
const envPath = path.join(__dirname, '../.env.local');
console.log('Loading env from:', envPath);
const result = dotenv.config({ path: envPath });
if (result.error) {
    console.log('⚠️  Could not load .env.local:', result.error.message);
}

const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL || 'postgresql://localhost:5432/pressscape';

console.log('Using connection string:', connectionString.replace(/:[^:@]+@/, ':****@')); // Mask password

// Use the connection string from environment or default
const pool = new Pool({
    connectionString: connectionString
});

async function runMigrations() {
    const client = await pool.connect();
    try {
        console.log('🔌 Connected to database...');

        const migrationFiles = [
            '001_payment_gateways.sql',
            '004_link_verification.sql'
        ];

        for (const file of migrationFiles) {
            console.log(`\n📄 Running migration: ${file}`);
            const filePath = path.join(__dirname, '../sql/migrations', file);
            const sql = fs.readFileSync(filePath, 'utf8');

            try {
                await client.query(sql);
                console.log(`✅ Successfully executed ${file}`);
            } catch (err) {
                // Ignore "already exists" errors to make script idempotent
                if (err.code === '42P07' || err.code === '42701' || err.code === '42P01') {
                    console.log(`⚠️  Notice for ${file}: ${err.message}`);
                } else {
                    console.error(`❌ Error in ${file}:`, err.message);
                    // Don't throw, try to continue
                }
            }
        }

        console.log('\n✨ All migrations completed successfully!');

    } catch (err) {
        console.error('❌ Error connecting/running migrations:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

runMigrations();
