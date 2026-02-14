#!/usr/bin/env node

/**
 * Import data to production D1 with schema mapping
 * Only imports columns that exist in both source and destination
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const migrationDir = path.join(__dirname, '..', 'migration-data');

// Define D1 schema columns for each table
const D1_SCHEMA = {
  users: [
    'id', 'email', 'email_verified', 'password_hash', 'name', 'avatar_url',
    'is_buyer', 'is_publisher', 'is_affiliate',
    'buyer_balance', 'publisher_balance', 'affiliate_balance', 'contributor_balance',
    'preferred_currency', 'timezone', 'notification_email', 'notification_orders',
    'is_verified', 'verified_at', 'affiliate_code', 'referred_by',
    'is_active', 'is_banned', 'ban_reason',
    'stripe_customer_id', 'stripe_connect_id',
    'created_at', 'updated_at', 'last_login_at'
  ],
  categories: [
    'id', 'name', 'slug', 'parent_id', 'description', 'icon',
    'website_count', 'display_order', 'is_active', 'created_at'
  ],
  websites: [
    'id', 'owner_id', 'domain', 'name', 'description', 'slug',
    'primary_category_id', 'primary_language',
    'domain_authority', 'domain_rating', 'trust_flow', 'citation_flow',
    'organic_traffic', 'referring_domains', 'spam_score',
    'metrics_updated_at', 'metrics_source',
    'traffic_country_1', 'traffic_country_1_percent',
    'traffic_country_2', 'traffic_country_2_percent',
    'traffic_country_3', 'traffic_country_3_percent',
    'price_guest_post', 'price_link_insertion', 'price_homepage_link',
    'price_content_writing', 'price_extra_link', 'price_urgent',
    'min_word_count', 'max_word_count', 'max_links',
    'allows_casino', 'allows_cbd', 'allows_adult', 'allows_crypto',
    'turnaround_days', 'offers_urgent',
    'link_type', 'sponsored_tag', 'indexed_guarantee',
    'accepts_buyer_content', 'offers_writing_service', 'writing_fee',
    'sample_post_url',
    'verification_status', 'verified_at', 'verification_method', 'verification_code',
    'is_active', 'is_featured', 'featured_until',
    'total_orders', 'completed_orders', 'average_rating', 'rating_count',
    'created_at', 'updated_at'
  ],
  orders: [
    'id', 'order_number', 'buyer_id', 'website_id', 'publisher_id',
    'affiliate_id', 'affiliate_code',
    'order_type', 'content_source',
    'article_title', 'article_content', 'article_url',
    'target_url', 'anchor_text', 'secondary_links',
    'buyer_notes', 'keywords', 'word_count_requested',
    'base_price', 'writing_fee', 'extra_links_fee', 'urgent_fee',
    'subtotal', 'platform_fee', 'affiliate_fee', 'total_amount', 'publisher_earnings',
    'contributor_id', 'contributor_earnings',
    'status', 'turnaround_days', 'is_urgent', 'deadline_at',
    'accepted_at', 'content_submitted_at', 'approved_at', 'published_at',
    'completed_at', 'cancelled_at', 'cancellation_reason', 'cancelled_by',
    'created_at', 'updated_at'
  ],
  transactions: [
    'id', 'user_id', 'type', 'category', 'amount', 'balance_after',
    'order_id', 'payment_method', 'payment_reference', 'stripe_payment_id',
    'status', 'description', 'created_at'
  ],
  website_contributors: [
    'id', 'website_id', 'contributor_id', 'status', 'created_at'
  ],
};

function mapDataToSchema(tableName, data) {
  const schema = D1_SCHEMA[tableName];
  if (!schema) {
    console.warn(`  ⚠️  No schema mapping for ${tableName}, using all columns`);
    return data;
  }

  return data.map(row => {
    const mappedRow = {};
    schema.forEach(col => {
      if (row.hasOwnProperty(col)) {
        mappedRow[col] = row[col];
      }
    });
    return mappedRow;
  });
}

function generateInsertSQL(tableName, data) {
  if (data.length === 0) {
    return '';
  }

  const columns = Object.keys(data[0]);
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

      return `'${value.toString().replace(/'/g, "''")}'`;
    });

    return `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${values.join(', ')});`;
  });

  return inserts.join('\n');
}

function importTable(tableName) {
  const jsonFile = path.join(migrationDir, `${tableName}.json`);

  if (!fs.existsSync(jsonFile)) {
    console.log(`  ⚠️  ${tableName}: No data file (skipping)`);
    return 0;
  }

  try {
    console.log(`\nImporting ${tableName}...`);
    const rawData = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));

    if (rawData.length === 0) {
      console.log(`  ⚠️  ${tableName}: 0 rows (skipping)`);
      return 0;
    }

    // Map data to D1 schema
    const mappedData = mapDataToSchema(tableName, rawData);
    console.log(`  📋 Mapped ${rawData.length} rows to D1 schema`);

    // Generate SQL
    const sql = generateInsertSQL(tableName, mappedData);
    const sqlFile = path.join(migrationDir, `_${tableName}_mapped.sql`);
    fs.writeFileSync(sqlFile, sql);

    // Execute
    console.log(`  📝 Executing ${mappedData.length} INSERT statements...`);
    execSync(`npx wrangler d1 execute pressscape-db --remote --file="${sqlFile}"`, {
      stdio: 'inherit',
    });

    fs.unlinkSync(sqlFile);
    console.log(`  ✅ ${tableName}: ${mappedData.length} rows imported`);
    return mappedData.length;

  } catch (error) {
    console.error(`  ❌ Error importing ${tableName}:`, error.message);
    return 0;
  }
}

async function main() {
  console.log('🚀 Starting D1 import with schema mapping...\n');

  const tables = ['users', 'categories', 'websites', 'orders', 'transactions', 'website_contributors'];
  const results = [];
  let totalRows = 0;

  for (const table of tables) {
    const count = importTable(table);
    results.push({ table, count });
    totalRows += count;
  }

  console.log('\n\n📊 Migration Summary:');
  console.log('══════════════════════');
  results.forEach(r => {
    if (r.count > 0) {
      console.log(`  ✅ ${r.table.padEnd(25)} ${r.count.toLocaleString()} rows`);
    }
  });
  console.log(`\n  Total: ${totalRows.toLocaleString()} rows migrated to D1`);
  console.log('\n✨ Migration complete!');
  console.log('🔗 Test at: https://pressscape-d1-cloudflare.pages.dev\n');
}

main();
