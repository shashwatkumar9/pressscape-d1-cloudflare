export const runtime = "edge";

import { NextRequest, NextResponse } from 'next/server';
import { sql, intToBool } from '@/lib/db';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';
import { validateRequest } from '@/lib/auth';



// Get all conversations for the current user
export async function GET(request: NextRequest) {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();

        const { user } = await validateRequest();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get conversations where user is buyer or publisher
        const result = await sql`
            SELECT 
                c.*,
                o.order_number,
                o.website_id,
                w.domain as website_domain,
                buyer.name as buyer_name,
                buyer.avatar_url as buyer_avatar,
                publisher.name as publisher_name,
                publisher.avatar_url as publisher_avatar,
                (
                    SELECT COUNT(*)
                    FROM messages m
                    WHERE m.conversation_id = c.id
                    AND m.is_read = 0
                    AND m.sender_id != ${user.id}
                ) as unread_count
            FROM conversations c
            JOIN orders o ON c.order_id = o.id
            JOIN websites w ON o.website_id = w.id
            JOIN users buyer ON c.buyer_id = buyer.id
            JOIN users publisher ON c.publisher_id = publisher.id
            WHERE c.buyer_id = ${user.id} OR c.publisher_id = ${user.id}
            ORDER BY c.last_message_at DESC NULLS LAST, c.created_at DESC
        `;

        return NextResponse.json({
            conversations: result.rows,
        });
    } catch (error) {
        console.error('Get conversations error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch conversations' },
            { status: 500 }
        );
    }
}

// Create a new conversation (usually auto-created with order)
export async function POST(request: NextRequest) {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();

        const { user } = await validateRequest();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json() as any;
        const { orderId } = body;

        if (!orderId) {
            return NextResponse.json(
                { error: 'Order ID is required' },
                { status: 400 }
            );
        }

        // Get order details
        const orderResult = await sql`
            SELECT buyer_id, publisher_id
            FROM orders
            WHERE id = ${orderId}
        `;

        if (orderResult.rows.length === 0) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        const order = orderResult.rows[0];

        // Verify user is buyer or publisher
        if (order.buyer_id !== user.id && order.publisher_id !== user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Create or get existing conversation (D1 pattern)
        const now = new Date().toISOString();
        const conversationId = require('crypto').randomUUID();

        // Try to insert, if conflict just select existing
        try {
            await sql`
                INSERT INTO conversations (
                    id, order_id, buyer_id, publisher_id, created_at
                )
                VALUES (
                    ${conversationId}, ${orderId}, ${order.buyer_id}, ${order.publisher_id}, ${now}
                )
            `;
        } catch (e) {
            // Already exists, ignore error
        }

        // Fetch the conversation
        const conversationResult = await sql`
            SELECT * FROM conversations WHERE order_id = ${orderId}
        `;

        // Determine user's role for this conversation
        const userRole = order.buyer_id === user.id ? 'buyer' : 'publisher';

        return NextResponse.json({
            success: true,
            conversation: {
                ...conversationResult.rows[0],
                userRole
            },
        });
    } catch (error) {
        console.error('Create conversation error:', error);
        return NextResponse.json(
            { error: 'Failed to create conversation' },
            { status: 500 }
        );
    }
}
