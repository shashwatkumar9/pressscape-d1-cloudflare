export const runtime = "edge";

import { NextRequest, NextResponse } from 'next/server';
import { createPayPalOrder } from '@/lib/paypal';
import { validateRequest } from '@/lib/auth';
import { z } from 'zod';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';



const createOrderSchema = z.object({
    amount: z.number().positive(),
    currency: z.string().default('USD'),
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

        // Create PayPal order
        const paypalOrder = await createPayPalOrder(amount, currency);

        // Find approve link
        const approveLink = paypalOrder.links?.find((link: any) => link.rel === 'approve');

        return NextResponse.json({
            success: true,
            paypalOrderId: paypalOrder.id,
            approveUrl: approveLink?.href,
            orderId,
        });
    } catch (error) {
        console.error('PayPal create order error:', error);
        return NextResponse.json(
            { error: 'Failed to create PayPal order' },
            { status: 500 }
        );
    }
}
