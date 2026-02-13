export const runtime = "edge";

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';
import { getApiKeyFromRequest, checkRateLimit } from '@/lib/api-auth';



/**
 * GET /api/v1/websites/:id
 * Get detailed information about a specific website
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

        if (!auth.valid || !auth.key) {
            return NextResponse.json({
                error: auth.error || 'Unauthorized',
                code: 'UNAUTHORIZED'
            }, {
                status: 401,
                headers: { 'WWW-Authenticate': 'Bearer' }
            });
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

        // Get website details
        const result = await sql`
            SELECT 
                w.id,
                w.domain,
                w.name,
                w.description,
                w.domain_authority,
                w.domain_rating,
                w.organic_traffic,
                w.referring_domains,
                w.spam_score,
                w.trust_flow,
                w.citation_flow,
                w.price_guest_post,
                w.price_link_insertion,
                w.price_homepage_link,
                w.price_content_writing,
                w.price_extra_link,
                w.price_urgent,
                w.link_type,
                w.turnaround_days,
                w.offers_urgent,
                w.max_links,
                w.min_word_count,
                w.max_word_count,
                w.allows_casino,
                w.allows_cbd,
                w.allows_crypto,
                w.allows_adult,
                w.accepts_buyer_content,
                w.offers_writing_service,
                w.sponsored_tag,
                w.indexed_guarantee,
                w.sample_post_url,
                w.average_rating,
                w.rating_count,
                w.total_orders,
                w.completed_orders,
                w.metrics_updated_at,
                w.metrics_source,
                c.name as category_name,
                c.slug as category_slug,
                u.name as publisher_name
            FROM websites w
            LEFT JOIN categories c ON w.primary_category_id = c.id
            LEFT JOIN users u ON w.owner_id = u.id
            WHERE w.id = ${id} 
              AND w.is_active = true 
              AND w.verification_status = 'approved'
        `;

        if (result.rows.length === 0) {
            return NextResponse.json({
                error: 'Website not found',
                code: 'NOT_FOUND'
            }, { status: 404, headers });
        }

        const w = result.rows[0] as Record<string, unknown>;

        // Format response
        const website = {
            id: w.id,
            domain: w.domain,
            name: w.name,
            description: w.description,
            metrics: {
                domainAuthority: w.domain_authority,
                domainRating: w.domain_rating,
                organicTraffic: w.organic_traffic,
                referringDomains: w.referring_domains,
                spamScore: w.spam_score,
                trustFlow: w.trust_flow,
                citationFlow: w.citation_flow,
                source: w.metrics_source,
                lastUpdated: w.metrics_updated_at
            },
            pricing: {
                guestPost: w.price_guest_post ? (w.price_guest_post as number) / 100 : null,
                linkInsertion: w.price_link_insertion ? (w.price_link_insertion as number) / 100 : null,
                homepageLink: w.price_homepage_link ? (w.price_homepage_link as number) / 100 : null,
                contentWriting: w.price_content_writing ? (w.price_content_writing as number) / 100 : null,
                extraLink: w.price_extra_link ? (w.price_extra_link as number) / 100 : null,
                urgentFee: w.price_urgent ? (w.price_urgent as number) / 100 : null,
                currency: 'USD'
            },
            requirements: {
                linkType: w.link_type,
                turnaroundDays: w.turnaround_days,
                offersUrgent: w.offers_urgent,
                maxLinks: w.max_links,
                wordCount: {
                    min: w.min_word_count,
                    max: w.max_word_count
                },
                sponsoredTag: w.sponsored_tag,
                indexedGuarantee: w.indexed_guarantee,
                acceptsBuyerContent: w.accepts_buyer_content,
                offersWritingService: w.offers_writing_service
            },
            allowed: {
                casino: w.allows_casino,
                cbd: w.allows_cbd,
                crypto: w.allows_crypto,
                adult: w.allows_adult
            },
            category: {
                name: w.category_name,
                slug: w.category_slug
            },
            publisher: {
                name: w.publisher_name
            },
            stats: {
                averageRating: w.average_rating,
                reviewCount: w.rating_count,
                totalOrders: w.total_orders,
                completedOrders: w.completed_orders
            },
            samplePostUrl: w.sample_post_url
        };

        return NextResponse.json({ data: website }, { headers });

    } catch (error) {
        console.error('API v1 website details error:', error);
        return NextResponse.json({
            error: 'Internal server error',
            code: 'INTERNAL_ERROR'
        }, { status: 500 });
    }
}
