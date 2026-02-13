export const runtime = "edge";

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';
import { cookies } from 'next/headers';
import {

    sendOrderAcceptedBuyerEmail,
    sendOrderCompletedBuyerEmail,
    sendOrderCancelledPublisherEmail
} from '@/lib/email';


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
 * PATCH /api/orders/[orderId]/status
 * Update order status and send appropriate emails
 *
 * Body: { status: 'accepted' | 'writing' | 'published' | 'completed' | 'cancelled', reason?: string, publishedUrl?: string }
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ orderId: string }> }
) {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();

        const { orderId } = await params;
        const session = await getSession();

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json() as any;
        const { status, reason, publishedUrl } = body;

        // Validate status
        const validStatuses = ['accepted', 'writing', 'published', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        // Get order with buyer and publisher info
        const orderResult = await sql`
            SELECT 
                o.*,
                buyer.email as buyer_email,
                buyer.name as buyer_name,
                publisher.email as publisher_email,
                publisher.name as publisher_name,
                w.domain as website_domain
            FROM orders o
            JOIN users buyer ON o.buyer_id = buyer.id
            JOIN users publisher ON o.publisher_id = publisher.id
            JOIN websites w ON o.website_id = w.id
            WHERE o.id = ${orderId}
        `;

        if (orderResult.rows.length === 0) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        const order = orderResult.rows[0] as Record<string, unknown>;

        // Verify user has permission (publisher can update their orders, buyer can cancel)
        const isPublisher = order.publisher_id === session.user_id;
        const isBuyer = order.buyer_id === session.user_id;

        if (!isPublisher && !isBuyer) {
            return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
        }

        // Only publisher can accept/complete, buyer can only cancel pending
        if (['accepted', 'writing', 'published', 'completed'].includes(status) && !isPublisher) {
            return NextResponse.json({ error: 'Only publisher can update to this status' }, { status: 403 });
        }

        if (status === 'cancelled' && isBuyer && order.status !== 'pending') {
            return NextResponse.json({ error: 'Can only cancel pending orders' }, { status: 400 });
        }

        // Update order status with appropriate timestamp (D1 pattern)
        const now = new Date().toISOString();

        if (status === 'accepted') {
            await sql`
                UPDATE orders SET status = ${status}, accepted_at = ${now}, updated_at = ${now}
                WHERE id = ${orderId}
            `;
        } else if (status === 'published') {
            // Set 3-day buyer confirmation deadline and 90-day dispute protection
            const confirmDeadline = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
            const disputeDeadline = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();

            await sql`
                UPDATE orders SET
                    status = ${status},
                    article_url = ${publishedUrl || null},
                    published_at = ${now},
                    buyer_confirmation_deadline = ${confirmDeadline},
                    dispute_protection_until = ${disputeDeadline},
                    updated_at = ${now}
                WHERE id = ${orderId}
            `;
        } else if (status === 'completed') {
            await sql`
                UPDATE orders SET status = ${status}, completed_at = ${now}, updated_at = ${now}
                WHERE id = ${orderId}
            `;
        } else if (status === 'cancelled') {
            await sql`
                UPDATE orders SET status = ${status}, cancellation_reason = ${reason || null}, cancelled_at = ${now}, updated_at = ${now}
                WHERE id = ${orderId}
            `;
        } else {
            await sql`
                UPDATE orders SET status = ${status}, updated_at = ${now}
                WHERE id = ${orderId}
            `;
        }

        // Send email notifications
        if (status === 'accepted') {
            sendOrderAcceptedBuyerEmail(
                order.buyer_email as string,
                order.buyer_name as string,
                order.order_number as string,
                order.website_domain as string
            ).catch(console.error);
        } else if (status === 'completed' || status === 'published') {
            sendOrderCompletedBuyerEmail(
                order.buyer_email as string,
                order.buyer_name as string,
                order.order_number as string,
                order.website_domain as string,
                publishedUrl || order.article_url as string || ''
            ).catch(console.error);
        } else if (status === 'cancelled') {
            // Notify publisher if buyer cancelled
            if (isBuyer) {
                sendOrderCancelledPublisherEmail(
                    order.publisher_email as string,
                    order.publisher_name as string,
                    order.order_number as string,
                    reason || 'Buyer cancelled the order'
                ).catch(console.error);
            }
        }

        return NextResponse.json({
            success: true,
            message: `Order ${status}`
        });

    } catch (error) {
        console.error('Error updating order status:', error);
        return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
    }
}
