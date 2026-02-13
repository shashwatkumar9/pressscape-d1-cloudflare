export const runtime = "edge";

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';
import { validateRequest } from '@/lib/auth';
import { z } from 'zod';



const applyContributorSchema = z.object({
    websiteId: z.string(),
    application: z.string().min(500, 'Application must be at least 500 characters'),
    portfolioLinks: z.array(z.string().url()).optional(),
    sampleArticles: z.array(z.string().url()).optional(),
});

export async function POST(request: NextRequest) {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();

        const { user } = await validateRequest();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json() as any;
        const result = applyContributorSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: 'Invalid application', details: result.error.issues },
                { status: 400 }
            );
        }

        const { websiteId, application, portfolioLinks, sampleArticles } = result.data;

        // Check if website exists
        const websiteCheck = await sql`
            SELECT id FROM websites WHERE id = ${websiteId}
        `;

        if (websiteCheck.rows.length === 0) {
            return NextResponse.json({ error: 'Website not found' }, { status: 404 });
        }

        // Check if user already has an application for this website
        const existingCheck = await sql`
            SELECT id, verification_status 
            FROM websites 
            WHERE id = ${websiteId} 
            AND user_id = ${user.id}
        `;

        if (existingCheck.rows.length > 0) {
            return NextResponse.json(
                { error: 'You already have an application for this website' },
                { status: 400 }
            );
        }

        // Create contributor application by creating a new website entry
        await sql`
            INSERT INTO websites (
                user_id,
                domain,
                ownership_type,
                verification_status,
                contributor_application,
                created_at
            )
            SELECT 
                ${user.id},
                domain,
                'contributor',
                'pending',
                ${JSON.stringify({
            application,
            portfolioLinks: portfolioLinks || [],
            sampleArticles: sampleArticles || [],
            appliedAt: new Date().toISOString(),
        })},
                NOW()
            FROM websites
            WHERE id = ${websiteId}
        `;

        // TODO: Send email notification to admin

        return NextResponse.json({
            success: true,
            message: 'Contributor application submitted successfully. Admin will review shortly.',
        });
    } catch (error) {
        console.error('Apply contributor error:', error);
        return NextResponse.json(
            { error: 'Failed to submit application' },
            { status: 500 }
        );
    }
}
