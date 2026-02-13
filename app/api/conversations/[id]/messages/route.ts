export const runtime = "edge";

import { NextRequest, NextResponse } from 'next/server';
import { sql, generateId } from '@/lib/db';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';
import { validateRequest } from '@/lib/auth';
import { z } from 'zod';



const sendMessageSchema = z.object({
    message: z.string().min(1).max(5000),
    attachments: z.array(z.string().url()).optional(),
});

// Get messages for a conversation
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();

        const { user } = await validateRequest();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '50');
        const before = searchParams.get('before'); // For pagination

        // Verify user has access to this conversation
        const conversationCheck = await sql`
            SELECT buyer_id, publisher_id
            FROM conversations
            WHERE id = ${id}
        `;

        if (conversationCheck.rows.length === 0) {
            return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
        }

        const conversation = conversationCheck.rows[0];
        if (conversation.buyer_id !== user.id && conversation.publisher_id !== user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Get messages - build query based on pagination
        const result = before
            ? await sql`
                SELECT 
                    m.*,
                    u.name as sender_name,
                    u.avatar_url as sender_avatar
                FROM messages m
                JOIN users u ON m.sender_id = u.id
                WHERE m.conversation_id = ${id}
                AND m.created_at < (SELECT created_at FROM messages WHERE id = ${before})
                ORDER BY m.created_at DESC
                LIMIT ${limit}
            `
            : await sql`
                SELECT 
                    m.*,
                    u.name as sender_name,
                    u.avatar_url as sender_avatar
                FROM messages m
                JOIN users u ON m.sender_id = u.id
                WHERE m.conversation_id = ${id}
                ORDER BY m.created_at DESC
                LIMIT ${limit}
            `;

        // Return in chronological order (oldest first)
        const messages = result.rows.reverse();

        return NextResponse.json({
            messages,
            hasMore: result.rows.length === limit,
        });
    } catch (error) {
        console.error('Get messages error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch messages' },
            { status: 500 }
        );
    }
}

// Send a message
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();

        const { user } = await validateRequest();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json() as any;
        const result = sendMessageSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: 'Invalid message', details: result.error.issues },
                { status: 400 }
            );
        }

        const { message, attachments } = result.data;

        // Verify user has access to this conversation
        const conversationCheck = await sql`
            SELECT buyer_id, publisher_id
            FROM conversations
            WHERE id = ${id}
        `;

        if (conversationCheck.rows.length === 0) {
            return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
        }

        const conversation = conversationCheck.rows[0];
        if (conversation.buyer_id !== user.id && conversation.publisher_id !== user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Create message (D1 pattern)
        const messageId = generateId();
        const now = new Date().toISOString();

        await sql`
            INSERT INTO messages (
                id, conversation_id, sender_id, message, created_at
            )
            VALUES (
                ${messageId}, ${id}, ${user.id}, ${message}, ${now}
            )
        `;

        // Fetch the created message
        const messageResult = await sql`SELECT * FROM messages WHERE id = ${messageId}`;

        // Update conversation last_message_at
        await sql`
            UPDATE conversations
            SET last_message_at = ${now}
            WHERE id = ${id}
        `;

        // TODO: Send notification to other party

        return NextResponse.json({
            success: true,
            message: messageResult.rows[0],
        });
    } catch (error) {
        console.error('Send message error:', error);
        return NextResponse.json(
            { error: 'Failed to send message' },
            { status: 500 }
        );
    }
}
