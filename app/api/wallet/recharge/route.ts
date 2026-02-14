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
 * POST /api/wallet/recharge
 * Initiate wallet recharge via payment gateway
 *
 * Body: {
 *   amount: number (in dollars),
 *   payment_method: 'stripe' | 'paypal' | 'razorpay'
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
        const { amount, payment_method = 'stripe' } = body;

        // Validate amount (minimum $5, maximum $10000)
        if (!amount || amount < 5 || amount > 10000) {
            return NextResponse.json({
                error: 'Invalid amount. Minimum $5, maximum $10,000'
            }, { status: 400 });
        }

        const amountInCents = Math.round(amount * 100);

        if (payment_method === 'stripe') {
            if (!stripe) {
                return NextResponse.json({
                    error: 'Stripe not configured'
                }, { status: 500 });
            }

            // Create Stripe Payment Intent for wallet recharge
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amountInCents,
                currency: 'usd',
                metadata: {
                    type: 'wallet_recharge',
                    user_id: session.user_id as string,
                    user_email: session.email as string
                },
                automatic_payment_methods: {
                    enabled: true,
                },
            });

            return NextResponse.json({
                success: true,
                payment_method: 'stripe',
                client_secret: paymentIntent.client_secret,
                payment_intent_id: paymentIntent.id,
                amount: amountInCents
            });
        }

        if (payment_method === 'paypal') {
            // PayPal integration for wallet recharge
            const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
            const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
            const PAYPAL_API = process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com';

            if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
                return NextResponse.json({ error: 'PayPal not configured' }, { status: 500 });
            }

            // Get PayPal access token
            const authResponse = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64')}`
                },
                body: 'grant_type=client_credentials'
            });
            const authData = await authResponse.json() as any;

            // Create PayPal order
            const orderResponse = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authData.access_token}`
                },
                body: JSON.stringify({
                    intent: 'CAPTURE',
                    purchase_units: [{
                        amount: {
                            currency_code: 'USD',
                            value: amount.toFixed(2)
                        },
                        description: 'PressScape Wallet Recharge'
                    }]
                })
            });
            const orderData = await orderResponse.json() as any;

            return NextResponse.json({
                success: true,
                payment_method: 'paypal',
                order_id: orderData.id,
                amount: amountInCents
            });
        }

        if (payment_method === 'razorpay') {
            const Razorpay = require('razorpay');
            const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
            const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

            if (!razorpayKeyId || !razorpayKeySecret) {
                return NextResponse.json({ error: 'Razorpay not configured' }, { status: 500 });
            }

            const razorpay = new Razorpay({
                key_id: razorpayKeyId,
                key_secret: razorpayKeySecret
            });

            const order = await razorpay.orders.create({
                amount: amountInCents, // Razorpay uses paise for INR, cents for USD
                currency: 'USD',
                notes: {
                    type: 'wallet_recharge',
                    user_id: session.user_id as string
                }
            });

            return NextResponse.json({
                success: true,
                payment_method: 'razorpay',
                order_id: order.id,
                key_id: razorpayKeyId,
                amount: amountInCents
            });
        }

        return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 });

    } catch (error) {
        console.error('Error initiating wallet recharge:', error);
        return NextResponse.json({
            error: 'Failed to initiate recharge',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
