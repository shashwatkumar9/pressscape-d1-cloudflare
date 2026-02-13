export const runtime = "edge";

import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';
import { validateAdminRequest } from '@/lib/admin-auth';



export async function POST() {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();

        // Check admin authentication
        const { admin } = await validateAdminRequest();
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Update websites table
        await sql`
            ALTER TABLE websites
            ADD COLUMN IF NOT EXISTS ownership_type TEXT DEFAULT 'owner' CHECK (ownership_type IN ('owner', 'contributor')),
            ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
            ADD COLUMN IF NOT EXISTS verification_method TEXT CHECK (verification_method IN ('google_analytics', 'html_file', 'dns_txt', 'admin_approved')),
            ADD COLUMN IF NOT EXISTS verification_token TEXT,
            ADD COLUMN IF NOT EXISTS contributor_application TEXT,
            ADD COLUMN IF NOT EXISTS admin_review_notes TEXT,
            ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
            ADD COLUMN IF NOT EXISTS reviewed_by TEXT REFERENCES admin_users(id)
        `;

        // Create indexes
        await sql`CREATE INDEX IF NOT EXISTS idx_websites_verification_status ON websites(verification_status)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_websites_ownership_type ON websites(ownership_type)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_websites_pending_verification ON websites(verification_status) WHERE verification_status = 'pending'`;

        return NextResponse.json({
            success: true,
            message: 'Website verification schema migration completed successfully',
        });
    } catch (error) {
        console.error('Verification migration error:', error);
        return NextResponse.json(
            {
                error: 'Failed to run migration',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
