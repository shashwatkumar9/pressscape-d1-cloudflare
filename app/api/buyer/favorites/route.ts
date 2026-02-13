export const runtime = "edge";

import { NextRequest, NextResponse } from 'next/server';
import { sql, generateId } from '@/lib/db';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';
import { cookies } from 'next/headers';



async function getSession() {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('auth_session')?.value;
    if (!sessionId) return null;

    const now = new Date().toISOString();
    const result = await sql`
        SELECT s.user_id FROM sessions s
        WHERE s.id = ${sessionId} AND s.expires_at > ${now}
    `;
    return result.rows[0] || null;
}

// GET /api/buyer/favorites - List user's favorites
export async function GET() {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();

        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const result = await sql`
            SELECT 
                f.id,
                f.website_id,
                f.notes,
                f.created_at,
                w.domain,
                w.name,
                w.category,
                w.domain_authority,
                w.domain_rating,
                w.price_guest_post
            FROM favorites f
            JOIN websites w ON f.website_id = w.id
            WHERE f.user_id = ${session.user_id}
            ORDER BY f.created_at DESC
        `;

        return NextResponse.json({ favorites: result.rows });
    } catch (error) {
        console.error('Error fetching favorites:', error);
        return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 500 });
    }
}

// POST /api/buyer/favorites - Add a favorite
export async function POST(request: NextRequest) {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();

        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json() as any;
        const { website_id, notes } = body;

        if (!website_id) {
            return NextResponse.json({ error: 'Website ID required' }, { status: 400 });
        }

        // Check if already exists
        const existing = await sql`
            SELECT id FROM favorites 
            WHERE user_id = ${session.user_id} AND website_id = ${website_id}
        `;

        if (existing.rows.length > 0) {
            return NextResponse.json({ error: 'Already in favorites' }, { status: 409 });
        }

        const favoriteId = generateId();
        await sql`
            INSERT INTO favorites (id, user_id, website_id, notes)
            VALUES (${favoriteId}, ${session.user_id}, ${website_id}, ${notes || null})
        `;

        return NextResponse.json({
            success: true,
            favorite_id: favoriteId
        });
    } catch (error) {
        console.error('Error adding favorite:', error);
        return NextResponse.json({ error: 'Failed to add favorite' }, { status: 500 });
    }
}
