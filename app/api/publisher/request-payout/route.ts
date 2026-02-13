export const runtime = "edge";

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';
import { validateRequest } from '@/lib/auth';
import { z } from 'zod';



const MIN_PAYOUT = parseInt(process.env.MINIMUM_PAYOUT_AMOUNT || '5000'); // $50 in cents

const requestPayoutSchema = z.object({
    amount: z.number().positive().min(MIN_PAYOUT),
});

export async function POST(request: NextRequest) {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();

        const { user } = await validateRequest();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json() as any;
        const result = requestPayoutSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: 'Invalid request', details: result.error.issues },
                { status: 400 }
            );
        }

        const { amount } = result.data;

        // Get payout settings
        const settingsResult = await sql`
            SELECT *
            FROM payout_settings
            WHERE user_id = ${user.id} AND is_active = 1 = true
        `;

        if (settingsResult.rows.length === 0) {
            return NextResponse.json(
                { error: 'Please configure your payout settings first' },
                { status: 400 }
            );
        }

        const settings = settingsResult.rows[0];
        const payoutEmail = settings.payout_method === 'paypal'
            ? settings.paypal_email
            : settings.payoneer_email;

        if (!payoutEmail) {
            return NextResponse.json(
                { error: 'Payout email not configured' },
                { status: 400 }
            );
        }

        // Check user balance
        const userResult = await sql`
            SELECT publisher_balance
            FROM users
            WHERE id = ${user.id}
        `;

        const publisherBalance = parseInt(String((userResult.rows[0] as { publisher_balance?: number })?.publisher_balance || 0));

        if (publisherBalance < amount) {
            return NextResponse.json(
                { error: `Insufficient balance. Available: $${(publisherBalance / 100).toFixed(2)}` },
                { status: 400 }
            );
        }

        // Check for pending payout requests
        const pendingCheck = await sql`
            SELECT COUNT(*) as count
            FROM payout_requests
            WHERE user_id = ${user.id} 
            AND status IN ('pending', 'processing')
        `;

        if (parseInt(String((pendingCheck.rows[0] as { count: unknown }).count)) > 0) {
            return NextResponse.json(
                { error: 'You already have a pending payout request' },
                { status: 400 }
            );
        }

        // Create payout request
        const payoutResult = await sql`
            INSERT INTO payout_requests (
                user_id, amount, payout_method, payout_email, status, created_at
            )
            VALUES (
                ${user.id}, ${amount}, ${settings.payout_method}, ${payoutEmail}, 'pending', NOW()
            )
            RETURNING id
        `;

        const payoutRequestId = (payoutResult.rows[0] as { id: string }).id;

        // Deduct from publisher balance (hold in escrow)
        await sql`
            UPDATE users
            SET publisher_balance = publisher_balance - ${amount}
            WHERE id = ${user.id}
        `;

        // TODO: Send email notification to admin

        return NextResponse.json({
            success: true,
            payoutRequestId,
            amount,
            message: 'Payout request submitted successfully. Admin will process it shortly.',
        });
    } catch (error) {
        console.error('Request payout error:', error);
        return NextResponse.json(
            { error: 'Failed to process payout request' },
            { status: 500 }
        );
    }
}

// Get payout history
export async function GET(request: NextRequest) {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();

        const { user } = await validateRequest();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const result = await sql`
            SELECT 
                id, amount, payout_method, payout_email, status,
                processed_at, created_at
            FROM payout_requests
            WHERE user_id = ${user.id}
            ORDER BY created_at DESC
            LIMIT 50
        `;

        return NextResponse.json({
            payouts: result.rows,
        });
    } catch (error) {
        console.error('Get payout history error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch payout history' },
            { status: 500 }
        );
    }
}
