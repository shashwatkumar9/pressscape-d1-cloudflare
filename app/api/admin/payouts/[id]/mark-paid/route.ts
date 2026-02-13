export const runtime = "edge";

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';
import { validateAdminRequest } from '@/lib/admin-auth';
import { z } from 'zod';



const markPaidSchema = z.object({
    adminNotes: z.string().optional(),
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
        const result = markPaidSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: 'Invalid request' },
                { status: 400 }
            );
        }

        const { adminNotes } = result.data;

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

        if (payout.status === 'completed') {
            return NextResponse.json({ error: 'Payout already completed' }, { status: 400 });
        }

        // Update payout request
        await sql`
            UPDATE payout_requests
            SET 
                status = 'completed',
                processed_by = ${admin.id},
                processed_at = ${now},
                admin_notes = ${adminNotes || null},
                updated_at = ${now}
            WHERE id = ${id}
        `;

        // Create transaction record
        await sql`
            INSERT INTO transactions (
                user_id, type, amount, status, description, created_at
            )
            VALUES (
                ${payout.user_id}, 'withdrawal', ${payout.amount}, 'completed',
                'Publisher payout via ' || ${payout.payout_method}, NOW()
            )
        `;

        // TODO: Send confirmation email to publisher

        return NextResponse.json({
            success: true,
            message: 'Payout marked as paid successfully',
        });
    } catch (error) {
        console.error('Mark payout as paid error:', error);
        return NextResponse.json(
            { error: 'Failed to mark payout as paid' },
            { status: 500 }
        );
    }
}
