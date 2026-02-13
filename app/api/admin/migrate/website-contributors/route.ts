export const runtime = "edge";

import { NextRequest, NextResponse } from 'next/server';
import { sql , generateId } from '@/lib/db';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';



// POST /api/admin/migrate/website-contributors - Run the website contributors migration
export async function POST(request: NextRequest) {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();

        // Website Contributors table
        await sql`
      CREATE TABLE IF NOT EXISTS website_contributors (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        website_id TEXT NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        
        writing_price INTEGER NOT NULL,
        display_name TEXT,
        bio TEXT,
        specialties TEXT[] DEFAULT '{}',
        sample_work_url TEXT,
        
        total_orders INTEGER DEFAULT 0,
        completed_orders INTEGER DEFAULT 0,
        average_rating DECIMAL(2,1) DEFAULT 0,
        rating_count INTEGER DEFAULT 0,
        
        is_active BOOLEAN DEFAULT true,
        is_approved BOOLEAN DEFAULT false,
        approved_at TIMESTAMPTZ,
        rejected_at TIMESTAMPTZ,
        rejection_reason TEXT,
        
        turnaround_days INTEGER DEFAULT 5,
        
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        
        UNIQUE(website_id, user_id)
      )
    `;

        // Create indexes
        await sql`CREATE INDEX IF NOT EXISTS idx_website_contributors_website ON website_contributors(website_id)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_website_contributors_user ON website_contributors(user_id)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_website_contributors_active ON website_contributors(website_id, is_active, is_approved)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_website_contributors_rating ON website_contributors(website_id, average_rating DESC)`;

        // Add selected_contributor_id to orders if not exists
        try {
            await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS selected_contributor_id TEXT REFERENCES website_contributors(id)`;
        } catch {
            // Column may already exist
        }

        // Create index for contributor orders
        await sql`CREATE INDEX IF NOT EXISTS idx_orders_contributor ON orders(selected_contributor_id) WHERE selected_contributor_id IS NOT NULL`;

        return NextResponse.json({
            success: true,
            message: 'Website contributors migration completed successfully'
        });
    } catch (error) {
        console.error('Migration error:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Migration failed'
        }, { status: 500 });
    }
}
