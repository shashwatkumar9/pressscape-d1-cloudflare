#!/usr/bin/env node

/**
 * Export data from Vercel Postgres to JSON files for D1 migration
 *
 * Usage:
 *   POSTGRES_URL="postgres://..." node scripts/export-postgres-data.js
 *
 * This will create JSON files in ./migration-data/ directory:
 *   - users.json
 *   - websites.json
 *   - orders.json
 *   - transactions.json
 *   - etc.
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Get connection string from environment
const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error('ERROR: POSTGRES_URL or DATABASE_URL environment variable is required');
  console.error('Usage: POSTGRES_URL="postgres://..." node scripts/export-postgres-data.js');
  process.exit(1);
}

// Create output directory
const outputDir = path.join(__dirname, '..', 'migration-data');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Tables to export (in dependency order)
const TABLES_TO_EXPORT = [
  'users',
  'categories',
  'websites',
  'orders',
  'transactions',
  'affiliate_commissions',
  'affiliate_referrals',
  'buyer_favorites',
  'buyer_saved_searches',
  'conversations',
  'messages',
  'disputes',
  'dispute_messages',
  'link_verifications',
  'payouts',
  'website_contributors',
];

async function exportTable(pool, tableName) {
  try {
    console.log(`Exporting ${tableName}...`);

    // Get row count first
    const countResult = await pool.query(`SELECT COUNT(*) FROM ${tableName}`);
    const rowCount = parseInt(countResult.rows[0].count);

    if (rowCount === 0) {
      console.log(`  ⚠️  ${tableName}: 0 rows (skipping)`);
      return;
    }

    // Export all rows
    const result = await pool.query(`SELECT * FROM ${tableName}`);
    const data = result.rows;

    // Write to JSON file
    const filePath = path.join(outputDir, `${tableName}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    console.log(`  ✅ ${tableName}: ${data.length} rows exported to ${tableName}.json`);

    return { table: tableName, count: data.length };
  } catch (error) {
    console.error(`  ❌ Error exporting ${tableName}:`, error.message);
    return { table: tableName, count: 0, error: error.message };
  }
}

async function main() {
  const pool = new Pool({ connectionString });

  try {
    // Test connection
    console.log('Testing database connection...');
    await pool.query('SELECT NOW()');
    console.log('✅ Connected to Postgres database\n');

    const results = [];

    // Export each table
    for (const table of TABLES_TO_EXPORT) {
      const result = await exportTable(pool, table);
      results.push(result);
    }

    // Create summary
    const summary = {
      exportedAt: new Date().toISOString(),
      tables: results,
      totalRows: results.reduce((sum, r) => sum + (r.count || 0), 0),
    };

    fs.writeFileSync(
      path.join(outputDir, '_summary.json'),
      JSON.stringify(summary, null, 2)
    );

    console.log('\n📊 Export Summary:');
    console.log('================');
    results.forEach(r => {
      if (r.count > 0) {
        console.log(`  ${r.table}: ${r.count} rows`);
      }
    });
    console.log(`\nTotal: ${summary.totalRows} rows exported`);
    console.log(`\nData saved to: ${outputDir}/`);

  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
