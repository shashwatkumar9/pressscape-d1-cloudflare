export const runtime = "edge";

import { NextRequest, NextResponse } from 'next/server';
import { sql, intToBool } from '@/lib/db';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';



export async function GET(request: NextRequest) {
    // Initialize D1 database
    await initializeDatabaseFromContext();

    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '24');
        const sort = searchParams.get('sort') || 'relevance';
        const search = searchParams.get('search') || '';

        // Advanced filters
        const category = searchParams.get('category') || '';
        const linkTypes = searchParams.get('link_type')?.split(',').filter(Boolean) || [];
        const daMin = parseInt(searchParams.get('da_min') || '') || null;
        const daMax = parseInt(searchParams.get('da_max') || '') || null;
        const drMin = parseInt(searchParams.get('dr_min') || '') || null;
        const drMax = parseInt(searchParams.get('dr_max') || '') || null;
        const priceMin = parseInt(searchParams.get('price_min') || '') || null;
        const priceMax = parseInt(searchParams.get('price_max') || '') || null;
        const turnaroundMax = parseInt(searchParams.get('turnaround_max') || '') || null;
        const verifiedOnly = searchParams.get('verified') === 'true';

        const offset = (page - 1) * limit;

        // Use a simpler approach that works with tagged template literals
        // Get websites with filters applied
        const result = await sql`
            SELECT 
                w.id, w.domain, w.name, w.description,
                w.domain_authority, w.domain_rating, w.organic_traffic,
                w.price_guest_post, w.price_link_insertion, w.price_content_writing,
                w.price_extra_link, w.price_homepage_link, w.price_urgent,
                w.link_type, w.turnaround_days, w.is_featured,
                w.traffic_country_1,
                w.primary_language,
                w.max_links, w.min_word_count, w.max_word_count,
                w.allows_casino, w.allows_cbd, w.allows_adult, w.allows_crypto,
                w.sample_post_url,
                w.average_rating, w.rating_count, 
                COALESCE(w.completed_orders, 0) as completed_orders,
                COALESCE(w.total_orders, 0) as total_orders,
                COALESCE(w.completion_rate, 100) as completion_rate,
                w.verification_status,
                COALESCE(w.is_indexed, true) as is_indexed,
                c.name as category
            FROM websites w
            LEFT JOIN categories c ON w.primary_category_id = c.id
            WHERE w.is_active = true
            AND (
                ${search} = '' 
                OR w.domain ILIKE ${'%' + search + '%'} 
                OR w.name ILIKE ${'%' + search + '%'}
                OR c.name ILIKE ${'%' + search + '%'}
            )
            AND (${category} = '' OR c.slug = ${category})
            AND (${linkTypes.length === 0} OR w.link_type = ANY(${linkTypes.length > 0 ? linkTypes : ['dofollow', 'nofollow', 'sponsored']}))
            AND (${daMin === null} OR w.domain_authority >= ${daMin || 0})
            AND (${daMax === null} OR w.domain_authority <= ${daMax || 100})
            AND (${drMin === null} OR w.domain_rating >= ${drMin || 0})
            AND (${drMax === null} OR w.domain_rating <= ${drMax || 100})
            AND (${priceMin === null} OR w.price_guest_post >= ${priceMin || 0})
            AND (${priceMax === null} OR w.price_guest_post <= ${priceMax || 999999999})
            AND (${turnaroundMax === null} OR w.turnaround_days <= ${turnaroundMax || 999})
            AND (${!verifiedOnly} OR w.verification_status = 'verified')
            ORDER BY 
                w.is_featured DESC,
                COALESCE(w.admin_boost_score, 0) DESC,
                CASE ${sort}
                    WHEN 'da_desc' THEN w.domain_authority
                    WHEN 'dr_desc' THEN w.domain_rating
                    WHEN 'traffic_desc' THEN w.organic_traffic
                    WHEN 'rating_desc' THEN w.average_rating
                    ELSE w.domain_authority
                END DESC NULLS LAST,
                CASE ${sort}
                    WHEN 'da_asc' THEN w.domain_authority
                    WHEN 'price_asc' THEN w.price_guest_post
                    ELSE NULL
                END ASC NULLS LAST,
                CASE ${sort}
                    WHEN 'price_desc' THEN w.price_guest_post
                    ELSE NULL
                END DESC NULLS LAST,
                CASE ${sort}
                    WHEN 'newest' THEN EXTRACT(EPOCH FROM w.created_at)
                    ELSE NULL
                END DESC NULLS LAST
            LIMIT ${limit} OFFSET ${offset}
        `;

        // Get total count
        const countResult = await sql`
            SELECT COUNT(*) as count
            FROM websites w
            LEFT JOIN categories c ON w.primary_category_id = c.id
            WHERE w.is_active = true
            AND (
                ${search} = '' 
                OR w.domain ILIKE ${'%' + search + '%'} 
                OR w.name ILIKE ${'%' + search + '%'}
                OR c.name ILIKE ${'%' + search + '%'}
            )
            AND (${category} = '' OR c.slug = ${category})
            AND (${linkTypes.length === 0} OR w.link_type = ANY(${linkTypes.length > 0 ? linkTypes : ['dofollow', 'nofollow', 'sponsored']}))
            AND (${daMin === null} OR w.domain_authority >= ${daMin || 0})
            AND (${daMax === null} OR w.domain_authority <= ${daMax || 100})
            AND (${drMin === null} OR w.domain_rating >= ${drMin || 0})
            AND (${drMax === null} OR w.domain_rating <= ${drMax || 100})
            AND (${priceMin === null} OR w.price_guest_post >= ${priceMin || 0})
            AND (${priceMax === null} OR w.price_guest_post <= ${priceMax || 999999999})
            AND (${turnaroundMax === null} OR w.turnaround_days <= ${turnaroundMax || 999})
            AND (${!verifiedOnly} OR w.verification_status = 'verified')
        `;

        const total = parseInt(String((countResult.rows[0] as { count: string })?.count || '0'));

        // Transform the results
        const websites = result.rows.map((row: any) => ({
            ...row,
            countries: row.traffic_country_1 ? [row.traffic_country_1] : ['US'],
            languages: row.primary_language ? [row.primary_language] : ['English'],
            completion_rate: parseFloat(row.completion_rate) || 100,
        }));

        return NextResponse.json({
            websites,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasMore: page * limit < total
            }
        });
    } catch (error) {
        console.error('Error fetching websites:', error);
        return NextResponse.json({
            error: 'Failed to fetch websites',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
