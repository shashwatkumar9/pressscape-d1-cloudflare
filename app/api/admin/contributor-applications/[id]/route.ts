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
                w.id,
                w.domain,
                w.contributor_application,
                w.verification_status,
                w.admin_review_notes,
                w.created_at,
                u.name as applicant_name,
                u.email as applicant_email,
                u.id as applicant_id
            FROM websites w
            JOIN users u ON w.user_id = u.id
            WHERE w.id = ${id}
            AND w.ownership_type = 'contributor'
        `;

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Application not found' }, { status: 404 });
        }

        return NextResponse.json({ application: result.rows[0] });
    } catch (error) {
        console.error('Get application error:', error);
        return NextResponse.json({ error: 'Failed to fetch application' }, { status: 500 });
    }
}
