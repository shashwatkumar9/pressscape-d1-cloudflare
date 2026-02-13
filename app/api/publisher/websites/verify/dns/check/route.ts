export const runtime = "edge";

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';
import { validateRequest } from '@/lib/auth';
import { verifyDnsTxt } from '@/lib/dns-verify';



export async function POST(request: NextRequest) {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();
        const now = new Date().toISOString();

        const { user } = await validateRequest();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json() as any;
        const { websiteId } = body;

        if (!websiteId) {
            return NextResponse.json({ error: 'Website ID is required' }, { status: 400 });
        }

        // Get website with token
        const websiteResult = await sql`
            SELECT id, domain, verification_token
            FROM websites
            WHERE id = ${websiteId} AND user_id = ${user.id}
        `;

        if (websiteResult.rows.length === 0) {
            return NextResponse.json({ error: 'Website not found' }, { status: 404 });
        }

        const website = websiteResult.rows[0] as { domain: string; verification_token: string | null };

        if (!website.verification_token) {
            return NextResponse.json(
                { error: 'Verification not initialized. Please generate TXT record first.' },
                { status: 400 }
            );
        }

        // Verify DNS TXT record
        const isVerified = await verifyDnsTxt(website.domain, website.verification_token);

        if (!isVerified) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'DNS TXT record not found. Please ensure the record is added and DNS has propagated (5-10 minutes).',
                },
                { status: 400 }
            );
        }

        // Update verification status
        await sql`
            UPDATE websites
            SET 
                verification_status = 'verified',
                verified_at = ${now}
            WHERE id = ${websiteId}
        `;

        return NextResponse.json({
            success: true,
            message: 'Website verified successfully via DNS!',
        });
    } catch (error) {
        console.error('DNS verification check error:', error);
        return NextResponse.json(
            { error: 'Failed to verify DNS record' },
            { status: 500 }
        );
    }
}
