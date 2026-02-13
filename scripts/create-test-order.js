const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcrypt');

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL || 'postgresql://localhost:5432/pressscape';

const pool = new Pool({
    connectionString: connectionString
});

async function createTestOrder() {
    const client = await pool.connect();
    try {
        console.log('🔌 Connected to database...');

        // 1. Ensure Buyer exists
        let buyerId;
        const buyerRes = await client.query("SELECT id FROM users WHERE email = 'test-buyer@pressscape.com'");
        if (buyerRes.rows.length > 0) {
            buyerId = buyerRes.rows[0].id;
            console.log('✅ Found existing buyer');
        } else {
            const hash = await bcrypt.hash('Buyer123!', 10);
            const res = await client.query(
                `INSERT INTO users (email, password_hash, name, is_buyer, buyer_balance)
                 VALUES ($1, $2, $3, true, 100000) RETURNING id`,
                ['test-buyer@pressscape.com', hash, 'Test Buyer']
            );
            buyerId = res.rows[0].id;
            console.log('✅ Created test buyer');
        }

        // 2. Ensure Publisher exists
        let publisherId;
        const pubRes = await client.query("SELECT id FROM users WHERE email = 'test-publisher@pressscape.com'");
        if (pubRes.rows.length > 0) {
            publisherId = pubRes.rows[0].id;
            console.log('✅ Found existing publisher');
        } else {
            const hash = await bcrypt.hash('Publisher123!', 10);
            const res = await client.query(
                `INSERT INTO users (email, password_hash, name, is_publisher)
                 VALUES ($1, $2, $3, true) RETURNING id`,
                ['test-publisher@pressscape.com', hash, 'Test Publisher']
            );
            publisherId = res.rows[0].id;
            console.log('✅ Created test publisher');
        }

        // 3. Ensure Website exists
        let websiteId;
        const webRes = await client.query("SELECT id FROM websites WHERE domain = 'test-verification-site.com'");
        if (webRes.rows.length > 0) {
            websiteId = webRes.rows[0].id;
            console.log('✅ Found existing test website');
        } else {
            const res = await client.query(
                `INSERT INTO websites (owner_id, domain, name, slug, price_guest_post, verification_status)
                 VALUES ($1, $2, $3, $4, 10000, 'verified') RETURNING id`,
                [publisherId, 'test-verification-site.com', 'Test Verification Site', 'test-verification-site']
            );
            websiteId = res.rows[0].id;
            console.log('✅ Created test website');
        }

        // 4. Create Order
        const orderNumber = `TEST-VERIFY-${Date.now()}`;
        const articleUrl = 'http://localhost:3002/test-verification-target';
        const targetUrl = 'https://example.com';
        const anchorText = 'Target Link'; // Matches the link text in app/test-verification-target/page.tsx

        await client.query(
            `INSERT INTO orders (
                order_number, buyer_id, website_id, publisher_id,
                order_type, target_url, anchor_text,
                subtotal, platform_fee, total_amount, publisher_earnings,
                status, payment_status,
                article_url, created_at, published_at,
                content_source, base_price, turnaround_days
            ) VALUES (
                $1, $2, $3, $4,
                'guest_post', $5, $6,
                5000, 1250, 6250, 3750,
                'published', 'paid',
                $7, NOW(), NOW(),
                'buyer_provided', 5000, 7
            )`,
            [orderNumber, buyerId, websiteId, publisherId, targetUrl, anchorText, articleUrl]
        );

        console.log(`✅ Created test order: ${orderNumber}`);
        console.log('   Buyer: test-buyer@pressscape.com / Buyer123!');
        console.log(`   Article URL: ${articleUrl}`);
        console.log(`   Target URL: ${targetUrl}`);

    } catch (err) {
        console.error('❌ Error creating test order:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

createTestOrder();
