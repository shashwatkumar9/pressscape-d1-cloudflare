export const runtime = "edge";

import { NextResponse } from 'next/server';
import { sql , generateId } from '@/lib/db';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';



/**
 * GET /api/admin/run-messaging-migration
 * Runs the messaging system migration to create conversations and messages tables
 */
export async function GET() {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();

        // Create conversations table
        await sql`
            CREATE TABLE IF NOT EXISTS conversations (
                id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
                order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
                buyer_id TEXT NOT NULL REFERENCES users(id),
                publisher_id TEXT NOT NULL REFERENCES users(id),
                created_at TIMESTAMPTZ DEFAULT NOW(),
                last_message_at TIMESTAMPTZ DEFAULT NOW(),
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
                created_at TIMESTAMPTZ DEFAULT NOW()
            )
        `;

        // Create indexes
        await sql`CREATE INDEX IF NOT EXISTS idx_conversations_order ON conversations(order_id)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_conversations_buyer ON conversations(buyer_id)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_conversations_publisher ON conversations(publisher_id)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_messages_read ON messages(is_read)`;

        // Create conversations for existing orders
        await sql`
            INSERT INTO conversations (order_id, buyer_id, publisher_id)
            SELECT o.id, o.buyer_id, o.publisher_id
            FROM orders o
            WHERE NOT EXISTS (
                SELECT 1 FROM conversations c WHERE c.order_id = o.id
            )
        `;

        return NextResponse.json({
            success: true,
            message: '✅ Messaging system migration completed successfully!'
        });
    } catch (error) {
        console.error('Migration error:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
