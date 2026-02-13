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
    WHERE s.id = ${sessionId} AND s.expires_at > ${now}
  `;
    return result.rows[0] || null;
}

export async function GET(
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

        // Get campaign details
        const campaignResult = await sql`
      SELECT * FROM campaigns WHERE id = ${id} AND buyer_id = ${session.user_id as string}
    `;

        if (campaignResult.rows.length === 0) {
            return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
        }

        // Get orders in this campaign
        const ordersResult = await sql`
        SELECT 
            o.id, o.order_type, o.status, o.total_amount, o.created_at, 
            w.domain as website_domain
        FROM orders o
        JOIN websites w ON o.website_id = w.id
        WHERE o.campaign_id = ${id} AND o.buyer_id = ${session.user_id as string}
        ORDER BY o.created_at DESC
    `;

        return NextResponse.json({
            campaign: campaignResult.rows[0],
            orders: ordersResult.rows
        });
    } catch (error) {
        console.error('Error fetching campaign details:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
