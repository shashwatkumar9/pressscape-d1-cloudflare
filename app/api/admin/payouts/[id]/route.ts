export const runtime = "edge";

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';
import { validateAdminRequest } from '@/lib/admin-auth';



export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();

        const { admin } = await validateAdminRequest();
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        const result = await sql`
            SELECT 
                pr.*,
                u.name as publisher_name,
                u.email as publisher_email
            FROM payout_requests pr
            JOIN users u ON pr.user_id = u.id
            WHERE pr.id = ${id}
        `;

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Payout not found' }, { status: 404 });
        }

        return NextResponse.json({ payout: result.rows[0] });
    } catch (error) {
        console.error('Get payout error:', error);
        return NextResponse.json({ error: 'Failed to fetch payout' }, { status: 500 });
    }
}
