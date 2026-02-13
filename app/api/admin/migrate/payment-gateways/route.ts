export const runtime = "edge";

import { NextResponse } from 'next/server';
import { sql , generateId } from '@/lib/db';
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

        // Run migrations
        await sql`
            ALTER TABLE orders 
            ADD COLUMN IF NOT EXISTS payment_gateway TEXT DEFAULT 'stripe' CHECK (payment_gateway IN ('stripe', 'paypal', 'razorpay')),
            ADD COLUMN IF NOT EXISTS paypal_order_id TEXT,
            ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT,
            ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT
        `;

        await sql`
            CREATE TABLE IF NOT EXISTS payout_settings (
              id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
              user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
              payout_method TEXT NOT NULL CHECK (payout_method IN ('paypal', 'payoneer')),
              paypal_email TEXT,
              payoneer_email TEXT,
              is_active BOOLEAN DEFAULT true,
              created_at TIMESTAMPTZ DEFAULT NOW(),
              updated_at TIMESTAMPTZ DEFAULT NOW(),
              UNIQUE(user_id)
            )
        `;

        await sql`
            CREATE TABLE IF NOT EXISTS payout_requests (
              id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
              user_id TEXT NOT NULL REFERENCES users(id),
              amount INTEGER NOT NULL,
              payout_method TEXT NOT NULL CHECK (payout_method IN ('paypal', 'payoneer')),
              payout_email TEXT NOT NULL,
              status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled', 'rejected')),
              processed_by TEXT REFERENCES admin_users(id),
              processed_at TIMESTAMPTZ,
              admin_notes TEXT,
              created_at TIMESTAMPTZ DEFAULT NOW(),
              updated_at TIMESTAMPTZ DEFAULT NOW()
            )
        `;

        // Create indexes
        await sql`CREATE INDEX IF NOT EXISTS idx_orders_payment_gateway ON orders(payment_gateway)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_orders_paypal_order_id ON orders(paypal_order_id)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id ON orders(razorpay_order_id)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_payout_settings_user_id ON payout_settings(user_id)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_payout_requests_user_id ON payout_requests(user_id)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_payout_requests_status ON payout_requests(status)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_payout_requests_created_at ON payout_requests(created_at DESC)`;

        return NextResponse.json({
            success: true,
            message: 'Payment gateway schema migration completed successfully',
        });
    } catch (error) {
        console.error('Migration error:', error);
        return NextResponse.json(
            {
                error: 'Failed to run migration',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
