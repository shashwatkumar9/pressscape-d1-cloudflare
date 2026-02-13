export const runtime = "edge";

import { NextRequest, NextResponse } from 'next/server';
import { sql, generateId } from '@/lib/db';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';
import { validateRequest } from '@/lib/auth';



// POST - Buyer rejects/requests revision on the published order
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ orderId: string }> }
) {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();

        const { user } = await validateRequest();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { orderId } = await params;
        const body = await request.json() as any;
        const { reason } = body;

        if (!reason || reason.trim().length < 10) {
            return NextResponse.json(
                { error: 'Please provide a detailed reason (at least 10 characters)' },
                { status: 400 }
            );
        }

        // Get order and verify ownership
        const orderResult = await sql`
            SELECT * FROM orders 
            WHERE id = ${orderId} AND buyer_id = ${user.id}
        `;

        if (orderResult.rows.length === 0) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        const order = orderResult.rows[0];

        // Verify order is in published status
        if (order.status !== 'published') {
            return NextResponse.json(
                { error: 'Order is not in published status' },
                { status: 400 }
            );
        }

        // Update order to revision_needed
        const now = new Date().toISOString();
        await sql`
            UPDATE orders
            SET
                status = 'revision_needed',
                buyer_rejected_at = ${now},
                buyer_rejection_reason = ${reason},
                buyer_confirmation_deadline = NULL,
                updated_at = ${now}
            WHERE id = ${orderId}
        `;

        // Create a message in the conversation to notify publisher
        const conversationResult = await sql`
            SELECT id FROM conversations WHERE order_id = ${orderId}
        `;

        if (conversationResult.rows.length > 0) {
            const conversationId = conversationResult.rows[0].id;
            const messageId = generateId();

            await sql`
                INSERT INTO messages (
                    id, conversation_id, sender_id, message, created_at
                ) VALUES (
                    ${messageId},
                    ${conversationId},
                    ${user.id},
                    ${'[REVISION REQUESTED] ' + reason},
                    ${now}
                )
            `;

            await sql`
                UPDATE conversations
                SET last_message_at = ${now}
                WHERE id = ${conversationId}
            `;
        }

        return NextResponse.json({
            success: true,
            message: 'Revision requested. Publisher has been notified.',
        });
    } catch (error) {
        console.error('Reject order error:', error);
        return NextResponse.json(
            { error: 'Failed to reject order' },
            { status: 500 }
        );
    }
}
