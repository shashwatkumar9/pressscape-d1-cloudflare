export const runtime = "edge";

import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';



// POST /api/admin/migrate/marketplace-quality - Add quality metrics columns
export async function POST() {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();

        // Add quality metrics columns to websites one by one using template literal syntax
        await sql`ALTER TABLE websites ADD COLUMN IF NOT EXISTS completion_rate DECIMAL(5,2) DEFAULT 100`;
        await sql`ALTER TABLE websites ADD COLUMN IF NOT EXISTS avg_delivery_days DECIMAL(4,1)`;
        await sql`ALTER TABLE websites ADD COLUMN IF NOT EXISTS acceptance_rate DECIMAL(5,2) DEFAULT 100`;
        await sql`ALTER TABLE websites ADD COLUMN IF NOT EXISTS revision_limit INTEGER DEFAULT 2`;
        await sql`ALTER TABLE websites ADD COLUMN IF NOT EXISTS is_indexed BOOLEAN DEFAULT true`;
        await sql`ALTER TABLE websites ADD COLUMN IF NOT EXISTS traffic_trend TEXT DEFAULT 'stable'`;
        await sql`ALTER TABLE websites ADD COLUMN IF NOT EXISTS anchor_types_allowed TEXT[]`;
        await sql`ALTER TABLE websites ADD COLUMN IF NOT EXISTS link_positions TEXT[]`;
        await sql`ALTER TABLE websites ADD COLUMN IF NOT EXISTS admin_boost_score INTEGER DEFAULT 0`;
        await sql`ALTER TABLE websites ADD COLUMN IF NOT EXISTS homepage_link_available BOOLEAN DEFAULT false`;

        // Create index for performance
        await sql`CREATE INDEX IF NOT EXISTS idx_websites_quality ON websites(completion_rate DESC, average_rating DESC)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_websites_boost ON websites(admin_boost_score DESC, is_featured DESC)`;

        return NextResponse.json({
            success: true,
            message: 'Marketplace quality migration applied successfully',
            columns: [
                'completion_rate', 'avg_delivery_days', 'acceptance_rate', 'revision_limit',
                'is_indexed', 'traffic_trend', 'anchor_types_allowed', 'link_positions',
                'admin_boost_score', 'homepage_link_available'
            ]
        });
    } catch (error) {
        console.error('Marketplace quality migration error:', error);
        return NextResponse.json(
            {
                error: 'Failed to apply migration',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
