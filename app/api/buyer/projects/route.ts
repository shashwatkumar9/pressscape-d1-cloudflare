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
        WHERE s.id = ${sessionId} AND s.expires_at > '${now}'
    `;
    return result.rows[0] || null;
}

// Validation schema
const createProjectSchema = z.object({
    name: z.string().min(1).max(100),
    url: z.string().url(),
    description: z.string().max(500).optional(),
});

// GET /api/buyer/projects - List all projects
export async function GET(request: NextRequest) {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();
        const now = new Date().toISOString();

        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user_id as string;
        const { searchParams } = new URL(request.url);
        const includeStats = searchParams.get('stats') === 'true';

        let projects;
        if (includeStats) {
            projects = await sql`
                SELECT 
                    p.*,
                    COUNT(DISTINCT o.id) as order_count,
                    COUNT(DISTINCT o.id) FILTER (WHERE o.status IN ('approved', 'published', 'completed')) as completed_count,
                    COALESCE(SUM(o.total_amount), 0) as total_spent
                FROM projects p
                LEFT JOIN orders o ON o.project_id = p.id
                WHERE p.user_id = ${userId} AND p.is_active = 1
                GROUP BY p.id
                ORDER BY p.created_at DESC
            `;
        } else {
            projects = await sql`
                SELECT * FROM projects 
                WHERE user_id = ${userId} AND is_active = 1
                ORDER BY created_at DESC
            `;
        }

        return NextResponse.json({ projects: projects.rows });
    } catch (error) {
        console.error('List projects error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch projects' },
            { status: 500 }
        );
    }
}

// POST /api/buyer/projects - Create a new project
export async function POST(request: NextRequest) {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();
        const now = new Date().toISOString();

        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user_id as string;
        const body = await request.json() as any;

        // Validate
        const result = createProjectSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: result.error.issues },
                { status: 400 }
            );
        }

        const { name, url, description } = result.data;

        // Auto-fetch favicon from Google
        let favicon = null;
        try {
            const domain = new URL(url).hostname;
            favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
        } catch {
            // Invalid URL, no favicon
        }

        // Create project
        const project = await sql`
            INSERT INTO projects (user_id, name, url, description, favicon)
            VALUES (${userId}, ${name}, ${url}, ${description || null}, ${favicon})
            RETURNING *
        `;

        // Log activity
        await sql`
            INSERT INTO activity_logs (user_id, action, description, model_type, model_id)
            VALUES (${userId}, 'project_created', ${'Created project: ' + name}, 'project', ${project.rows[0].id})
        `;

        return NextResponse.json({ project: project.rows[0] }, { status: 201 });
    } catch (error) {
        console.error('Create project error:', error);
        return NextResponse.json(
            { error: 'Failed to create project' },
            { status: 500 }
        );
    }
}
