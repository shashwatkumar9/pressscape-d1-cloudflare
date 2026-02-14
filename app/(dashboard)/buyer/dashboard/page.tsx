export const runtime = 'edge';

import { sql } from '@/lib/db';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';
import { validateRequest } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { OrderStatusGrid } from '@/components/dashboard/status-card';
import { DepositBonusBanner } from '@/components/dashboard/promo-banner';
import { TutorialSection } from '@/components/dashboard/tutorial-section';
import {
    DollarSign,
    Globe,
    PackageOpen,
    TrendingUp,
    ArrowRight,
    Clock,
    ExternalLink,
} from 'lucide-react';

interface OrderStats {
    not_started: number;
    in_progress: number;
    pending_approval: number;
    in_improvement: number;
    completed: number;
    rejected: number;
}

interface RecentOrder {
    id: string;
    order_number: string;
    order_type: string;
    status: string;
    total_amount: number;
    created_at: string;
    website_domain: string;
    publisher_name: string;
}

async function getDashboardData(userId: string) {
    try {
        // Initialize database
        await initializeDatabaseFromContext();
        console.log('[Dashboard] Database initialized for user:', userId);

        // Order stats by status (using CASE for D1 compatibility)
        console.log('[Dashboard] Fetching order stats...');
        const orderStatsResult = await sql`
            SELECT
                COALESCE(SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END), 0) as not_started,
                COALESCE(SUM(CASE WHEN status IN ('accepted', 'writing') THEN 1 ELSE 0 END), 0) as in_progress,
                COALESCE(SUM(CASE WHEN status = 'content_submitted' THEN 1 ELSE 0 END), 0) as pending_approval,
                COALESCE(SUM(CASE WHEN status = 'revision_needed' THEN 1 ELSE 0 END), 0) as in_improvement,
                COALESCE(SUM(CASE WHEN status IN ('approved', 'published', 'completed') THEN 1 ELSE 0 END), 0) as completed,
                COALESCE(SUM(CASE WHEN status IN ('cancelled', 'refunded', 'disputed') THEN 1 ELSE 0 END), 0) as rejected,
                COUNT(*) as total_orders,
                COALESCE(SUM(total_amount), 0) as total_spent
            FROM orders
            WHERE buyer_id = ${userId}
        `;
        console.log('[Dashboard] Order stats fetched successfully');

        // Recent orders
        console.log('[Dashboard] Fetching recent orders...');
        const recentOrdersResult = await sql`
            SELECT
                o.id, o.order_number, o.order_type, o.status, o.total_amount, o.created_at,
                w.domain as website_domain,
                p.name as publisher_name
            FROM orders o
            LEFT JOIN websites w ON o.website_id = w.id
            LEFT JOIN users p ON o.publisher_id = p.id
            WHERE o.buyer_id = ${userId}
            ORDER BY o.created_at DESC
            LIMIT 5
        `;
        console.log('[Dashboard] Recent orders fetched successfully');

        // Balance and user info
        console.log('[Dashboard] Fetching balance...');
        const balanceResult = await sql`
            SELECT
                buyer_balance as main,
                created_at
            FROM users
            WHERE id = ${userId}
        `;
        console.log('[Dashboard] Balance fetched successfully');

        // Projects count - handle if table doesn't exist
        let projectsCount = 0;
        try {
            console.log('[Dashboard] Fetching projects count...');
            const projectsResult = await sql`
                SELECT COUNT(*) as count FROM projects WHERE user_id = ${userId} AND is_active = TRUE
            `;
            projectsCount = parseInt(projectsResult.rows[0]?.count as string) || 0;
            console.log('[Dashboard] Projects count fetched successfully');
        } catch (projectsError) {
            console.log('[Dashboard] Projects table not found or error, defaulting to 0:', projectsError);
            projectsCount = 0;
        }

        const stats = orderStatsResult.rows[0];
        const balance = balanceResult.rows[0];

        console.log('[Dashboard] All data fetched, returning response');

        return {
            orderStats: {
                not_started: parseInt(stats.not_started as string) || 0,
                in_progress: parseInt(stats.in_progress as string) || 0,
                pending_approval: parseInt(stats.pending_approval as string) || 0,
                in_improvement: parseInt(stats.in_improvement as string) || 0,
                completed: parseInt(stats.completed as string) || 0,
                rejected: parseInt(stats.rejected as string) || 0,
            } as OrderStats,
            totals: {
                orders: parseInt(stats.total_orders as string) || 0,
                spent: parseInt(stats.total_spent as string) || 0,
            },
            balance: {
                main: parseInt(balance?.main as string) || 0,
                reserved: 0,
                bonus: 0,
            },
            recentOrders: recentOrdersResult.rows as unknown as RecentOrder[],
            projectsCount,
            accountCreatedAt: balance?.created_at as string || new Date().toISOString(),
        };
    } catch (error) {
        console.error('[Dashboard] Error in getDashboardData:', error);
        console.error('[Dashboard] Error details:', error instanceof Error ? error.message : String(error));
        console.error('[Dashboard] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        throw error;
    }
}

function formatCurrency(cents: number) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(cents / 100);
}

