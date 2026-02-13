export const runtime = "edge";

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
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

// GET /api/buyer/blacklist - List user's blacklisted publishers
export async function GET() {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();
        const now = new Date().toISOString();

        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const result = await sql`
            SELECT 
                b.id,
                b.website_id,
                b.domain,
                b.reason,
                b.created_at,
                w.name,
                w.category
            FROM blacklists b
            LEFT JOIN websites w ON b.website_id = w.id
            WHERE b.user_id = ${session.user_id}
            ORDER BY b.created_at DESC
        `;

        return NextResponse.json({ blacklist: result.rows });
    } catch (error) {
        console.error('Error fetching blacklist:', error);
        return NextResponse.json({ error: 'Failed to fetch blacklist' }, { status: 500 });
    }
}

// POST /api/buyer/blacklist - Add to blacklist
export async function POST(request: NextRequest) {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();
        const now = new Date().toISOString();

        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json() as any;
        const { website_id, domain, reason } = body;

        if (!website_id && !domain) {
            return NextResponse.json({ error: 'Website ID or domain required' }, { status: 400 });
        }

        // Check if already blacklisted
        const existing = await sql`
            SELECT id FROM blacklists 
            WHERE user_id = ${session.user_id} 
            AND (website_id = ${website_id || null} OR domain = ${domain || null})
        `;

        if (existing.rows.length > 0) {
            return NextResponse.json({ error: 'Already blacklisted' }, { status: 409 });
        }

        // Get domain from website if only ID provided
        let actualDomain = domain;
        if (website_id && !domain) {
            const websiteResult = await sql`SELECT domain FROM websites WHERE id = ${website_id}`;
            actualDomain = websiteResult.rows[0]?.domain;
        }

        const result = await sql`
            INSERT INTO blacklists (user_id, website_id, domain, reason)
            VALUES (${session.user_id}, ${website_id || null}, ${actualDomain || null}, ${reason || null})
            RETURNING id
        `;

        // Log activity
        await sql`
            INSERT INTO activity_logs (user_id, action, description, model_type, model_id)
            VALUES (
                ${session.user_id}, 
                'blacklist_add', 
                ${'Added publisher to blacklist: ' + (actualDomain || website_id)},
                'blacklist',
                ${result.rows[0].id}
            )
        `;

        return NextResponse.json({
            success: true,
            blacklist_id: result.rows[0].id
        });
    } catch (error) {
        console.error('Error adding to blacklist:', error);
        return NextResponse.json({ error: 'Failed to add to blacklist' }, { status: 500 });
    }
}

// DELETE /api/buyer/blacklist - Remove from blacklist
export async function DELETE(request: NextRequest) {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();
        const now = new Date().toISOString();

        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const website_id = searchParams.get('website_id');

        if (!id && !website_id) {
            return NextResponse.json({ error: 'ID or website_id required' }, { status: 400 });
        }

        const result = await sql`
            DELETE FROM blacklists 
            WHERE user_id = ${session.user_id} 
            AND (id = ${id || ''} OR website_id = ${website_id || ''})
            RETURNING id
        `;

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Not found in blacklist' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error removing from blacklist:', error);
        return NextResponse.json({ error: 'Failed to remove from blacklist' }, { status: 500 });
    }
}
