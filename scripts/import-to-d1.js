#!/usr/bin/env node

/**
 * Import data from JSON files into local D1 database
 *
 * Usage:
 *   node scripts/import-to-d1.js
 *
 * This reads JSON files from ./migration-data/ and imports them into D1
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const migrationDir = path.join(__dirname, '..', 'migration-data');

// Tables to import (in dependency order to respect foreign keys)
const IMPORT_ORDER = [
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

function importTable(tableName) {
  const jsonFile = path.join(migrationDir, `${tableName}.json`);

  if (!fs.existsSync(jsonFile)) {
    console.log(`  ⚠️  ${tableName}: No data file found (skipping)`);
    return 0;
  }

  try {
    console.log(`Importing ${tableName}...`);

    const data = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));

    if (data.length === 0) {
      console.log(`  ⚠️  ${tableName}: 0 rows (skipping)`);
      return 0;
    }

    // Get column names from first row
    const columns = Object.keys(data[0]);

    // Build INSERT statements
    const inserts = data.map(row => {
      const values = columns.map(col => {
        const value = row[col];

        if (value === null || value === undefined) {
          return 'NULL';
        }

        if (typeof value === 'boolean') {
          return value ? '1' : '0';
        }

        if (typeof value === 'number') {
          return value.toString();
        }

        if (typeof value === 'object') {
          return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
        }

        // String - escape single quotes
        return `'${value.toString().replace(/'/g, "''")}'`;
      });

      return `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${values.join(', ')});`;
    });

    // Write to temporary SQL file
    const sqlFile = path.join(migrationDir, `_${tableName}_import.sql`);
    fs.writeFileSync(sqlFile, inserts.join('\n'));

    // Execute using wrangler d1 execute
    console.log(`  📝 Executing ${data.length} INSERT statements...`);
    execSync(`npx wrangler d1 execute pressscape-db --local --file="${sqlFile}"`, {
      stdio: 'pipe',
    });

    // Clean up temp file
    fs.unlinkSync(sqlFile);

    console.log(`  ✅ ${tableName}: ${data.length} rows imported`);
    return data.length;

  } catch (error) {
    console.error(`  ❌ Error importing ${tableName}:`, error.message);
    return 0;
  }
}

async function main() {
  console.log('Starting D1 import...\n');

  if (!fs.existsSync(migrationDir)) {
    console.error(`ERROR: Migration data directory not found: ${migrationDir}`);
    console.error('Please run export-postgres-data.js first');
    process.exit(1);
  }

  const results = [];
  let totalRows = 0;

  for (const table of IMPORT_ORDER) {
    const count = importTable(table);
    results.push({ table, count });
    totalRows += count;
  }

  console.log('\n📊 Import Summary:');
  console.log('================');
  results.forEach(r => {
    if (r.count > 0) {
      console.log(`  ${r.table}: ${r.count} rows`);
    }
  });
  console.log(`\nTotal: ${totalRows} rows imported to D1`);
}

main();
