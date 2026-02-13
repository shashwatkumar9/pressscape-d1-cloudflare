export const runtime = "edge";

import { NextRequest, NextResponse } from 'next/server';
import { capturePayPalOrder } from '@/lib/paypal';
import { sql } from '@/lib/db';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';
import { validateRequest } from '@/lib/auth';
import { z } from 'zod';



const captureSchema = z.object({
    paypalOrderId: z.string(),
    orderId: z.string(), // Our internal order ID
});

export async function POST(request: NextRequest) {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();
        const now = new Date().toISOString();

        // Validate user session
        const { user } = await validateRequest();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Parse and validate request
        const body = await request.json() as any;
        const result = captureSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: 'Invalid request', details: result.error.issues },
                { status: 400 }
            );
        }

        const { paypalOrderId, orderId } = result.data;

        // Verify order belongs to user
        const orderCheck = await sql`
            SELECT id, buyer_id, total_amount, payment_status
            FROM orders
            WHERE id = ${orderId} AND buyer_id = ${user.id}
        `;

        if (orderCheck.rows.length === 0) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        const order = orderCheck.rows[0];

        if (order.payment_status === 'paid') {
            return NextResponse.json({ error: 'Order already paid' }, { status: 400 });
        }

        // Capture PayPal payment
        const captureResult = await capturePayPalOrder(paypalOrderId);

        if (captureResult.status !== 'COMPLETED') {
            return NextResponse.json(
                { error: 'Payment not completed', status: captureResult.status },
                { status: 400 }
            );
        }

        // Update order
        await sql`
            UPDATE orders
            SET 
                payment_status = 'paid',
                payment_gateway = 'paypal',
                paypal_order_id = ${paypalOrderId},
                paid_at = ${now},
                updated_at = ${now}
            WHERE id = ${orderId}
        `;

        // Create transaction record
        await sql`
            INSERT INTO transactions (
                order_id, user_id, type, amount, status, payment_method,
                paypal_transaction_id, created_at
            )
            VALUES (
                ${orderId}, ${user.id}, 'payment', ${order.total_amount}, 'completed', 'paypal',
                ${captureResult.id}, NOW()
            )
        `;

        return NextResponse.json({
            success: true,
            captureId: captureResult.id,
            status: captureResult.status,
        });
    } catch (error) {
        console.error('PayPal capture error:', error);
        return NextResponse.json(
            { error: 'Failed to capture PayPal payment' },
            { status: 500 }
        );
    }
}
