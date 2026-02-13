export const runtime = "edge";

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';
import { cookies } from 'next/headers';



async function getSession() {
    const now = new Date().toISOString();
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('auth_session')?.value;
    if (!sessionId) return null;

    const result = await sql`
        SELECT s.user_id FROM sessions s
        WHERE s.id = ${sessionId} AND s.expires_at > ${now}
    `;
    return result.rows[0] || null;
}

// DELETE /api/buyer/favorites/[id] - Remove a favorite
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();
        const now = new Date().toISOString();

        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Check if it's a favorite ID or website ID and handle both
        const result = await sql`
            DELETE FROM favorites 
            WHERE user_id = ${session.user_id} 
            AND (id = ${id} OR website_id = ${id})
            RETURNING id
        `;

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Favorite not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error removing favorite:', error);
        return NextResponse.json({ error: 'Failed to remove favorite' }, { status: 500 });
    }
}
