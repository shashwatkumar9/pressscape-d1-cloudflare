export const runtime = "edge";

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';
import { cookies } from 'next/headers';



// Helper to get session
async function getSession() {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('auth_session')?.value;
    if (!sessionId) return null;

    const now = new Date().toISOString();
    const result = await sql`
        SELECT s.user_id, u.name, u.email, u.is_buyer
        FROM sessions s
        JOIN users u ON s.user_id = u.id
        WHERE s.id = ${sessionId} AND s.expires_at > ${now}
    `;
    return result.rows[0] || null;
}

// GET /api/buyer/dashboard - Get dashboard data
export async function GET() {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();

        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user_id as string;

        // Get order stats by status (mapped to 6 simplified categories)
        const orderStatsResult = await sql`
            SELECT 
                COUNT(*) FILTER (WHERE status = 'pending') as not_started,
                COUNT(*) FILTER (WHERE status IN ('accepted', 'writing')) as in_progress,
                COUNT(*) FILTER (WHERE status = 'content_submitted') as pending_approval,
                COUNT(*) FILTER (WHERE status = 'revision_needed') as in_improvement,
                COUNT(*) FILTER (WHERE status IN ('approved', 'published', 'completed')) as completed,
                COUNT(*) FILTER (WHERE status IN ('cancelled', 'refunded', 'disputed')) as rejected,
                COUNT(*) as total_orders,
                COALESCE(SUM(total_amount), 0) as total_spent
            FROM orders
            WHERE buyer_id = ${userId}
        `;

        // Get balance info
        const balanceResult = await sql`
            SELECT 
                buyer_balance as main,
                COALESCE(balance_reserved, 0) as reserved,
                COALESCE(balance_bonus, 0) as bonus
            FROM users
            WHERE id = ${userId}
        `;

        // Get recent activity (last 10 items)
        const activityResult = await sql`
            SELECT id, action, description, model_type, model_id, created_at
            FROM activity_logs
            WHERE user_id = ${userId}
            ORDER BY created_at DESC
            LIMIT 10
        `;

        // Get recent orders (last 5)
        const recentOrdersResult = await sql`
            SELECT 
                o.id, o.order_number, o.order_type, o.status, o.total_amount, o.created_at,
                w.domain as website_domain, w.domain_authority as website_da,
                p.name as publisher_name
            FROM orders o
            JOIN websites w ON o.website_id = w.id
            JOIN users p ON o.publisher_id = p.id
            WHERE o.buyer_id = ${userId}
            ORDER BY o.created_at DESC
            LIMIT 5
        `;

        // Get projects count
        const projectsResult = await sql`
            SELECT COUNT(*) as count FROM projects WHERE user_id = ${userId} AND is_active = 1
        `;

        // Get unread notifications count
        const notificationsResult = await sql`
            SELECT COUNT(*) as count FROM notifications WHERE user_id = ${userId} AND is_read = 0
        `;

        const stats = orderStatsResult.rows[0];
        const balance = balanceResult.rows[0];

        return NextResponse.json({
            orderStats: {
                not_started: parseInt(stats.not_started as string) || 0,
                in_progress: parseInt(stats.in_progress as string) || 0,
                pending_approval: parseInt(stats.pending_approval as string) || 0,
                in_improvement: parseInt(stats.in_improvement as string) || 0,
                completed: parseInt(stats.completed as string) || 0,
                rejected: parseInt(stats.rejected as string) || 0,
            },
            totals: {
                orders: parseInt(stats.total_orders as string) || 0,
                spent: parseInt(stats.total_spent as string) || 0,
            },
            balance: {
                main: parseInt(balance?.main as string) || 0,
                reserved: parseInt(balance?.reserved as string) || 0,
                bonus: parseInt(balance?.bonus as string) || 0,
            },
            recentActivity: activityResult.rows,
            recentOrders: recentOrdersResult.rows,
            projectsCount: parseInt(projectsResult.rows[0]?.count as string) || 0,
            unreadNotifications: parseInt(notificationsResult.rows[0]?.count as string) || 0,
        });
    } catch (error) {
        console.error('Dashboard API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch dashboard data' },
            { status: 500 }
        );
    }
}
