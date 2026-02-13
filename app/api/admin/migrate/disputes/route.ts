export const runtime = "edge";

import { NextRequest, NextResponse } from 'next/server';
import { sql , generateId } from '@/lib/db';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';



// Run the disputes migration
export async function GET(request: NextRequest) {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();

        // Add buyer confirmation columns to orders
        await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS buyer_confirmation_deadline TIMESTAMPTZ`;
        await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS buyer_confirmed_at TIMESTAMPTZ`;
        await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS buyer_rejected_at TIMESTAMPTZ`;
        await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS buyer_rejection_reason TEXT`;
        await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS dispute_protection_until TIMESTAMPTZ`;

        // Create disputes table
        await sql`
            CREATE TABLE IF NOT EXISTS disputes (
                id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
                order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
                raised_by TEXT NOT NULL REFERENCES users(id),
                raised_by_role TEXT NOT NULL CHECK (raised_by_role IN ('buyer', 'publisher')),
                reason TEXT NOT NULL CHECK (reason IN (
                    'link_removed', 'content_changed', 'wrong_url', 'nofollow_added',
                    'terms_violated', 'quality_issues', 'deadline_missed', 'other'
                )),
                description TEXT NOT NULL,
                evidence_urls TEXT[] DEFAULT '{}',
                status TEXT DEFAULT 'open' CHECK (status IN (
                    'open', 'under_review', 'awaiting_response', 
                    'resolved_buyer', 'resolved_publisher', 'closed'
                )),
                respondent_id TEXT REFERENCES users(id),
                respondent_comment TEXT,
                responded_at TIMESTAMPTZ,
                admin_notes TEXT,
                resolution TEXT,
                refund_amount INTEGER DEFAULT 0,
                resolved_by TEXT REFERENCES users(id),
                resolved_at TIMESTAMPTZ,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            )
        `;

        // Create indexes
        await sql`CREATE INDEX IF NOT EXISTS idx_disputes_order_id ON disputes(order_id)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_disputes_status ON disputes(status)`;

        return NextResponse.json({
            success: true,
            message: 'Disputes migration completed successfully',
        });
    } catch (error) {
        console.error('Migration error:', error);
        return NextResponse.json(
            { error: 'Migration failed', details: String(error) },
            { status: 500 }
        );
    }
}
