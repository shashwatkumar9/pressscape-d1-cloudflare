export const runtime = "edge";

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';
import { validateRequest } from '@/lib/auth';



// GET /api/publisher/websites/[id]/contributors - List all contributors for a website
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();

        const { user } = await validateRequest();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: websiteId } = await params;

        // Check if user owns this website
        const websiteResult = await sql`
      SELECT owner_id FROM websites WHERE id = ${websiteId}
    `;

        if (websiteResult.rows.length === 0) {
            return NextResponse.json({ error: 'Website not found' }, { status: 404 });
        }

        const isOwner = websiteResult.rows[0].owner_id === user.id;

        // Get contributors
        const result = await sql`
      SELECT 
        wc.id,
        wc.user_id,
        wc.writing_price,
        wc.display_name,
        wc.bio,
        wc.specialties,
        wc.sample_work_url,
        wc.total_orders,
        wc.completed_orders,
        wc.average_rating,
        wc.rating_count,
        wc.is_active,
        wc.is_approved,
        wc.approved_at,
        wc.rejection_reason,
        wc.turnaround_days,
        wc.created_at,
        u.name as user_name,
        u.email as user_email,
        u.avatar_url
      FROM website_contributors wc
      JOIN users u ON wc.user_id = u.id
      WHERE wc.website_id = ${websiteId}
      ORDER BY 
        wc.is_approved DESC,
        wc.average_rating DESC,
        wc.created_at DESC
    `;

        // If not owner, only return approved and active contributors
        const contributors = isOwner
            ? result.rows
            : result.rows.filter((c) => (c as { is_approved: boolean; is_active: boolean }).is_approved && (c as { is_approved: boolean; is_active: boolean }).is_active);

        return NextResponse.json({
            contributors,
            isOwner
        });
    } catch (error) {
        console.error('Error fetching contributors:', error);
        return NextResponse.json({ error: 'Failed to fetch contributors' }, { status: 500 });
    }
}

// POST /api/publisher/websites/[id]/contributors - Apply as contributor or invite
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();

        const { user } = await validateRequest();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: websiteId } = await params;
        const body = await request.json() as any;

        const {
            user_id,           // Optional - for owner inviting a contributor
            writing_price,
            display_name,
            bio,
            specialties,
            sample_work_url,
            turnaround_days = 5
        } = body;

        if (!writing_price || writing_price < 100) { // Min $1
            return NextResponse.json({ error: 'Writing price must be at least $1 (100 cents)' }, { status: 400 });
        }

        // Check if website exists and get owner
        const websiteResult = await sql`
      SELECT owner_id, name, domain FROM websites WHERE id = ${websiteId}
    `;

        if (websiteResult.rows.length === 0) {
            return NextResponse.json({ error: 'Website not found' }, { status: 404 });
        }

        const website = websiteResult.rows[0];
        const isOwner = website.owner_id === user.id;

        // Determine the contributor user ID
        const contributorUserId = user_id || user.id;

        // Owner cannot be a contributor to their own site
        if (contributorUserId === website.owner_id) {
            return NextResponse.json({
                error: 'Website owner cannot be a contributor to their own site'
            }, { status: 400 });
        }

        // Check if already a contributor
        const existingResult = await sql`
      SELECT id FROM website_contributors 
      WHERE website_id = ${websiteId} AND user_id = ${contributorUserId}
    `;

        if (existingResult.rows.length > 0) {
            return NextResponse.json({
                error: 'User is already a contributor to this website'
            }, { status: 400 });
        }

        // If owner is inviting, auto-approve. Otherwise pending approval.
        const isAutoApproved = isOwner && user_id;

        // Create contributor
        const result = await sql`
      INSERT INTO website_contributors (
        website_id,
        user_id,
        writing_price,
        display_name,
        bio,
        specialties,
        sample_work_url,
        turnaround_days,
        is_approved,
        approved_at
      ) VALUES (
        ${websiteId},
        ${contributorUserId},
        ${writing_price},
        ${display_name || null},
        ${bio || null},
        ${specialties || []},
        ${sample_work_url || null},
        ${turnaround_days},
        ${isAutoApproved},
        ${isAutoApproved ? new Date().toISOString() : null}
      )
      RETURNING *
    `;

        return NextResponse.json({
            contributor: result.rows[0],
            message: isAutoApproved
                ? 'Contributor added successfully'
                : 'Application submitted. Waiting for owner approval.'
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating contributor:', error);
        return NextResponse.json({ error: 'Failed to create contributor' }, { status: 500 });
    }
}
