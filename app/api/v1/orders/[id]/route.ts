// NOTE: This route uses api-auth which depends on bcrypt (Node.js)
// export const runtime = "edge";

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';
import { getApiKeyFromRequest, checkRateLimit } from '@/lib/api-auth';



/**
 * GET /api/v1/orders/:id
 * Get detailed information about a specific order
 * 
 * Authentication: Bearer token (API key)
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();

        const { id } = await params;

        // Validate API key
        const auth = await getApiKeyFromRequest(request);

        if (!auth.valid || !auth.key || !auth.user) {
            return NextResponse.json({
                error: auth.error || 'Unauthorized',
                code: 'UNAUTHORIZED'
            }, { status: 401 });
        }

        // Check rate limit
        const rateLimit = await checkRateLimit(auth.key.id, auth.key.rateLimit);
        const headers = {
            'X-RateLimit-Limit': String(auth.key.rateLimit),
            'X-RateLimit-Remaining': String(rateLimit.remaining),
            'X-RateLimit-Reset': rateLimit.resetAt.toISOString()
        };

        if (!rateLimit.allowed) {
            return NextResponse.json({
                error: 'Rate limit exceeded',
                code: 'RATE_LIMIT_EXCEEDED'
            }, { status: 429, headers });
        }

        // Get order details (only if owned by the authenticated user)
        const result = await sql`
            SELECT 
                o.id,
                o.order_number,
                o.order_type,
                o.content_source,
                o.status,
                o.payment_status,
                o.target_url,
                o.anchor_text,
                o.article_title,
                o.article_content,
                o.article_url,
                o.buyer_notes,
                o.base_price,
                o.writing_fee,
                o.extra_links_fee,
                o.urgent_fee,
                o.subtotal,
                o.platform_fee,
                o.total_amount,
                o.turnaround_days,
                o.is_urgent,
                o.deadline_at,
                o.created_at,
                o.accepted_at,
                o.content_submitted_at,
                o.approved_at,
                o.published_at,
                o.completed_at,
                o.cancelled_at,
                o.cancellation_reason,
                o.buyer_rating,
                o.buyer_review,
                o.reviewed_at,
                w.id as website_id,
                w.domain,
                w.name as website_name,
                w.domain_authority,
                w.domain_rating,
                p.name as publisher_name
            FROM orders o
            JOIN websites w ON o.website_id = w.id
            JOIN users p ON o.publisher_id = p.id
            WHERE o.id = ${id} AND o.buyer_id = ${auth.user.id}
        `;

        if (result.rows.length === 0) {
            return NextResponse.json({
                error: 'Order not found',
                code: 'NOT_FOUND'
            }, { status: 404, headers });
        }

        const o = result.rows[0] as Record<string, unknown>;

        // Format response
        const order = {
            id: o.id,
            orderNumber: o.order_number,
            type: o.order_type,
            contentSource: o.content_source,
            status: o.status,
            paymentStatus: o.payment_status,
            website: {
                id: o.website_id,
                domain: o.domain,
                name: o.website_name,
                metrics: {
                    da: o.domain_authority,
                    dr: o.domain_rating
                }
            },
            publisher: {
                name: o.publisher_name
            },
            content: {
                targetUrl: o.target_url,
                anchorText: o.anchor_text,
                articleTitle: o.article_title,
                articleContent: o.article_content,
                publishedUrl: o.article_url,
                buyerNotes: o.buyer_notes
            },
            pricing: {
                basePrice: (o.base_price as number) / 100,
                writingFee: o.writing_fee ? (o.writing_fee as number) / 100 : 0,
                extraLinksFee: o.extra_links_fee ? (o.extra_links_fee as number) / 100 : 0,
                urgentFee: o.urgent_fee ? (o.urgent_fee as number) / 100 : 0,
                subtotal: (o.subtotal as number) / 100,
                platformFee: (o.platform_fee as number) / 100,
                total: (o.total_amount as number) / 100,
                currency: 'USD'
            },
            timeline: {
                turnaroundDays: o.turnaround_days,
                isUrgent: o.is_urgent,
                deadline: o.deadline_at,
                createdAt: o.created_at,
                acceptedAt: o.accepted_at,
                contentSubmittedAt: o.content_submitted_at,
                approvedAt: o.approved_at,
                publishedAt: o.published_at,
                completedAt: o.completed_at,
                cancelledAt: o.cancelled_at
            },
            cancellation: o.cancelled_at ? {
                cancelledAt: o.cancelled_at,
                reason: o.cancellation_reason
            } : null,
            review: o.reviewed_at ? {
                rating: o.buyer_rating,
                comment: o.buyer_review,
                reviewedAt: o.reviewed_at
            } : null
        };

        return NextResponse.json({ data: order }, { headers });

    } catch (error) {
        console.error('API v1 order details error:', error);
        return NextResponse.json({
            error: 'Internal server error',
            code: 'INTERNAL_ERROR'
        }, { status: 500 });
    }
}
