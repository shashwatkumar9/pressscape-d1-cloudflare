export const runtime = "edge";

import { NextResponse } from 'next/server';
import { sql , generateId } from '@/lib/db';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';
import { validateAdminRequest } from '@/lib/admin-auth';



export async function POST() {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();

        // Check admin authentication
        const { admin } = await validateAdminRequest();
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Create conversations table
        await sql`
            CREATE TABLE IF NOT EXISTS conversations (
              id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
              order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
              buyer_id TEXT NOT NULL REFERENCES users(id),
              publisher_id TEXT NOT NULL REFERENCES users(id),
              last_message_at TIMESTAMPTZ,
              created_at TIMESTAMPTZ DEFAULT NOW(),
              UNIQUE(order_id)
            )
        `;

        // Create messages table
        await sql`
            CREATE TABLE IF NOT EXISTS messages (
              id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
              conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
              sender_id TEXT NOT NULL REFERENCES users(id),
              message TEXT NOT NULL,
              is_read BOOLEAN DEFAULT false,
              attachments JSONB DEFAULT '[]',
              created_at TIMESTAMPTZ DEFAULT NOW()
            )
        `;

        // Create indexes
        await sql`CREATE INDEX IF NOT EXISTS idx_conversations_order ON conversations(order_id)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_conversations_buyer ON conversations(buyer_id)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_conversations_publisher ON conversations(publisher_id)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at DESC)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(conversation_id, is_read) WHERE is_read = false`;
        await sql`CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id)`;

        return NextResponse.json({
            success: true,
            message: 'Messaging system schema migration completed successfully',
        });
    } catch (error) {
        console.error('Messaging migration error:', error);
        return NextResponse.json(
            {
                error: 'Failed to run migration',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
