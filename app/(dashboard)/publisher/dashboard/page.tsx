import { sql } from '@/lib/db';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    DollarSign,
    Globe,
    PackageOpen,
    TrendingUp,
    Plus,
    ArrowRight,
} from 'lucide-react';

async function getSession() {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('auth_session')?.value;
    if (!sessionId) return null;
    const result = await sql`
    SELECT s.*, u.* FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.id = ${sessionId} AND s.expires_at > NOW()
  `;
    return result.rows[0] || null;
}

interface Stats {
    earnings: number;
    pendingOrders: number;
    completedThisMonth: number;
    websiteCount: number;
}

interface Website {
    id: string;
    domain: string;
    da: number;
    price: number;
    status: string;
}

interface Order {
    id: string;
    website_domain: string;
    order_type: string;
    total_amount: number;
    status: string;
    created_at: string;
}

async function getPublisherStats(userId: string): Promise<Stats> {
    try {
        // Get earnings balance
        const balanceResult = await sql`
      SELECT publisher_balance FROM users WHERE id = ${userId}
    `;
        const earnings = (balanceResult.rows[0] as { publisher_balance: number })?.publisher_balance || 0;

        // Get order counts
        const ordersResult = await sql`
      SELECT 
        COUNT(*) FILTER (WHERE status IN ('pending', 'in_progress')) as pending,
        COUNT(*) FILTER (WHERE status = 'completed' AND created_at >= date_trunc('month', NOW())) as this_month
      FROM orders WHERE publisher_id = ${userId}
    `;
        const counts = ordersResult.rows[0] as { pending: string; this_month: string };

        // Get website count
        const websiteResult = await sql`
      SELECT COUNT(*) as count FROM websites WHERE owner_id = ${userId}
    `;
        const websiteCount = parseInt((websiteResult.rows[0] as { count: string })?.count) || 0;

        return {
            earnings,
            pendingOrders: parseInt(counts.pending) || 0,
            completedThisMonth: parseInt(counts.this_month) || 0,
            websiteCount,
        };
    } catch (error) {
        console.error('Error fetching publisher stats:', error);
        return { earnings: 0, pendingOrders: 0, completedThisMonth: 0, websiteCount: 0 };
    }
}

async function getWebsites(userId: string): Promise<Website[]> {
    try {
        const result = await sql`
      SELECT id, domain, domain_authority as da, price_guest_post as price, 
             CASE WHEN is_active AND verification_status = 'approved' THEN 'active' ELSE 'pending' END as status
      FROM websites 
      WHERE owner_id = ${userId}
      ORDER BY domain_authority DESC NULLS LAST
      LIMIT 5
    `;
        return result.rows as unknown as Website[];
    } catch (error) {
        console.error('Error fetching websites:', error);
        return [];
    }
}

async function getRecentOrders(userId: string): Promise<Order[]> {
    try {
        const result = await sql`
      SELECT o.id, o.order_type, o.total_amount, o.status, o.created_at, w.domain as website_domain
      FROM orders o
      JOIN websites w ON o.website_id = w.id
      WHERE o.publisher_id = ${userId}
      ORDER BY o.created_at DESC
      LIMIT 5
    `;
        return result.rows as unknown as Order[];
    } catch (error) {
        console.error('Error fetching orders:', error);
        return [];
    }
}

export default async function PublisherDashboard() {
    const session = await getSession();

    if (!session) {
        return (
            <div className="text-center py-12">
                <p>Please log in to view your dashboard.</p>
                <Link href="/login"><Button className="mt-4">Login</Button></Link>
            </div>
        );
    }

    const stats = await getPublisherStats(session.user_id as string);
    const websites = await getWebsites(session.user_id as string);
    const recentOrders = await getRecentOrders(session.user_id as string);

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Publisher Dashboard</h1>
                    <p className="text-gray-500 mt-1">Manage your websites and incoming orders</p>
                </div>
                <Link href="/publisher/websites/new">
                    <Button className="gap-2">
                        <Plus className="w-4 h-4" />
                        Add Website
                    </Button>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center">
                                <DollarSign className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Earnings</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    ${(stats.earnings / 100).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                                <PackageOpen className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Pending Orders</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Completed This Month</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.completedThisMonth}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                                <Globe className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Websites</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.websiteCount}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* My Websites */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>My Websites</CardTitle>
                    <Link href="/publisher/websites" className="text-sm text-violet-600 hover:underline flex items-center gap-1">
                        View All <ArrowRight className="w-4 h-4" />
                    </Link>
                </CardHeader>
                <CardContent>
                    {websites.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No websites yet</p>
                            <Link href="/publisher/websites/new">
                                <Button variant="outline" className="mt-4">Add Your First Website</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {websites.map((website) => (
                                <div
                                    key={website.id}
                                    className="flex items-center justify-between p-4 rounded-lg border bg-gray-50/50 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
                                            <Globe className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{website.domain}</p>
                                            <p className="text-sm text-gray-500">
                                                DA: {website.da} • ${(website.price / 100).toFixed(0)} Guest Post
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${website.status === 'active'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {website.status === 'active' ? '✓ Active' : 'Pending'}
                                        </span>
                                        <Link href={`/publisher/websites/${website.id}`}>
                                            <Button variant="outline" size="sm">Manage</Button>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Recent Orders</CardTitle>
                    <Link href="/publisher/orders" className="text-sm text-violet-600 hover:underline flex items-center gap-1">
                        View All <ArrowRight className="w-4 h-4" />
                    </Link>
                </CardHeader>
                <CardContent>
                    {recentOrders.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <PackageOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No orders yet</p>
                            <p className="text-sm mt-2">Orders will appear here when buyers purchase from your websites</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {recentOrders.map((order) => (
                                <div
                                    key={order.id}
                                    className="flex items-center justify-between p-4 rounded-lg border hover:border-violet-200 transition-colors"
                                >
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-gray-900">#{order.id.slice(0, 8)}</span>
                                            <span className="text-gray-400">•</span>
                                            <span className="text-gray-600">{order.website_domain}</span>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1 capitalize">
                                            {order.order_type.replace('_', ' ')} • ${(order.total_amount / 100).toFixed(0)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                order.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                                    order.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                        'bg-gray-100 text-gray-700'
                                            }`}>
                                            {order.status.replace('_', ' ')}
                                        </span>
                                        <Link href={`/publisher/orders/${order.id}`}>
                                            <Button variant="outline" size="sm">View</Button>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
