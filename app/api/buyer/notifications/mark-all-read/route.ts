export const runtime = "edge";

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';
import { cookies } from 'next/headers';



// Helper to get session
async function getSession() {
    const now = new Date().toISOString();
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('auth_session')?.value;
    if (!sessionId) return null;

    const result = await sql`
        SELECT s.user_id, u.name, u.email
        FROM sessions s
        JOIN users u ON s.user_id = u.id
        WHERE s.id = ${sessionId} AND s.expires_at > '${now}'
    `;
    return result.rows[0] || null;
}

// PUT /api/buyer/notifications/mark-all-read - Mark all notifications as read
export async function PUT() {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();
        const now = new Date().toISOString();

        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user_id as string;

        const result = await sql`
            UPDATE notifications
            SET is_read = 1, read_at = ${now}
            WHERE user_id = ${userId} AND is_read = 0
        `;

        return NextResponse.json({
            success: true,
            marked_count: result.rowCount
        });
    } catch (error) {
        console.error('Mark all notifications read error:', error);
        return NextResponse.json(
            { error: 'Failed to mark notifications as read' },
            { status: 500 }
        );
    }
}
