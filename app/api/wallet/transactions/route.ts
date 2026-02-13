export const runtime = "edge";

import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
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
 * GET /api/wallet/transactions
 * Get wallet transaction history
 */
export async function GET() {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();

        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const result = await sql`
            SELECT id, transaction_type, amount, description, balance_before, balance_after, created_at
            FROM balance_transactions
            WHERE user_id = ${session.user_id} AND balance_type = 'buyer'
            ORDER BY created_at DESC
            LIMIT 50
        `;

        return NextResponse.json({
            transactions: result.rows
        });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
    }
}
