export const runtime = "edge";

import { NextRequest, NextResponse } from 'next/server';
import { verifyRazorpaySignature, getRazorpayPayment } from '@/lib/razorpay';
import { sql } from '@/lib/db';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';
import { validateRequest } from '@/lib/auth';
import { z } from 'zod';



const verifySchema = z.object({
    razorpayOrderId: z.string(),
    razorpayPaymentId: z.string(),
    razorpaySignature: z.string(),
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
        const result = verifySchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: 'Invalid request', details: result.error.issues },
                { status: 400 }
            );
        }

        const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = result.data;

        // Verify signature
        const isValid = verifyRazorpaySignature(
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature
        );

        if (!isValid) {
            return NextResponse.json(
                { error: 'Invalid signature' },
                { status: 400 }
            );
        }

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

        // Get payment details
        const payment = await getRazorpayPayment(razorpayPaymentId);

        if (payment.status !== 'captured' && payment.status !== 'authorized') {
            return NextResponse.json(
                { error: 'Payment not successful', status: payment.status },
                { status: 400 }
            );
        }

        // Update order
        await sql`
            UPDATE orders
            SET 
                payment_status = 'paid',
                payment_gateway = 'razorpay',
                razorpay_order_id = ${razorpayOrderId},
                razorpay_payment_id = ${razorpayPaymentId},
                paid_at = ${now},
                updated_at = ${now}
            WHERE id = ${orderId}
        `;

        // Create transaction record
        await sql`
            INSERT INTO transactions (
                order_id, user_id, type, amount, status, payment_method,
                razorpay_payment_id, created_at
            )
            VALUES (
                ${orderId}, ${user.id}, 'payment', ${order.total_amount}, 'completed', 'razorpay',
                ${razorpayPaymentId}, NOW()
            )
        `;

        return NextResponse.json({
            success: true,
            paymentId: razorpayPaymentId,
            status: payment.status,
        });
    } catch (error) {
        console.error('Razorpay verify error:', error);
        return NextResponse.json(
            { error: 'Failed to verify Razorpay payment' },
            { status: 500 }
        );
    }
}
