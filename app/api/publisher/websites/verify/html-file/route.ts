export const runtime = "edge";

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';
import { validateRequest } from '@/lib/auth';
import { generateVerificationToken, generateVerificationHtml } from '@/lib/html-file-verify';



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
                verification_method = 'html_file'
            WHERE id = ${websiteId}
        `;

        // Generate HTML file content
        const htmlContent = generateVerificationHtml(token);
        const filename = `pressscape-verify-${token}.html`;

        return NextResponse.json({
            success: true,
            token,
            filename,
            htmlContent,
            instructions: [
                `Download the file: ${filename}`,
                `Upload it to your website's root directory`,
                `Make sure it's accessible at: https://${websiteCheck.rows[0].domain}/${filename}`,
                `Click "Verify" button below to complete verification`,
            ],
        });
    } catch (error) {
        console.error('HTML file verification initialization error:', error);
        return NextResponse.json(
            { error: 'Failed to initialize verification' },
            { status: 500 }
        );
    }
}
