export const runtime = "edge";

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { sql } from '@/lib/db';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';
import { verifyLink } from '@/lib/verify-link';



interface Order {
    id: string;
    buyer_id: string;
    publisher_id: string;
    article_url: string | null;
    target_url: string;
    anchor_text: string;
    status: string;
}

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
 * POST: Trigger link verification for an order
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ orderId: string }> }
) {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();

        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { orderId } = await params;

        // Get order details
        const orderResult = await sql`
            SELECT id, buyer_id, publisher_id, article_url, target_url, anchor_text, status
            FROM orders
            WHERE id = ${orderId}
        `;

        if (orderResult.rows.length === 0) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        const order = orderResult.rows[0] as unknown as Order;

        // Verify user has access (buyer or publisher)
        if (order.buyer_id !== session.user_id && order.publisher_id !== session.user_id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Check if order is in a verifiable state
        if (!['published', 'completed'].includes(order.status)) {
            return NextResponse.json(
                { error: 'Order must be published to verify link' },
                { status: 400 }
            );
        }

        // Check if article URL is set
        if (!order.article_url) {
            return NextResponse.json(
                { error: 'No article URL set for this order' },
                { status: 400 }
            );
        }

        // Perform link verification
        const result = await verifyLink(
            order.article_url,
            order.target_url,
            order.anchor_text
        );

        // Update order with verification result
        const now = new Date().toISOString();
        await sql`
            UPDATE orders
            SET
                link_verified = ${result.verified ? 1 : 0},
                link_verified_at = ${now},
                link_verification_error = ${result.error || null}
            WHERE id = ${orderId}
        `;

        return NextResponse.json({
            success: true,
            verified: result.verified,
            targetFound: result.targetFound,
            anchorMatched: result.anchorMatched,
            foundLinks: result.foundLinks,
            error: result.error,
        });
    } catch (error) {
        console.error('Error verifying link:', error);
        return NextResponse.json(
            { error: 'Failed to verify link' },
            { status: 500 }
        );
    }
}

/**
 * GET: Get verification status for an order
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ orderId: string }> }
) {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();

        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { orderId } = await params;

        const result = await sql`
            SELECT
                link_verified,
                link_verified_at,
                link_verification_error,
                article_url,
                target_url
            FROM orders
            WHERE id = ${orderId}
        `;

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        const order = result.rows[0] as {
            link_verified: number | null;
            link_verified_at: string | null;
            link_verification_error: string | null;
            article_url: string | null;
            target_url: string;
        };

        return NextResponse.json({
            verified: order.link_verified === 1,
            verifiedAt: order.link_verified_at,
            error: order.link_verification_error,
            articleUrl: order.article_url,
            targetUrl: order.target_url,
        });
    } catch (error) {
        console.error('Error fetching verification status:', error);
        return NextResponse.json(
            { error: 'Failed to fetch verification status' },
            { status: 500 }
        );
    }
}
