export const runtime = "edge";

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';
import { validateAdminRequest } from '@/lib/admin-auth';



export async function POST(request: NextRequest) {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();

        // Check admin authentication
        const { admin } = await validateAdminRequest();
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json() as any;
        const {
            title,
            slug,
            content,
            excerpt,
            coverImage,
            category,
            tags,
            metaTitle,
            metaDescription,
            keywords,
            status = 'draft',
        } = body;

        // Validate required fields
        if (!title || !content) {
            return NextResponse.json(
                { error: 'Title and content are required' },
                { status: 400 }
            );
        }

        // Check if slug already exists
        const existingPost = await sql`
            SELECT id FROM blog_posts WHERE slug = ${slug}
        `;

        if (existingPost.rows.length > 0) {
            return NextResponse.json(
                { error: 'A post with this slug already exists' },
                { status: 400 }
            );
        }

        // Create blog post
        const result = await sql`
            INSERT INTO blog_posts (
                title, slug, content, excerpt, cover_image,
                author_id, status, category, tags,
                meta_title, meta_description, keywords,
                ${status === 'published' ? 'published_at,' : ''} created_at, updated_at
            )
            VALUES (
                ${title}, ${slug}, ${content}, ${excerpt}, ${coverImage},
                ${admin.id}, ${status}, ${category}, ${tags || []},
                ${metaTitle || title}, ${metaDescription || excerpt}, ${keywords || ''},
                ${status === 'published' ? 'NOW(),' : ''} NOW(), NOW()
            )
            RETURNING *
        `;

        const post = result.rows[0];

        return NextResponse.json({
            success: true,
            post,
        });
    } catch (error) {
        console.error('Blog creation error:', error);
        return NextResponse.json(
            { error: 'Failed to create blog post' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const category = searchParams.get('category');
        const status = searchParams.get('status');
        const search = searchParams.get('search');
        const offset = (page - 1) * limit;

        let query = sql`
            SELECT bp.*, au.name as author_name
            FROM blog_posts bp
            JOIN admin_users au ON bp.author_id = au.id
            WHERE 1=1
        `;

        if (category) {
            query = sql`${query} AND bp.category = ${category}`;
        }

        if (status) {
            query = sql`${query} AND bp.status = ${status}`;
        }

        if (search) {
            query = sql`${query} AND (bp.title ILIKE ${`%${search}%`} OR bp.content ILIKE ${`%${search}%`})`;
        }

        query = sql`${query} ORDER BY bp.created_at DESC LIMIT ${limit} OFFSET ${offset}`;

        const result = await query;

        // Get total count
        let countQuery = sql`SELECT COUNT(*) as total FROM blog_posts WHERE 1=1`;
        if (category) countQuery = sql`${countQuery} AND category = ${category}`;
        if (status) countQuery = sql`${countQuery} AND status = ${status}`;
        if (search) countQuery = sql`${countQuery} AND (title ILIKE ${`%${search}%`} OR content ILIKE ${`%${search}%`})`;

        const countResult = await countQuery;
        const total = parseInt(String((countResult.rows[0] as { total: unknown }).total));

        return NextResponse.json({
            posts: result.rows,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Blog fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch blog posts' },
            { status: 500 }
        );
    }
}
