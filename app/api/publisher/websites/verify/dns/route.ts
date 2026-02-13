// NOTE: This route uses Node.js dns module
// export const runtime = "edge"; // Disabled - requires Node.js for DNS operations

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';
import { validateRequest } from '@/lib/auth';
import { generateVerificationToken } from '@/lib/html-file-verify';
import { generateDnsTxtInstruction } from '@/lib/dns-verify';



export async function POST(request: NextRequest) {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();

        const { user } = await validateRequest();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json() as any;
        const { websiteId } = body;

        if (!websiteId) {
            return NextResponse.json({ error: 'Website ID is required' }, { status: 400 });
        }

        // Verify user owns this website
        const websiteCheck = await sql`
            SELECT id, domain FROM websites
            WHERE id = ${websiteId} AND user_id = ${user.id}
        `;

        if (websiteCheck.rows.length === 0) {
            return NextResponse.json({ error: 'Website not found' }, { status: 404 });
        }

        // Generate verification token
        const token = generateVerificationToken();

        // Store token in database
        await sql`
            UPDATE websites
            SET 
                verification_token = ${token},
                verification_method = 'dns_txt'
            WHERE id = ${websiteId}
        `;

        // Generate DNS TXT record instruction
        const txtRecord = generateDnsTxtInstruction(token);

        return NextResponse.json({
            success: true,
            token,
            txtRecord,
            instructions: [
                `Log in to your DNS provider (e.g., Cloudflare, GoDaddy, Namecheap)`,
                `Add a new TXT record for your domain: ${websiteCheck.rows[0].domain}`,
                `Set the value to: ${txtRecord}`,
                `Wait 5-10 minutes for DNS propagation`,
                `Click "Verify" button below to complete verification`,
            ],
        });
    } catch (error) {
        console.error('DNS verification initialization error:', error);
        return NextResponse.json(
            { error: 'Failed to initialize verification' },
            { status: 500 }
        );
    }
}
