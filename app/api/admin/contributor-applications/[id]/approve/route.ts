export const runtime = "edge";

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';
import { validateAdminRequest } from '@/lib/admin-auth';
import { z } from 'zod';



const approveSchema = z.object({
    reviewNotes: z.string().optional(),
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
        const result = approveSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
        }

        const { reviewNotes } = result.data;

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

        // Approve application
        await sql`
            UPDATE websites
            SET 
                verification_status = 'verified',
                verification_method = 'admin_approved',
                verified_at = ${now},
                reviewed_by = ${admin.id},
                admin_review_notes = ${reviewNotes || null}
            WHERE id = ${id}
        `;

        // TODO: Send approval email to user

        return NextResponse.json({
            success: true,
            message: 'Contributor application approved successfully',
        });
    } catch (error) {
        console.error('Approve application error:', error);
        return NextResponse.json(
            { error: 'Failed to approve application' },
            { status: 500 }
        );
    }
}
