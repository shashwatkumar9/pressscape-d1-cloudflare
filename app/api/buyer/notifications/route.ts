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

// GET /api/buyer/notifications - List notifications
export async function GET(request: NextRequest) {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();
        const now = new Date().toISOString();

        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user_id as string;
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const perPage = parseInt(searchParams.get('per_page') || '20');
        const unreadOnly = searchParams.get('unread_only') === 'true';

        const offset = (page - 1) * perPage;

        let notifications;
        let totalCount;

        if (unreadOnly) {
            notifications = await sql`
                SELECT * FROM notifications
                WHERE user_id = ${userId} AND is_read = 0
                ORDER BY created_at DESC
                LIMIT ${perPage} OFFSET ${offset}
            `;
            totalCount = await sql`
                SELECT COUNT(*) as count FROM notifications
                WHERE user_id = ${userId} AND is_read = 0
            `;
        } else {
            notifications = await sql`
                SELECT * FROM notifications
                WHERE user_id = ${userId}
                ORDER BY created_at DESC
                LIMIT ${perPage} OFFSET ${offset}
            `;
            totalCount = await sql`
                SELECT COUNT(*) as count FROM notifications
                WHERE user_id = ${userId}
            `;
        }

        // Get unread count
        const unreadResult = await sql`
            SELECT COUNT(*) as count FROM notifications
            WHERE user_id = ${userId} AND is_read = 0
        `;

        return NextResponse.json({
            notifications: notifications.rows,
            pagination: {
                page,
                per_page: perPage,
                total: parseInt(totalCount.rows[0]?.count as string) || 0,
                total_pages: Math.ceil((parseInt(totalCount.rows[0]?.count as string) || 0) / perPage),
            },
            unread_count: parseInt(unreadResult.rows[0]?.count as string) || 0,
        });
    } catch (error) {
        console.error('List notifications error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch notifications' },
            { status: 500 }
        );
    }
}
