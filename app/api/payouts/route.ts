export const runtime = "edge";

import { NextRequest, NextResponse } from 'next/server';
import { sql , generateId } from '@/lib/db';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';
import { cookies } from 'next/headers';



async function getSession() {
    const now = new Date().toISOString();
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('auth_session')?.value;
    if (!sessionId) return null;

    const result = await sql`
        SELECT s.*, u.* FROM sessions s
        JOIN users u ON s.user_id = u.id
        WHERE s.id = ${sessionId} AND s.expires_at > ${now}
    `;
    return result.rows[0] || null;
}

/**
 * GET /api/payouts
 * Get available balance for payout
 */
export async function GET() {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();
        const now = new Date().toISOString();

        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        return NextResponse.json({
            publisherBalance: (session.publisher_balance as number) || 0,
            affiliateBalance: (session.affiliate_balance as number) || 0,
            buyerBalance: (session.buyer_balance as number) || 0,
            publisherBalanceFormatted: `$${(((session.publisher_balance as number) || 0) / 100).toFixed(2)}`,
            affiliateBalanceFormatted: `$${(((session.affiliate_balance as number) || 0) / 100).toFixed(2)}`,
            buyerBalanceFormatted: `$${(((session.buyer_balance as number) || 0) / 100).toFixed(2)}`,
        });
    } catch (error) {
        console.error('Error fetching balances:', error);
        return NextResponse.json({ error: 'Failed to fetch balances' }, { status: 500 });
    }
}

/**
 * POST /api/payouts
 * Request payout via PayPal, Payoneer, or transfer to buyer wallet
 * 
 * Body: {
 *   amount: number (in cents),
 *   balance_type: 'publisher' | 'affiliate',
 *   payout_method: 'paypal' | 'payoneer' | 'wallet_transfer',
 *   payout_email?: string (for paypal/payoneer)
 * }
 */
export async function POST(request: NextRequest) {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();
        const now = new Date().toISOString();

        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json() as any;
        const { amount, balance_type, payout_method, payout_email } = body;

        // Validate
        if (!amount || amount <= 0) {
            return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
        }

        if (!['publisher', 'affiliate'].includes(balance_type)) {
            return NextResponse.json({ error: 'Invalid balance type' }, { status: 400 });
        }

        if (!['paypal', 'payoneer', 'wallet_transfer'].includes(payout_method)) {
            return NextResponse.json({ error: 'Invalid payout method' }, { status: 400 });
        }

        if (['paypal', 'payoneer'].includes(payout_method) && !payout_email) {
            return NextResponse.json({ error: 'Email required for external payouts' }, { status: 400 });
        }

        // Check balance
        const balanceField = balance_type === 'publisher' ? 'publisher_balance' : 'affiliate_balance';
        const currentBalance = (session[balanceField] as number) || 0;

        if (currentBalance < amount) {
            return NextResponse.json({
                error: 'Insufficient balance',
                available: currentBalance,
                requested: amount
            }, { status: 400 });
        }

        const newBalance = currentBalance - amount;

        if (payout_method === 'wallet_transfer') {
            // Transfer to buyer wallet
            const currentBuyerBalance = (session.buyer_balance as number) || 0;
            const newBuyerBalance = currentBuyerBalance + amount;

            // Update balances based on balance type
            if (balance_type === 'publisher') {
                await sql`
                    UPDATE users SET 
                        publisher_balance = ${newBalance},
                        buyer_balance = ${newBuyerBalance}
                    WHERE id = ${session.user_id}
                `;
            } else {
                await sql`
                    UPDATE users SET 
                        affiliate_balance = ${newBalance},
                        buyer_balance = ${newBuyerBalance}
                    WHERE id = ${session.user_id}
                `;
            }

            // Log both transactions
            await sql`
                INSERT INTO balance_transactions (id, user_id, balance_type, transaction_type, amount, balance_before, balance_after, description, created_at)
                VALUES 
                    (gen_random_uuid()::text, ${session.user_id as string}, ${balance_type}, 'debit', ${amount}, ${currentBalance}, ${newBalance}, 'Transfer to buyer wallet', NOW()),
                    (gen_random_uuid()::text, ${session.user_id as string}, 'buyer', 'credit', ${amount}, ${currentBuyerBalance}, ${newBuyerBalance}, ${'Transfer from ' + balance_type + ' earnings'}, NOW())
            `;

            return NextResponse.json({
                success: true,
                message: 'Transferred to buyer wallet',
                newPublisherBalance: balance_type === 'publisher' ? newBalance : (session.publisher_balance as number) || 0,
                newAffiliateBalance: balance_type === 'affiliate' ? newBalance : (session.affiliate_balance as number) || 0,
                newBuyerBalance: newBuyerBalance
            });

        } else {
            // External payout (PayPal/Payoneer)
            // Create payout request (to be processed by admin)
            await sql`
                INSERT INTO payouts (
                    id, user_id, amount, payout_method, payout_email,
                    balance_type, status, created_at
                ) VALUES (
                    gen_random_uuid()::text,
                    ${session.user_id as string},
                    ${amount},
                    ${payout_method},
                    ${payout_email},
                    ${balance_type},
                    'pending',
                    NOW()
                )
            `;

            // Deduct from balance based on type
            if (balance_type === 'publisher') {
                await sql`
                    UPDATE users SET publisher_balance = ${newBalance}
                    WHERE id = ${session.user_id}
                `;
            } else {
                await sql`
                    UPDATE users SET affiliate_balance = ${newBalance}
                    WHERE id = ${session.user_id}
                `;
            }

            // Log transaction
            await sql`
                INSERT INTO balance_transactions (id, user_id, balance_type, transaction_type, amount, balance_before, balance_after, description, created_at)
                VALUES (gen_random_uuid()::text, ${session.user_id as string}, ${balance_type}, 'debit', ${amount}, ${currentBalance}, ${newBalance}, ${payout_method.toUpperCase() + ' payout request'}, NOW())
            `;

            return NextResponse.json({
                success: true,
                message: `Payout request submitted. Will be processed within 3-5 business days.`,
                payout_method: payout_method,
                payout_email: payout_email,
                amount: amount,
                newBalance: newBalance
            });
        }

    } catch (error) {
        console.error('Error processing payout:', error);
        return NextResponse.json({
            error: 'Failed to process payout',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
