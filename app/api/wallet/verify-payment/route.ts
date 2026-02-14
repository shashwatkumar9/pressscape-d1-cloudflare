export const runtime = 'edge';

// NOTE: This route uses Razorpay SDK which requires Node.js
// export const runtime = "edge";

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';
import { cookies } from 'next/headers';
import Stripe from 'stripe';



const stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY)
    : null;

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
 * GET /api/wallet/verify-payment
 * Verify a Stripe payment and credit wallet if not already done
 */
export async function GET(request: NextRequest) {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();

        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const paymentIntentId = request.nextUrl.searchParams.get('payment_intent');

        if (!paymentIntentId) {
            return NextResponse.json({ error: 'Missing payment_intent' }, { status: 400 });
        }

        if (!stripe) {
            return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
        }

        // Retrieve the payment intent from Stripe
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (paymentIntent.status !== 'succeeded') {
            return NextResponse.json({
                success: false,
                error: 'Payment not completed',
                status: paymentIntent.status
            }, { status: 400 });
        }

        // Check if this payment was already processed
        const existingTransaction = await sql`
            SELECT id FROM transactions 
            WHERE stripe_payment_intent_id = ${paymentIntentId}
            LIMIT 1
        `;

        if (existingTransaction.rows.length > 0) {
            // Already processed
            return NextResponse.json({ success: true, already_processed: true });
        }

        // Verify this payment belongs to the current user
        if (paymentIntent.metadata.user_id !== session.user_id) {
            return NextResponse.json({ error: 'Payment does not belong to this user' }, { status: 403 });
        }

        // Calculate bonus based on tiers:
        // No bonus till $1000 (100000 cents), 3% for $1000+, 5% for $2500+, 10% for $5000+
        const amountInCents = paymentIntent.amount;
        let bonusRate = 0;
        if (amountInCents >= 500000) bonusRate = 0.10;      // $5000+
        else if (amountInCents >= 250000) bonusRate = 0.05; // $2500+
        else if (amountInCents >= 100000) bonusRate = 0.03; // $1000+

        const bonusAmount = Math.round(amountInCents * bonusRate);
        const totalCredit = amountInCents + bonusAmount;

        // Get current balance
        const userResult = await sql`
            SELECT buyer_balance FROM users WHERE id = ${session.user_id}
        `;
        const currentBalance = parseInt(userResult.rows[0]?.buyer_balance as string) || 0;

        // Update balance
        await sql`
            UPDATE users 
            SET buyer_balance = buyer_balance + ${totalCredit}
            WHERE id = ${session.user_id}
        `;

        // Record the transaction
        await sql`
            INSERT INTO transactions (
                user_id, type, amount, balance_type, 
                balance_before, balance_after,
                stripe_payment_intent_id, description, status
            ) VALUES (
                ${session.user_id}, 'deposit', ${totalCredit}, 'buyer',
                ${currentBalance}, ${currentBalance + totalCredit},
                ${paymentIntentId}, 
                ${bonusAmount > 0 ? 'Wallet recharge with 5% bonus' : 'Wallet recharge'}, 
                'completed'
            )
        `;

        return NextResponse.json({
            success: true,
            credited: totalCredit,
            bonus: bonusAmount
        });

    } catch (error) {
        console.error('Error verifying payment:', error);
        return NextResponse.json({
            error: 'Failed to verify payment',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
