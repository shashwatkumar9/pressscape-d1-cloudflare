export const runtime = "edge";

import { NextResponse } from 'next/server';
import { sql , generateId } from '@/lib/db';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';
import { validateAdminRequest } from '@/lib/admin-auth';



/**
 * POST /api/admin/migrate/payouts
 * Run payouts table migration
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

        // Create payouts table
        await sql`
            CREATE TABLE IF NOT EXISTS payouts (
                id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
                user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                amount INTEGER NOT NULL,
                payout_method TEXT NOT NULL CHECK (payout_method IN ('paypal', 'payoneer', 'wallet_transfer', 'bank_transfer')),
                payout_email TEXT,
                balance_type TEXT NOT NULL CHECK (balance_type IN ('publisher', 'affiliate', 'contributor')),
                status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
                transaction_id TEXT,
                notes TEXT,
                processed_at TIMESTAMPTZ,
                created_at TIMESTAMPTZ DEFAULT NOW()
            )
        `;

        // Create indexes
        await sql`CREATE INDEX IF NOT EXISTS idx_payouts_user ON payouts(user_id)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_payouts_status ON payouts(status)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_payouts_created ON payouts(created_at)`;

        // Add payout columns to users if not exists
        try {
            await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS paypal_email TEXT`;
        } catch (e) { /* column may already exist */ }

        try {
            await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS payoneer_email TEXT`;
        } catch (e) { /* column may already exist */ }

        return NextResponse.json({
            success: true,
            message: 'Payouts migration completed successfully',
            tables_created: ['payouts'],
            indexes_created: ['idx_payouts_user', 'idx_payouts_status', 'idx_payouts_created']
        });

    } catch (error) {
        console.error('Migration error:', error);
        return NextResponse.json({
            error: 'Migration failed',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
