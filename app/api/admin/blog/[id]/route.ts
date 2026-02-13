export const runtime = "edge";

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';
import { validateAdminRequest } from '@/lib/admin-auth';



export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();
        const now = new Date().toISOString();

        const { id } = await params;

        const result = await sql`
            SELECT bp.*, au.name as author_name, au.email as author_email
            FROM blog_posts bp
            JOIN admin_users au ON bp.author_id = au.id
            WHERE bp.id = ${id}
        `;

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
        }

        return NextResponse.json({ post: result.rows[0] });
    } catch (error) {
        console.error('Blog fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch blog post' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();
        const now = new Date().toISOString();

        // Check admin authentication
        const { admin } = await validateAdminRequest();
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
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
            status,
        } = body;

        // Validate required fields
        if (!title || !content) {
            return NextResponse.json(
                { error: 'Title and content are required' },
                { status: 400 }
            );
        }

        // Check if slug is taken by another post
        const existingPost = await sql`
            SELECT id FROM blog_posts WHERE slug = ${slug} AND id != ${id}
        `;

        if (existingPost.rows.length > 0) {
            return NextResponse.json(
                { error: 'A post with this slug already exists' },
                { status: 400 }
            );
        }

        // Get current post to check if status changed to published
        const currentPost = await sql`SELECT status FROM blog_posts WHERE id = ${id}`;
        const wasPublished = currentPost.rows[0]?.status === 'published';
        const isNowPublished = status === 'published';

        // Update blog post
        const result = await sql`
            UPDATE blog_posts
            SET
                title = ${title},
                slug = ${slug},
                content = ${content},
                excerpt = ${excerpt},
                cover_image = ${coverImage},
                status = ${status},
                category = ${category},
                tags = ${tags || []},
                meta_title = ${metaTitle || title},
                meta_description = ${metaDescription || excerpt},
                keywords = ${keywords || ''},
                ${!wasPublished && isNowPublished ? 'published_at = ${now},' : ''}
                updated_at = ${now}
            WHERE id = ${id}
            RETURNING *
        `;

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            post: result.rows[0],
        });
    } catch (error) {
        console.error('Blog update error:', error);
        return NextResponse.json(
            { error: 'Failed to update blog post' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();
        const now = new Date().toISOString();

        // Check admin authentication
        const { admin } = await validateAdminRequest();
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        const result = await sql`
            DELETE FROM blog_posts
            WHERE id = ${id}
            RETURNING id
        `;

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Blog delete error:', error);
        return NextResponse.json(
            { error: 'Failed to delete blog post' },
            { status: 500 }
        );
    }
}
