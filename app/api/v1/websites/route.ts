// NOTE: This route uses api-auth which depends on bcrypt (Node.js)
// export const runtime = "edge";

import { NextRequest, NextResponse } from 'next/server';
import { sql, getDatabase } from '@/lib/db';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';
import { getApiKeyFromRequest, checkRateLimit } from '@/lib/api-auth';



/**
 * GET /api/v1/websites
 * Public API endpoint to list websites
 * 
 * Authentication: Bearer token (API key)
 * 
 * Query parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20, max: 100)
 * - category: Filter by category slug
 * - da_min: Minimum Domain Authority
 * - da_max: Maximum Domain Authority
 * - dr_min: Minimum Domain Rating
 * - dr_max: Maximum Domain Rating
 * - price_min: Minimum price in dollars
 * - price_max: Maximum price in dollars
 * - sort: Sort order (da_desc, da_asc, dr_desc, price_asc, price_desc, traffic_desc)
 * - search: Search by domain name
 */
export async function GET(request: NextRequest) {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();

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
                code: 'RATE_LIMIT_EXCEEDED',
                retryAfter: Math.ceil((rateLimit.resetAt.getTime() - Date.now()) / 1000)
            }, {
                status: 429,
                headers: {
                    ...headers,
                    'Retry-After': String(Math.ceil((rateLimit.resetAt.getTime() - Date.now()) / 1000))
                }
            });
        }

        // Parse query parameters
        const { searchParams } = new URL(request.url);
        const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
        const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
        const offset = (page - 1) * limit;

        const category = searchParams.get('category');
        const daMin = searchParams.get('da_min') ? parseInt(searchParams.get('da_min')!) : null;
        const daMax = searchParams.get('da_max') ? parseInt(searchParams.get('da_max')!) : null;
        const drMin = searchParams.get('dr_min') ? parseInt(searchParams.get('dr_min')!) : null;
        const drMax = searchParams.get('dr_max') ? parseInt(searchParams.get('dr_max')!) : null;
        const priceMin = searchParams.get('price_min') ? parseInt(searchParams.get('price_min')!) * 100 : null;
        const priceMax = searchParams.get('price_max') ? parseInt(searchParams.get('price_max')!) * 100 : null;
        const sort = searchParams.get('sort') || 'da_desc';
        const search = searchParams.get('search');

        // Build WHERE conditions for D1
        const whereParts: string[] = ['w.is_active = 1', `w.verification_status = 'approved'`];
        const whereValues: unknown[] = [];

        if (category) {
            whereParts.push(`c.slug = ?`);
            whereValues.push(category);
        }
        if (daMin !== null) {
            whereParts.push(`w.domain_authority >= ?`);
            whereValues.push(daMin);
        }
        if (daMax !== null) {
            whereParts.push(`w.domain_authority <= ?`);
            whereValues.push(daMax);
        }
        if (drMin !== null) {
            whereParts.push(`w.domain_rating >= ?`);
            whereValues.push(drMin);
        }
        if (drMax !== null) {
            whereParts.push(`w.domain_rating <= ?`);
            whereValues.push(drMax);
        }
        if (priceMin !== null) {
            whereParts.push(`w.price_guest_post >= ?`);
            whereValues.push(priceMin);
        }
        if (priceMax !== null) {
            whereParts.push(`w.price_guest_post <= ?`);
            whereValues.push(priceMax);
        }
        if (search) {
            whereParts.push(`(w.domain LIKE ? OR w.name LIKE ?)`);
            whereValues.push(`%${search}%`, `%${search}%`);
        }

        // Build ORDER BY
        let orderBy = 'w.domain_authority DESC';
        switch (sort) {
            case 'da_asc': orderBy = 'w.domain_authority ASC'; break;
            case 'dr_desc': orderBy = 'w.domain_rating DESC'; break;
            case 'dr_asc': orderBy = 'w.domain_rating ASC'; break;
            case 'price_asc': orderBy = 'w.price_guest_post ASC'; break;
            case 'price_desc': orderBy = 'w.price_guest_post DESC'; break;
            case 'traffic_desc': orderBy = 'w.organic_traffic DESC'; break;
        }

        const whereClause = whereParts.join(' AND ');

        // Get raw D1 database for dynamic queries
        const db = getDatabase();

        // Get total count
        const countQuery = `
            SELECT COUNT(*) as count
            FROM websites w
            LEFT JOIN categories c ON w.primary_category_id = c.id
            WHERE ${whereClause}
        `;

        const countStmt = db.prepare(countQuery).bind(...whereValues);
        const countResult = await countStmt.first() as { count: number } | null;
        const total = countResult?.count || 0;

        // Get websites
        const query = `
            SELECT
                w.id,
                w.domain,
                w.name,
                w.description,
                w.domain_authority as da,
                w.domain_rating as dr,
                w.organic_traffic as traffic,
                w.referring_domains,
                w.spam_score,
                w.price_guest_post / 100.0 as price_guest_post,
                w.price_link_insertion / 100.0 as price_link_insertion,
                w.link_type,
                w.turnaround_days,
                w.max_links,
                w.min_word_count,
                w.max_word_count,
                w.allows_casino,
                w.allows_cbd,
                w.allows_crypto,
                c.name as category,
                c.slug as category_slug,
                w.average_rating,
                w.rating_count as review_count,
                w.metrics_updated_at
            FROM websites w
            LEFT JOIN categories c ON w.primary_category_id = c.id
            WHERE ${whereClause}
            ORDER BY ${orderBy}
            LIMIT ? OFFSET ?
        `;

        const stmt = db.prepare(query).bind(...whereValues, limit, offset);
        const result = await stmt.all();

        // Format response
        const websites = (result.results || []).map((row: Record<string, unknown>) => ({
            id: row.id,
            domain: row.domain,
            name: row.name,
            description: row.description,
            metrics: {
                da: row.da,
                dr: row.dr,
                traffic: row.traffic,
                referringDomains: row.referring_domains,
                spamScore: row.spam_score,
                lastUpdated: row.metrics_updated_at
            },
            pricing: {
                guestPost: row.price_guest_post,
                linkInsertion: row.price_link_insertion,
                currency: 'USD'
            },
            requirements: {
                linkType: row.link_type,
                turnaroundDays: row.turnaround_days,
                maxLinks: row.max_links,
                wordCount: {
                    min: row.min_word_count,
                    max: row.max_word_count
                }
            },
            allowed: {
                casino: row.allows_casino,
                cbd: row.allows_cbd,
                crypto: row.allows_crypto
            },
            category: {
                name: row.category,
                slug: row.category_slug
            },
            rating: {
                average: row.average_rating,
                count: row.review_count
            }
        }));

        return NextResponse.json({
            data: websites,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasMore: page * limit < total
            }
        }, { headers });

    } catch (error) {
        console.error('API v1 websites error:', error);
        return NextResponse.json({
            error: 'Internal server error',
            code: 'INTERNAL_ERROR'
        }, { status: 500 });
    }
}
