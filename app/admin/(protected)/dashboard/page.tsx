export const runtime = "edge";

import { sql } from '@/lib/db';
import { validateAdminRequest } from '@/lib/admin-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {

    Users,
    Globe,
    PackageOpen,
    DollarSign,
    TrendingUp,
    Clock,
    CheckCircle,
    XCircle,
} from 'lucide-react';


async function getStats() {
    try {
        const [usersResult, websitesResult, ordersResult] = await Promise.all([
            sql`SELECT COUNT(*) as count FROM users`,
            sql`SELECT 
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE verification_status = 'pending') as pending,
            COUNT(*) FILTER (WHERE verification_status = 'approved') as approved
          FROM websites`,
            sql`SELECT 
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE status = 'pending') as pending,
            COUNT(*) FILTER (WHERE status = 'completed') as completed,
            COALESCE(SUM(total_amount), 0) as revenue
          FROM orders`,
        ]);

        return {
            users: Number((usersResult.rows[0] as Record<string, unknown>).count) || 0,
            websites: {
                total: Number((websitesResult.rows[0] as Record<string, unknown>).total) || 0,
                pending: Number((websitesResult.rows[0] as Record<string, unknown>).pending) || 0,
                approved: Number((websitesResult.rows[0] as Record<string, unknown>).approved) || 0,
            },
            orders: {
                total: Number((ordersResult.rows[0] as Record<string, unknown>).total) || 0,
                pending: Number((ordersResult.rows[0] as Record<string, unknown>).pending) || 0,
                completed: Number((ordersResult.rows[0] as Record<string, unknown>).completed) || 0,
                revenue: Number((ordersResult.rows[0] as Record<string, unknown>).revenue) || 0,
            },
        };
    } catch (error) {
        console.error('Error fetching stats:', error);
        return {
            users: 0,
            websites: { total: 0, pending: 0, approved: 0 },
            orders: { total: 0, pending: 0, completed: 0, revenue: 0 },
        };
    }
}

export default async function AdminDashboard() {
    const { admin } = await validateAdminRequest();
    const stats = await getStats();

    const formatCurrency = (cents: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(cents / 100);
    };

    return (
        <div className="space-y-6">
            {/* Welcome */}
            <div>
                <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                <p className="text-slate-400 mt-1">Welcome back, {admin?.name}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-400">Total Users</p>
                                <p className="text-3xl font-bold text-white">{stats.users}</p>
                            </div>
                            <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                <Users className="w-6 h-6 text-blue-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-400">Total Websites</p>
                                <p className="text-3xl font-bold text-white">{stats.websites.total}</p>
                                <p className="text-xs text-yellow-400 mt-1">{stats.websites.pending} pending</p>
                            </div>
                            <div className="w-12 h-12 rounded-lg bg-violet-500/20 flex items-center justify-center">
                                <Globe className="w-6 h-6 text-violet-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-400">Total Orders</p>
                                <p className="text-3xl font-bold text-white">{stats.orders.total}</p>
                                <p className="text-xs text-green-400 mt-1">{stats.orders.completed} completed</p>
                            </div>
                            <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                                <PackageOpen className="w-6 h-6 text-green-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-400">Total Revenue</p>
                                <p className="text-3xl font-bold text-white">{formatCurrency(stats.orders.revenue)}</p>
                            </div>
                            <div className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                <DollarSign className="w-6 h-6 text-emerald-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Clock className="w-5 h-5 text-yellow-400" />
                            Pending Approvals
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                                <span className="text-slate-300">Website Listings</span>
                                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-sm rounded-full">
                                    {stats.websites.pending}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                                <span className="text-slate-300">Pending Orders</span>
                                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-sm rounded-full">
                                    {stats.orders.pending}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-green-400" />
                            Quick Stats
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                                <span className="text-slate-300">Approved Websites</span>
                                <span className="flex items-center gap-1 text-green-400">
                                    <CheckCircle className="w-4 h-4" />
                                    {stats.websites.approved}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                                <span className="text-slate-300">Completed Orders</span>
                                <span className="flex items-center gap-1 text-green-400">
                                    <CheckCircle className="w-4 h-4" />
                                    {stats.orders.completed}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
