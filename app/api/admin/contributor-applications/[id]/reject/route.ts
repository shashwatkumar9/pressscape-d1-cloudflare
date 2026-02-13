export const runtime = "edge";

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';
import { validateAdminRequest } from '@/lib/admin-auth';
import { z } from 'zod';



const rejectSchema = z.object({
    reason: z.string().min(1, 'Rejection reason is required'),
});

export async function POST(
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
        const body = await request.json() as any;
        const result = rejectSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: 'Rejection reason is required' },
                { status: 400 }
            );
        }

        const { reason } = result.data;

        // Get application
        const appResult = await sql`
            SELECT * FROM websites
            WHERE id = ${id}
            AND ownership_type = 'contributor'
        `;

        if (appResult.rows.length === 0) {
            return NextResponse.json({ error: 'Application not found' }, { status: 404 });
        }

        const app = appResult.rows[0];

        if (app.verification_status !== 'pending') {
            return NextResponse.json({ error: 'Application already processed' }, { status: 400 });
        }

        // Reject application
        await sql`
            UPDATE websites
            SET 
                verification_status = 'rejected',
                reviewed_by = ${admin.id},
                admin_review_notes = ${reason}
            WHERE id = ${id}
        `;

        // TODO: Send rejection email to user with reason

        return NextResponse.json({
            success: true,
            message: 'Application rejected',
        });
    } catch (error) {
        console.error('Reject application error:', error);
        return NextResponse.json(
            { error: 'Failed to reject application' },
            { status: 500 }
        );
    }
}
