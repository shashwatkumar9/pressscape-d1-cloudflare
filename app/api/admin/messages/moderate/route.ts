export const runtime = "edge";

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';
import { cookies } from 'next/headers';



async function getAdminSession() {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('admin_session')?.value;
    if (!sessionId) return null;
    const now = new Date().toISOString();
    const result = await sql`
    SELECT s.*, a.* FROM admin_sessions s
    JOIN admin_users a ON s.admin_id = a.id
    WHERE s.id = ${sessionId} AND s.expires_at > ${now}
  `;
    return result.rows[0] || null;
}

export async function POST(request: NextRequest) {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();
        const now = new Date().toISOString();

        const session = await getAdminSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { messageId, action, reason } = await request.json() as any;

        if (!messageId || !action || !['approve', 'reject'].includes(action)) {
            return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
        }

        const newStatus = action === 'approve' ? 'approved' : 'rejected';

        await sql`
      UPDATE order_messages 
      SET 
        status = ${newStatus},
        rejection_reason = ${reason || null},
        reviewed_by = ${session.id as string},
        reviewed_at = ${now},
        delivered_at = ${action === 'approve' ? new Date().toISOString() : null}
      WHERE id = ${messageId}
    `;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error moderating message:', error);
        return NextResponse.json({ error: 'Failed to moderate message' }, { status: 500 });
    }
}
