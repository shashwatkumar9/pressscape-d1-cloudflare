export const runtime = "edge";

import { NextRequest, NextResponse } from 'next/server';
import { sql, generateId } from '@/lib/db';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';
import { cookies } from 'next/headers';



async function getSession() {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('auth_session')?.value;
    if (!sessionId) return null;

    const now = new Date().toISOString();
    const result = await sql`
        SELECT s.*, u.* FROM sessions s
        JOIN users u ON s.user_id = u.id
        WHERE s.id = ${sessionId} AND s.expires_at > ${now}
    `;
    return result.rows[0] || null;
}

/**
 * GET /api/wallet
 * Get current wallet balance
 */
export async function GET() {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();

        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        return NextResponse.json({
            balance: (session.buyer_balance as number) || 0,
            balanceFormatted: `$${(((session.buyer_balance as number) || 0) / 100).toFixed(2)}`,
            currency: 'USD'
        });
    } catch (error) {
        console.error('Error fetching wallet balance:', error);
        return NextResponse.json({ error: 'Failed to fetch balance' }, { status: 500 });
    }
}

/**
 * POST /api/wallet
 * Add funds to wallet (after successful payment verification)
 *
 * Body: {
 *   amount: number (in cents),
 *   payment_intent_id?: string,
 *   payment_method: 'stripe' | 'paypal' | 'razorpay',
 *   transaction_id: string
 * }
 */
export async function POST(request: NextRequest) {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();

        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json() as any;
        const { amount, payment_method, transaction_id } = body;

        if (!amount || amount <= 0) {
            return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
        }

        if (!transaction_id) {
            return NextResponse.json({ error: 'Transaction ID required' }, { status: 400 });
        }

        // Check if transaction already processed
        const existingTx = await sql`
            SELECT id FROM balance_transactions WHERE reference_id = ${transaction_id}
        `;
        if (existingTx.rows.length > 0) {
            return NextResponse.json({ error: 'Transaction already processed' }, { status: 400 });
        }

        const currentBalance = (session.buyer_balance as number) || 0;
        const newBalance = currentBalance + amount;

        // Update balance
        await sql`
            UPDATE users SET buyer_balance = ${newBalance} WHERE id = ${session.user_id}
        `;

        // Log transaction
        const txId = generateId();
        const now = new Date().toISOString();
        await sql`
            INSERT INTO balance_transactions (
                id, user_id, balance_type, transaction_type, amount,
                balance_before, balance_after, reference_id, description, created_at
            ) VALUES (
                ${txId},
                ${session.user_id as string},
                'buyer',
                'credit',
                ${amount},
                ${currentBalance},
                ${newBalance},
                ${transaction_id},
                ${'Wallet recharge via ' + payment_method},
                ${now}
            )
        `;

        return NextResponse.json({
            success: true,
            balance: newBalance,
            balanceFormatted: `$${(newBalance / 100).toFixed(2)}`,
            added: amount
        });
    } catch (error) {
        console.error('Error adding wallet funds:', error);
        return NextResponse.json({ error: 'Failed to add funds' }, { status: 500 });
    }
}
