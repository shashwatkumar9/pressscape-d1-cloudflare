export const runtime = "edge";

import { NextRequest, NextResponse } from 'next/server';
import { sql, generateId } from '@/lib/db';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';
import { validateRequest } from '@/lib/auth';



// POST - Raise a dispute on an order
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
        const { reason, description, evidenceUrls = [] } = body;

        // Validate inputs
        if (!reason) {
            return NextResponse.json(
                { error: 'Dispute reason is required' },
                { status: 400 }
            );
        }

        if (!description || description.trim().length < 20) {
            return NextResponse.json(
                { error: 'Please provide a detailed description (at least 20 characters)' },
                { status: 400 }
            );
        }

        // Get order and verify user is buyer or publisher
        const orderResult = await sql`
            SELECT * FROM orders WHERE id = ${orderId}
        `;

        if (orderResult.rows.length === 0) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        const order = orderResult.rows[0];
        const isBuyer = order.buyer_id === user.id;
        const isPublisher = order.publisher_id === user.id;

        if (!isBuyer && !isPublisher) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const raisedByRole = isBuyer ? 'buyer' : 'publisher';

        // For buyers, check if within 90-day protection period
        if (isBuyer) {
            const protectionUntil = order.dispute_protection_until;
            if (protectionUntil && new Date(protectionUntil as string) < new Date()) {
                return NextResponse.json(
                    { error: 'The 90-day dispute protection period has expired for this order' },
                    { status: 400 }
                );
            }

            // Only completed/published orders can be disputed by buyers
            if (!['completed', 'published'].includes(order.status as string)) {
                return NextResponse.json(
                    { error: 'You can only dispute completed or published orders' },
                    { status: 400 }
                );
            }
        }

        // For publishers, check order status
        if (isPublisher) {
            if (!['revision_needed', 'disputed'].includes(order.status as string)) {
                return NextResponse.json(
                    { error: 'Publishers can only dispute orders in revision_needed status' },
                    { status: 400 }
                );
            }
        }

        // Check if there's already an open dispute
        const existingDispute = await sql`
            SELECT id FROM disputes 
            WHERE order_id = ${orderId} AND status IN ('open', 'under_review', 'awaiting_response')
        `;

        if (existingDispute.rows.length > 0) {
            return NextResponse.json(
                { error: 'There is already an open dispute for this order' },
                { status: 400 }
            );
        }

        // Create the dispute
        const disputeId = generateId();
        const now = new Date().toISOString();
        const evidenceUrlsJson = JSON.stringify(evidenceUrls);

        await sql`
            INSERT INTO disputes (
                id, order_id, raised_by, raised_by_role,
                reason, description, evidence_urls,
                status, created_at
            ) VALUES (
                ${disputeId},
                ${orderId},
                ${user.id},
                ${raisedByRole},
                ${reason},
                ${description},
                ${evidenceUrlsJson},
                'open',
                ${now}
            )
        `;

        // Fetch the created dispute
        const disputeResult = await sql`SELECT * FROM disputes WHERE id = ${disputeId}`;

        // Update order status to disputed
        await sql`
            UPDATE orders
            SET status = 'disputed', updated_at = ${now}
            WHERE id = ${orderId}
        `;

        return NextResponse.json({
            success: true,
            dispute: disputeResult.rows[0],
            message: 'Dispute submitted successfully. Our team will review it within 24-48 hours.',
        });
    } catch (error) {
        console.error('Create dispute error:', error);
        return NextResponse.json(
            { error: 'Failed to create dispute' },
            { status: 500 }
        );
    }
}

// GET - Get dispute for an order
export async function GET(
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

        // Verify user is buyer or publisher of this order
        const orderResult = await sql`
            SELECT buyer_id, publisher_id FROM orders WHERE id = ${orderId}
        `;

        if (orderResult.rows.length === 0) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        const order = orderResult.rows[0];
        if (order.buyer_id !== user.id && order.publisher_id !== user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Get disputes for this order
        const disputesResult = await sql`
            SELECT d.*, u.name as raised_by_name
            FROM disputes d
            JOIN users u ON d.raised_by = u.id
            WHERE d.order_id = ${orderId}
            ORDER BY d.created_at DESC
        `;

        return NextResponse.json({
            disputes: disputesResult.rows,
        });
    } catch (error) {
        console.error('Get disputes error:', error);
        return NextResponse.json(
            { error: 'Failed to get disputes' },
            { status: 500 }
        );
    }
}
