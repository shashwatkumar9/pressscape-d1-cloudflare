export const runtime = "edge";

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';
import { validateRequest } from '@/lib/auth';



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

        // Mark all messages in this conversation as read (except user's own messages)
        await sql`
            UPDATE messages
            SET is_read = 1
            WHERE conversation_id = ${id}
            AND sender_id != ${user.id}
            AND is_read = 0
        `;

        return NextResponse.json({
            success: true,
        });
    } catch (error) {
        console.error('Mark messages read error:', error);
        return NextResponse.json(
            { error: 'Failed to mark messages as read' },
            { status: 500 }
        );
    }
}
