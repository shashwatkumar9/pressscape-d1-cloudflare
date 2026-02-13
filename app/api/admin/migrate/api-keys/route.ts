export const runtime = "edge";

import { NextResponse } from 'next/server';
import { sql , generateId } from '@/lib/db';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';
import { validateAdminRequest } from '@/lib/admin-auth';



/**
 * POST /api/admin/migrate/api-keys
 * Run API keys table migration
 */
export async function POST() {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();

        // Verify admin
        const { admin } = await validateAdminRequest();
        if (!admin || admin.role !== 'super_admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Create API keys table
        await sql`
            CREATE TABLE IF NOT EXISTS api_keys (
                id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
                user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                name TEXT NOT NULL,
                key_hash TEXT NOT NULL,
                prefix TEXT NOT NULL,
                permissions TEXT[] DEFAULT ARRAY['read']::TEXT[],
                rate_limit INTEGER DEFAULT 100,
                is_active BOOLEAN DEFAULT true,
                last_used_at TIMESTAMPTZ,
                request_count INTEGER DEFAULT 0,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                expires_at TIMESTAMPTZ
            )
        `;

        // Create rate limiting table
        await sql`
            CREATE TABLE IF NOT EXISTS api_rate_limits (
                id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
                api_key_id TEXT NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
                window_start TIMESTAMPTZ NOT NULL,
                request_count INTEGER DEFAULT 0,
                UNIQUE(api_key_id, window_start)
            )
        `;

        // Create indexes
        await sql`CREATE INDEX IF NOT EXISTS idx_api_keys_user ON api_keys(user_id)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_api_keys_prefix ON api_keys(prefix)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys(is_active)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_api_rate_limits_key ON api_rate_limits(api_key_id)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_api_rate_limits_window ON api_rate_limits(window_start)`;

        // Add metrics columns to websites table if they don't exist
        try {
            await sql`ALTER TABLE websites ADD COLUMN IF NOT EXISTS metrics_source TEXT DEFAULT 'manual'`;
            await sql`ALTER TABLE websites ADD COLUMN IF NOT EXISTS metrics_updated_at TIMESTAMPTZ`;
            await sql`ALTER TABLE websites ADD COLUMN IF NOT EXISTS referring_domains INTEGER`;
            await sql`ALTER TABLE websites ADD COLUMN IF NOT EXISTS spam_score INTEGER`;
            await sql`ALTER TABLE websites ADD COLUMN IF NOT EXISTS trust_flow INTEGER`;
            await sql`ALTER TABLE websites ADD COLUMN IF NOT EXISTS citation_flow INTEGER`;
        } catch (e) {
            console.log('Metrics columns may already exist:', e);
        }

        return NextResponse.json({
            success: true,
            message: 'API keys migration completed successfully',
            tables: ['api_keys', 'api_rate_limits'],
            indexes: [
                'idx_api_keys_user',
                'idx_api_keys_prefix',
                'idx_api_keys_active',
                'idx_api_rate_limits_key',
                'idx_api_rate_limits_window'
            ]
        });

    } catch (error) {
        console.error('Migration error:', error);
        return NextResponse.json({
            error: 'Migration failed',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
