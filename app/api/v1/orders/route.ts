export const runtime = "edge";

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';
import { getApiKeyFromRequest, checkRateLimit } from '@/lib/api-auth';



/**
 * GET /api/v1/orders
 * List orders for the authenticated buyer
 * 
 * Query parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20, max: 50)
 * - status: Filter by status
 */
export async function GET(request: NextRequest) {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();

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

        // Parse query parameters
        const { searchParams } = new URL(request.url);
        const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
        const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));
        const offset = (page - 1) * limit;
        const status = searchParams.get('status');

        // Build query
        let statusCondition = '';
        const params: unknown[] = [auth.user.id, limit, offset];

        if (status) {
            statusCondition = 'AND o.status = $4';
            params.push(status);
        }

        // Get total count
        const countResult = await sql`
            SELECT COUNT(*) as count 
            FROM orders o
            WHERE o.buyer_id = ${auth.user.id}
            ${status ? sql`AND o.status = ${status}` : sql``}
        `;
        const total = parseInt(String((countResult.rows[0] as { count: string })?.count || '0'));

        // Get orders
        const result = await sql`
            SELECT 
                o.id,
                o.order_number,
                o.order_type,
                o.status,
                o.payment_status,
                o.target_url,
                o.anchor_text,
                o.article_title,
                o.article_url,
                o.total_amount,
                o.turnaround_days,
                o.is_urgent,
                o.deadline_at,
                o.created_at,
                o.accepted_at,
                o.published_at,
                o.completed_at,
                o.buyer_rating,
                w.id as website_id,
                w.domain,
                w.name as website_name
            FROM orders o
            JOIN websites w ON o.website_id = w.id
            WHERE o.buyer_id = ${auth.user.id}
            ${status ? sql`AND o.status = ${status}` : sql``}
            ORDER BY o.created_at DESC
            LIMIT ${limit} OFFSET ${offset}
        `;

        // Format response
        const orders = result.rows.map((o: Record<string, unknown>) => ({
            id: o.id,
            orderNumber: o.order_number,
            type: o.order_type,
            status: o.status,
            paymentStatus: o.payment_status,
            website: {
                id: o.website_id,
                domain: o.domain,
                name: o.website_name
            },
            content: {
                targetUrl: o.target_url,
                anchorText: o.anchor_text,
                articleTitle: o.article_title,
                publishedUrl: o.article_url
            },
            pricing: {
                total: o.total_amount ? (o.total_amount as number) / 100 : 0,
                currency: 'USD'
            },
            timeline: {
                turnaroundDays: o.turnaround_days,
                isUrgent: o.is_urgent,
                deadline: o.deadline_at,
                createdAt: o.created_at,
                acceptedAt: o.accepted_at,
                publishedAt: o.published_at,
                completedAt: o.completed_at
            },
            rating: o.buyer_rating
        }));

        return NextResponse.json({
            data: orders,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasMore: page * limit < total
            }
        }, { headers });

    } catch (error) {
        console.error('API v1 orders list error:', error);
        return NextResponse.json({
            error: 'Internal server error',
            code: 'INTERNAL_ERROR'
        }, { status: 500 });
    }
}

/**
 * POST /api/v1/orders
 * Create a new order
 * 
 * Body:
 * - website_id: ID of the website to order from (required)
 * - order_type: "guest_post" | "link_insertion" (required)
 * - target_url: URL to link to (required)
 * - anchor_text: Anchor text for the link (required)
 * - content_source: "buyer_provided" | "publisher_writes" (default: "publisher_writes")
 * - article_content: Article content if buyer_provided
 * - notes: Additional notes for publisher
 * - is_urgent: Boolean for rush order
 */
