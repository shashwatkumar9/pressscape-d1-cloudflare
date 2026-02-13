export const runtime = "edge";

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';
import { validateRequest } from '@/lib/auth';



// PATCH /api/publisher/websites/[id]/contributors/[contributorId] - Update contributor (approve, reject, update)
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; contributorId: string }> }
) {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();
        const now = new Date().toISOString();

        const { user } = await validateRequest();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: websiteId, contributorId } = await params;
        const body = await request.json() as any;

        // Check if user owns this website
        const websiteResult = await sql`
      SELECT owner_id FROM websites WHERE id = ${websiteId}
    `;

        if (websiteResult.rows.length === 0) {
            return NextResponse.json({ error: 'Website not found' }, { status: 404 });
        }

        const isOwner = websiteResult.rows[0].owner_id === user.id;

        // Get the contributor
        const contributorResult = await sql`
      SELECT * FROM website_contributors 
      WHERE id = ${contributorId} AND website_id = ${websiteId}
    `;

        if (contributorResult.rows.length === 0) {
            return NextResponse.json({ error: 'Contributor not found' }, { status: 404 });
        }

        const contributor = contributorResult.rows[0] as { user_id: string };
        const isContributorSelf = contributor.user_id === user.id;

        // Determine what can be updated
        const {
            is_approved,
            is_active,
            rejection_reason,
            writing_price,
            display_name,
            bio,
            specialties,
            sample_work_url,
            turnaround_days
        } = body;

        // Only owner can approve/reject
        if ((is_approved !== undefined || rejection_reason !== undefined) && !isOwner) {
            return NextResponse.json({
                error: 'Only website owner can approve or reject contributors'
            }, { status: 403 });
        }

        // Owner or contributor themselves can update other fields
        if (!isOwner && !isContributorSelf) {
            return NextResponse.json({
                error: 'Not authorized to update this contributor'
            }, { status: 403 });
        }

        // Validate writing_price if provided
        if (writing_price !== undefined && writing_price < 100) {
            return NextResponse.json({ error: 'Writing price must be at least $1' }, { status: 400 });
        }

        // Handle different update scenarios with separate queries for simplicity
        let result;

        if (is_approved === true && isOwner) {
            // Approve contributor
            result = await sql`
        UPDATE website_contributors 
        SET is_approved = true, approved_at = ${now}, rejected_at = NULL, rejection_reason = NULL, updated_at = ${now}
        WHERE id = ${contributorId} AND website_id = ${websiteId}
        RETURNING *
      `;
        } else if (is_approved === false && isOwner) {
            // Reject contributor
            result = await sql`
        UPDATE website_contributors 
        SET is_approved = false, rejected_at = ${now}, rejection_reason = ${rejection_reason || null}, updated_at = ${now}
        WHERE id = ${contributorId} AND website_id = ${websiteId}
        RETURNING *
      `;
        } else {
            // Update other fields
            result = await sql`
        UPDATE website_contributors 
        SET 
          is_active = COALESCE(${is_active}, is_active),
          writing_price = COALESCE(${writing_price}, writing_price),
          display_name = COALESCE(${display_name}, display_name),
          bio = COALESCE(${bio}, bio),
          specialties = COALESCE(${specialties}, specialties),
          sample_work_url = COALESCE(${sample_work_url}, sample_work_url),
          turnaround_days = COALESCE(${turnaround_days}, turnaround_days),
          updated_at = ${now}
        WHERE id = ${contributorId} AND website_id = ${websiteId}
        RETURNING *
      `;
        }

        return NextResponse.json({
            contributor: result.rows[0],
            message: is_approved === true ? 'Contributor approved' : is_approved === false ? 'Contributor rejected' : 'Contributor updated'
        });
    } catch (error) {
        console.error('Error updating contributor:', error);
        return NextResponse.json({ error: 'Failed to update contributor' }, { status: 500 });
    }
}

// DELETE /api/publisher/websites/[id]/contributors/[contributorId] - Remove contributor
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; contributorId: string }> }
) {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();
        const now = new Date().toISOString();

        const { user } = await validateRequest();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: websiteId, contributorId } = await params;

        // Check if user owns this website
        const websiteResult = await sql`
      SELECT owner_id FROM websites WHERE id = ${websiteId}
    `;

        if (websiteResult.rows.length === 0) {
            return NextResponse.json({ error: 'Website not found' }, { status: 404 });
        }

        const isOwner = websiteResult.rows[0].owner_id === user.id;

        // Get the contributor
        const contributorResult = await sql`
      SELECT user_id FROM website_contributors 
      WHERE id = ${contributorId} AND website_id = ${websiteId}
    `;

        if (contributorResult.rows.length === 0) {
            return NextResponse.json({ error: 'Contributor not found' }, { status: 404 });
        }

        const isContributorSelf = (contributorResult.rows[0] as { user_id: string }).user_id === user.id;

        // Only owner or the contributor themselves can remove
        if (!isOwner && !isContributorSelf) {
            return NextResponse.json({
                error: 'Not authorized to remove this contributor'
            }, { status: 403 });
        }

        // Check for pending orders
        const pendingOrders = await sql`
      SELECT COUNT(*) as count FROM orders 
      WHERE selected_contributor_id = ${contributorId}
      AND status NOT IN ('completed', 'cancelled', 'refunded')
    `;

        if (parseInt(String(pendingOrders.rows[0].count)) > 0) {
            return NextResponse.json({
                error: 'Cannot remove contributor with pending orders. Please complete or cancel existing orders first.'
            }, { status: 400 });
        }

        // Delete the contributor
        await sql`
      DELETE FROM website_contributors 
      WHERE id = ${contributorId} AND website_id = ${websiteId}
    `;

        return NextResponse.json({
            message: 'Contributor removed successfully'
        });
    } catch (error) {
        console.error('Error removing contributor:', error);
        return NextResponse.json({ error: 'Failed to remove contributor' }, { status: 500 });
    }
}
