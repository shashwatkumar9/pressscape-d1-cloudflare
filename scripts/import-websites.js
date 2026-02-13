#!/usr/bin/env node
// Import all 327 websites from spreadsheet
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/pressscape'
});

// Parse traffic string to number
function parseTraffic(traffic) {
    if (!traffic) return 0;
    traffic = traffic.toString().toLowerCase().replace(/,/g, '');
    if (traffic.includes('million') || traffic.includes('m')) {
        return parseInt(parseFloat(traffic) * 1000000);
    }
    if (traffic.includes('k')) {
        return parseInt(parseFloat(traffic) * 1000);
    }
    return parseInt(traffic) || 0;
}

// Parse price string to cents
function parsePrice(price) {
    if (!price) return 10000; // default $100
    price = price.toString().replace(/[,$£GBP\s"]/g, '');
    const num = parseFloat(price);
    return Math.round((isNaN(num) ? 100 : num) * 100);
}

// Parse turnaround to days
function parseTurnaround(tat) {
    if (!tat) return 3;
    tat = tat.toLowerCase();
    if (tat.includes('instant') || tat.includes('hour')) return 1;
    if (tat.includes('week')) return 7;
    const match = tat.match(/(\d+)/);
    return match ? parseInt(match[1]) : 3;
}

// Clean domain
function cleanDomain(domain) {
    if (!domain) return null;
    return domain.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '').split('/')[0].toLowerCase();
}

// Create slug
function createSlug(domain) {
    return domain.toLowerCase().replace(/\./g, '-').replace(/[^a-z0-9-]/g, '');
}

// Map niche to category
function mapToCategory(niche) {
    if (!niche) return 'general';
    const n = niche.toLowerCase();
    if (n.includes('tech') || n.includes('saas') || n.includes('ai') || n.includes('app')) return 'tech';
    if (n.includes('finance') || n.includes('business') || n.includes('forex') || n.includes('crypto') || n.includes('trading')) return 'business';
    if (n.includes('health') || n.includes('medical')) return 'health';
    if (n.includes('fashion') || n.includes('lifestyle') || n.includes('beauty')) return 'lifestyle';
    if (n.includes('sport')) return 'sports';
    if (n.includes('entertainment') || n.includes('music') || n.includes('celebrity')) return 'entertainment';
    if (n.includes('travel')) return 'travel';
    if (n.includes('news') || n.includes('local')) return 'news';
    if (n.includes('marketing') || n.includes('seo')) return 'marketing';
    if (n.includes('food') || n.includes('recipe')) return 'food';
    return 'general';
}

// Parse CSV line (handles quoted fields)
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim());
    return result;
}

async function main() {
    const client = await pool.connect();

    try {
        // Get owner user
        const ownerResult = await client.query(
            "SELECT id FROM users WHERE email = 'nanoo.shashwat@gmail.com'"
        );

        if (ownerResult.rows.length === 0) {
            console.error('Owner user not found!');
            return;
        }

        const ownerId = ownerResult.rows[0].id;
        console.log('Owner ID:', ownerId);

        // Get category map
        const catsResult = await client.query("SELECT id, slug FROM categories");
        const categoryMap = {};
        for (const cat of catsResult.rows) {
            categoryMap[cat.slug] = cat.id;
        }
        console.log('Categories:', Object.keys(categoryMap).join(', '));

        // Read CSV
        const csv = fs.readFileSync('/tmp/websites.csv', 'utf8');
        const lines = csv.trim().split('\n').slice(1); // Skip header

        let inserted = 0;
        let skipped = 0;
        const seen = new Set();

        for (const line of lines) {
            const parts = parseCSVLine(line);
            if (parts.length < 9) continue;

            const domain = cleanDomain(parts[0]);
            if (!domain || seen.has(domain)) {
                skipped++;
                continue;
            }
            seen.add(domain);

            const da = parseInt(parts[1]) || null;
            const dr = parseInt(parts[2]) || null;
            const traffic = parseTraffic(parts[3]);
            const niche = parts[4] || '';
            const linkType = parts[5]?.toLowerCase().includes('dofollow') ? 'dofollow' : 'nofollow';
            const turnaround = parseTurnaround(parts[7]);
            const price = parsePrice(parts[8]);
            const slug = createSlug(domain);

            // Get primary category
            const catSlug = mapToCategory(niche);
            const primaryCategoryId = categoryMap[catSlug] || categoryMap['general'] || null;

            try {
                await client.query(
                    `INSERT INTO websites (
            id, domain, name, slug, owner_id, primary_category_id,
            domain_authority, domain_rating, organic_traffic, spam_score,
            price_guest_post, price_link_insertion, turnaround_days,
            link_type, verification_status, is_active, is_featured
          ) VALUES (
            gen_random_uuid()::text, $1, $2, $3, $4, $5,
            $6, $7, $8, 0,
            $9, $10, $11,
            $12, 'approved', true, $13
          )`,
                    [
                        domain, domain, slug, ownerId, primaryCategoryId,
                        da, dr, traffic,
                        price, Math.round(price * 0.6), turnaround,
                        linkType, (da && da >= 80)
                    ]
                );
                inserted++;
            } catch (err) {
                console.log('Error inserting:', domain, err.message);
                skipped++;
            }
        }

        console.log(`\nDone! Inserted: ${inserted}, Skipped: ${skipped}`);

        // Verify
        const count = await client.query("SELECT COUNT(*) FROM websites");
        console.log('Total websites in database:', count.rows[0].count);

    } finally {
        client.release();
        await pool.end();
    }
}

main().catch(console.error);
