export const runtime = "edge";

import { NextRequest, NextResponse } from 'next/server';
import { createRazorpayOrder } from '@/lib/razorpay';
import { validateRequest } from '@/lib/auth';
import { z } from 'zod';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';



const createOrderSchema = z.object({
    amount: z.number().positive(),
    currency: z.string().default('INR'),
    orderId: z.string(), // Our internal order ID
});

export async function POST(request: NextRequest) {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();

        // Validate user session
        const { user } = await validateRequest();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Parse and validate request
        const body = await request.json() as any;
        const result = createOrderSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: 'Invalid request', details: result.error.issues },
                { status: 400 }
            );
        }

        const { amount, currency, orderId } = result.data;

        // Create Razorpay order
        const razorpayOrder = await createRazorpayOrder(
            amount,
            currency,
            `order_${orderId}`
        );

        return NextResponse.json({
            success: true,
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            orderId,
        });
    } catch (error) {
        console.error('Razorpay create order error:', error);
        return NextResponse.json(
            { error: 'Failed to create Razorpay order' },
            { status: 500 }
        );
    }
}
