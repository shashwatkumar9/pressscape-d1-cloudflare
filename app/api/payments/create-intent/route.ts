export const runtime = "edge";

import { NextRequest, NextResponse } from 'next/server';
import { createPaymentIntent } from '@/lib/stripe';
import { sql } from '@/lib/db';
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

export async function POST(request: NextRequest) {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();
        const now = new Date().toISOString();

        const session = await getSession();

        if (!session) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const body = await request.json() as any;
        const { website_id, order_type, amount } = body;

        // Validate required fields
        if (!website_id || !order_type || !amount) {
            return NextResponse.json(
                { error: 'Missing required fields: website_id, order_type, amount' },
                { status: 400 }
            );
        }

        // Validate amount is positive
        if (amount <= 0) {
            return NextResponse.json(
                { error: 'Amount must be greater than 0' },
                { status: 400 }
            );
        }

        // Get website to verify it exists and is active
        const websiteResult = await sql`
      SELECT id, domain, owner_id FROM websites 
      WHERE id = ${website_id} AND is_active = true
    `;

        if (websiteResult.rows.length === 0) {
            return NextResponse.json(
                { error: 'Website not found or inactive' },
                { status: 404 }
            );
        }

        // Create Payment Intent
        const paymentIntent = await createPaymentIntent(amount, {
            website_id,
            order_type,
            buyer_id: session.user_id as string,
        });

        return NextResponse.json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
        });
    } catch (error) {
        console.error('Error creating payment intent:', error);
        return NextResponse.json(
            { error: 'Failed to create payment intent' },
            { status: 500 }
        );
    }
}
