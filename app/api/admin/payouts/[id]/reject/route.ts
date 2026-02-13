export const runtime = "edge";

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';
import { validateAdminRequest } from '@/lib/admin-auth';
import { z } from 'zod';



const rejectSchema = z.object({
    reason: z.string().min(1),
});

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();
        const now = new Date().toISOString();

        const { admin } = await validateAdminRequest();
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json() as any;
        const result = rejectSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: 'Rejection reason is required' },
                { status: 400 }
            );
        }

        const { reason } = result.data;

        // Get payout request
        const payoutResult = await sql`
            SELECT *
            FROM payout_requests
            WHERE id = ${id}
        `;

        if (payoutResult.rows.length === 0) {
            return NextResponse.json({ error: 'Payout not found' }, { status: 404 });
        }

        const payout = payoutResult.rows[0];

        if (payout.status === 'completed' || payout.status === 'rejected') {
            return NextResponse.json({ error: 'Payout already processed' }, { status: 400 });
        }

        // Update payout request
        await sql`
            UPDATE payout_requests
            SET 
                status = 'rejected',
                processed_by = ${admin.id},
                processed_at = ${now},
                admin_notes = ${reason},
                updated_at = ${now}
            WHERE id = ${id}
        `;

        // Return amount to publisher balance
        await sql`
            UPDATE users
            SET publisher_balance = publisher_balance + ${payout.amount}
            WHERE id = ${payout.user_id}
        `;

        // TODO: Send rejection email to publisher

        return NextResponse.json({
            success: true,
            message: 'Payout request rejected',
        });
    } catch (error) {
        console.error('Reject payout error:', error);
        return NextResponse.json(
            { error: 'Failed to reject payout' },
            { status: 500 }
        );
    }
}