const statusColors: Record<string, string> = {
    pending: 'bg-gray-100 text-gray-700',
    accepted: 'bg-blue-100 text-blue-700',
    writing: 'bg-blue-100 text-blue-700',
    content_submitted: 'bg-orange-100 text-orange-700',
    revision_needed: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    published: 'bg-green-100 text-green-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    refunded: 'bg-red-100 text-red-700',
};

export default async function BuyerDashboard() {
    const { user } = await validateRequest();

    if (!user) {
        redirect('/login');
    }

    const data = await getDashboardData(user.id);
    const userName = user.name?.split(' ')[0] || 'there';

    return (
        <div className="space-y-6">
            {/* Promotional Banner */}
            <DepositBonusBanner />

            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                        Welcome back, {userName}! 👋
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Here's an overview of your guest posting campaigns
                    </p>
                </div>
                <Link href="/marketplace">
                    <Button className="gap-2">
                        <Globe className="w-4 h-4" />
                        Browse Marketplace
                    </Button>
                </Link>
            </div>

            {/* Order Status Cards */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Overview</h2>
                <OrderStatusGrid stats={data.orderStats} />
            </div>

            {/* Tutorial Section (for new users) */}
            <TutorialSection accountCreatedAt={data.accountCreatedAt} />

            {/* Stats & Recent Activity Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Quick Stats */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">
                            Available Balance
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-emerald-600">
                            {formatCurrency(data.balance.main)}
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                            <span className="text-amber-600">
                                Reserved: {formatCurrency(data.balance.reserved)}
                            </span>
                            {data.balance.bonus > 0 && (
                                <span className="text-purple-600">
                                    Bonus: {formatCurrency(data.balance.bonus)}
                                </span>
                            )}
                        </div>
                        <Link href="/buyer/add-funds" className="block mt-3">
                            <Button variant="outline" className="w-full gap-2" size="sm">
                                <DollarSign className="w-4 h-4" />
                                Add Funds
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">
                            Total Spent
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-gray-900">
                            {formatCurrency(data.totals.spent)}
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                            Across {data.totals.orders} total orders
                        </p>
                        <Link href="/buyer/orders" className="block mt-3">
                            <Button variant="outline" className="w-full gap-2" size="sm">
                                <PackageOpen className="w-4 h-4" />
                                View All Orders
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">
                            Active Projects
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-violet-600">
                            {data.projectsCount}
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                            Organize your orders by project
                        </p>
                        <Link href="/buyer/projects/new" className="block mt-3">
                            <Button variant="outline" className="w-full gap-2" size="sm">
                                <TrendingUp className="w-4 h-4" />
                                Create Project
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Orders */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Recent Orders</CardTitle>
                    <Link href="/buyer/orders" className="text-sm text-violet-600 hover:text-violet-700 flex items-center gap-1">
                        View all <ArrowRight className="w-4 h-4" />
                    </Link>
                </CardHeader>
                <CardContent>
                    {data.recentOrders.length === 0 ? (
                        <div className="text-center py-8">
                            <PackageOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">No orders yet</h3>
                            <p className="text-gray-500 mt-1">Start by browsing the marketplace</p>
                            <Link href="/marketplace">
                                <Button className="mt-4">Find Publishers</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {data.recentOrders.map((order) => (
                                <Link
                                    key={order.id}
                                    href={`/buyer/orders/${order.id}`}
                                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-violet-100 to-indigo-100 rounded-lg flex items-center justify-center">
                                            <Globe className="w-5 h-5 text-violet-600" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">
                                                {order.website_domain}
                                            </div>
                                            <div className="text-sm text-gray-500 flex items-center gap-2">
                                                <span className="capitalize">{order.order_type.replace('_', ' ')}</span>
                                                <span>•</span>
                                                <span>{order.publisher_name}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}>
                                            {order.status.replace('_', ' ')}
                                        </span>
                                        <span className="font-medium text-gray-900">
                                            {formatCurrency(order.total_amount)}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
