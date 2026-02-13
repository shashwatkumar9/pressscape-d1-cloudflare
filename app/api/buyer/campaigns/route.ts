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
    SELECT s.*, u.* FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.id = ${sessionId} AND s.expires_at > '${now}'
  `;
    return result.rows[0] || null;
}

export async function GET(request: NextRequest) {
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

        if (id) {
            const campaignResult = await sql`
        SELECT * FROM campaigns WHERE id = ${id} AND buyer_id = ${session.user_id as string}
      `;
            if (campaignResult.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
            return NextResponse.json(campaignResult.rows[0]);
        }

        const result = await sql`
      SELECT c.*, COUNT(o.id) as order_count 
      FROM campaigns c
      LEFT JOIN orders o ON c.id = o.campaign_id
      WHERE c.buyer_id = ${session.user_id as string}
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `;

        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Error fetching campaigns:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();
        const now = new Date().toISOString();

        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { name, url } = await request.json() as any;

        if (!name) {
            return NextResponse.json({ error: 'Campaign name is required' }, { status: 400 });
        }

        const result = await sql`
      INSERT INTO campaigns (buyer_id, name, url)
      VALUES (${session.user_id as string}, ${name}, ${url})
      RETURNING *
    `;

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error('Error creating campaign:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
