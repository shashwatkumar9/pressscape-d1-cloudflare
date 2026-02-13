export const runtime = "edge";

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';
import { cookies } from 'next/headers';
import { z } from 'zod';



// Helper to get session
async function getSession() {
    const now = new Date().toISOString();
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('auth_session')?.value;
    if (!sessionId) return null;

    const result = await sql`
        SELECT s.user_id, u.name, u.email, u.is_buyer
        FROM sessions s
        JOIN users u ON s.user_id = u.id
        WHERE s.id = ${sessionId} AND s.expires_at > ${now}
    `;
    return result.rows[0] || null;
}

// Validation schema
const updateProjectSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    url: z.string().url().optional(),
    description: z.string().max(500).optional(),
});

// GET /api/buyer/projects/[id] - Get single project with stats
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();
        const now = new Date().toISOString();

        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const userId = session.user_id as string;

        const projectResult = await sql`
            SELECT 
                p.*,
                COUNT(DISTINCT o.id) as order_count,
                COUNT(DISTINCT o.id) FILTER (WHERE o.status IN ('approved', 'published', 'completed')) as completed_count,
                COUNT(DISTINCT o.id) FILTER (WHERE o.status = 'pending') as pending_count,
                COALESCE(SUM(o.total_amount), 0) as total_spent
            FROM projects p
            LEFT JOIN orders o ON o.project_id = p.id
            WHERE p.id = ${id} AND p.user_id = ${userId}
            GROUP BY p.id
        `;

        if (projectResult.rows.length === 0) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        return NextResponse.json({ project: projectResult.rows[0] });
    } catch (error) {
        console.error('Get project error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch project' },
            { status: 500 }
        );
    }
}

// PUT /api/buyer/projects/[id] - Update a project
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();
        const now = new Date().toISOString();

        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const userId = session.user_id as string;
        const body = await request.json() as any;

        // Validate
        const result = updateProjectSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: result.error.issues },
                { status: 400 }
            );
        }

        // Check ownership
        const projectCheck = await sql`
            SELECT id FROM projects WHERE id = ${id} AND user_id = ${userId}
        `;
        if (projectCheck.rows.length === 0) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        const { name, url, description } = result.data;

        // Build update query dynamically
        let favicon = null;
        if (url) {
            try {
                const domain = new URL(url).hostname;
                favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
            } catch {
                // Invalid URL
            }
        }

        const updated = await sql`
            UPDATE projects
            SET 
                name = COALESCE(${name || null}, name),
                url = COALESCE(${url || null}, url),
                description = COALESCE(${description || null}, description),
                favicon = COALESCE(${favicon}, favicon),
                updated_at = NOW()
            WHERE id = ${id} AND user_id = ${userId}
            RETURNING *
        `;

        return NextResponse.json({ project: updated.rows[0] });
    } catch (error) {
        console.error('Update project error:', error);
        return NextResponse.json(
            { error: 'Failed to update project' },
            { status: 500 }
        );
    }
}

// DELETE /api/buyer/projects/[id] - Soft delete a project
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();
        const now = new Date().toISOString();

        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const userId = session.user_id as string;

        // Soft delete (set is_active = false)
        const result = await sql`
            UPDATE projects
            SET is_active = 0, updated_at = NOW()
            WHERE id = ${id} AND user_id = ${userId}
            RETURNING id, name
        `;

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        // Log activity
        await sql`
            INSERT INTO activity_logs (user_id, action, description, model_type, model_id)
            VALUES (${userId}, 'project_deleted', ${'Deleted project: ' + result.rows[0].name}, 'project', ${id})
        `;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete project error:', error);
        return NextResponse.json(
            { error: 'Failed to delete project' },
            { status: 500 }
        );
    }
}