export async function POST(request: NextRequest) {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();

        // Validate API key
        const auth = await getApiKeyFromRequest(request);

        if (!auth.valid || !auth.key || !auth.user) {
            return NextResponse.json({
                error: auth.error || 'Unauthorized',
                code: 'UNAUTHORIZED'
            }, { status: 401 });
        }

        // Check write permission
        if (!auth.key.permissions.includes('write') && !auth.key.permissions.includes('orders')) {
            return NextResponse.json({
                error: 'API key does not have write permission',
                code: 'FORBIDDEN'
            }, { status: 403 });
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

        // Parse request body
        const body = await request.json() as any;
        const {
            website_id,
            order_type,
            target_url,
            anchor_text,
            content_source = 'publisher_writes',
            article_content,
            notes,
            is_urgent = false
        } = body;

        // Validate required fields
        if (!website_id || !order_type || !target_url || !anchor_text) {
            return NextResponse.json({
                error: 'Missing required fields: website_id, order_type, target_url, anchor_text',
                code: 'VALIDATION_ERROR'
            }, { status: 400, headers });
        }

        // Validate order type
        if (!['guest_post', 'link_insertion'].includes(order_type)) {
            return NextResponse.json({
                error: 'Invalid order_type. Must be "guest_post" or "link_insertion"',
                code: 'VALIDATION_ERROR'
            }, { status: 400, headers });
        }

        // Get website details
        const websiteResult = await sql`
            SELECT 
                id, owner_id, domain, 
                price_guest_post, price_link_insertion, price_urgent,
                turnaround_days, offers_urgent
            FROM websites 
            WHERE id = ${website_id} 
              AND is_active = true 
              AND verification_status = 'approved'
        `;

        if (websiteResult.rows.length === 0) {
            return NextResponse.json({
                error: 'Website not found or not available',
                code: 'NOT_FOUND'
            }, { status: 404, headers });
        }

        const website = websiteResult.rows[0] as {
            id: string;
            owner_id: string;
            domain: string;
            price_guest_post: number;
            price_link_insertion: number;
            price_urgent: number;
            turnaround_days: number;
            offers_urgent: boolean;
        };

        // Calculate pricing
        const basePrice = order_type === 'guest_post'
            ? website.price_guest_post
            : website.price_link_insertion;

        if (!basePrice) {
            return NextResponse.json({
                error: `This website does not offer ${order_type.replace('_', ' ')}`,
                code: 'SERVICE_UNAVAILABLE'
            }, { status: 400, headers });
        }

        const urgentFee = is_urgent && website.offers_urgent ? (website.price_urgent || 0) : 0;
        const subtotal = basePrice + urgentFee;
        const platformFee = Math.round(subtotal * 0.25); // 25% platform fee
        const publisherEarnings = subtotal - platformFee;

        // Generate order number
        const orderNumber = `PS-${Date.now().toString().slice(-8)}`;

        // Calculate deadline
        const turnaroundDays = is_urgent ? Math.ceil(website.turnaround_days / 2) : website.turnaround_days;
        const deadline = new Date();
        deadline.setDate(deadline.getDate() + turnaroundDays);

        // Create order
        const orderResult = await sql`
            INSERT INTO orders (
                order_number, buyer_id, website_id, publisher_id,
                order_type, content_source, target_url, anchor_text,
                article_content, buyer_notes,
                base_price, urgent_fee, subtotal, platform_fee, 
                total_amount, publisher_earnings,
                turnaround_days, is_urgent, deadline_at,
                status, payment_status
            ) VALUES (
                ${orderNumber}, ${auth.user.id}, ${website.id}, ${website.owner_id},
                ${order_type}, ${content_source}, ${target_url}, ${anchor_text},
                ${article_content || null}, ${notes || null},
                ${basePrice}, ${urgentFee}, ${subtotal}, ${platformFee},
                ${subtotal}, ${publisherEarnings},
                ${turnaroundDays}, ${is_urgent}, ${deadline.toISOString()},
                'pending', 'pending'
            )
            RETURNING id, order_number, status, total_amount, created_at
        `;

        const order = orderResult.rows[0] as {
            id: string;
            order_number: string;
            status: string;
            total_amount: number;
            created_at: Date;
        };

        return NextResponse.json({
            message: 'Order created successfully',
            data: {
                id: order.id,
                orderNumber: order.order_number,
                status: order.status,
                website: {
                    id: website.id,
                    domain: website.domain
                },
                pricing: {
                    basePrice: basePrice / 100,
                    urgentFee: urgentFee / 100,
                    total: order.total_amount / 100,
                    currency: 'USD'
                },
                timeline: {
                    turnaroundDays,
                    deadline: deadline.toISOString(),
                    isUrgent: is_urgent
                },
                createdAt: order.created_at,
                paymentRequired: true,
                paymentUrl: `${process.env.NEXT_PUBLIC_APP_URL}/order/${order.id}/pay`
            }
        }, { status: 201, headers });

    } catch (error) {
        console.error('API v1 create order error:', error);
        return NextResponse.json({
            error: 'Internal server error',
            code: 'INTERNAL_ERROR'
        }, { status: 500 });
    }
}
