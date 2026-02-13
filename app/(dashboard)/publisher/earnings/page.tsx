import { sql } from '@/lib/db';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    DollarSign,
    TrendingUp,
    Clock,
    CheckCircle,
    Download,
    Calendar,
    Wallet,
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

interface EarningStats {
    total_earned: number;
    pending_amount: number;
    this_month: number;
    last_month: number;
}

async function getEarningsStats(userId: string): Promise<EarningStats> {
    try {
        const result = await sql`
            SELECT 
                COALESCE(SUM(publisher_earnings) FILTER (WHERE status = 'completed'), 0) as total_earned,
                COALESCE(SUM(publisher_earnings) FILTER (WHERE status IN ('pending', 'accepted', 'writing', 'content_submitted', 'revision_needed', 'approved')), 0) as pending_amount,
                COALESCE(SUM(publisher_earnings) FILTER (WHERE status = 'completed' AND created_at >= date_trunc('month', CURRENT_DATE)), 0) as this_month,
                COALESCE(SUM(publisher_earnings) FILTER (WHERE status = 'completed' AND created_at >= date_trunc('month', CURRENT_DATE - INTERVAL '1 month') AND created_at < date_trunc('month', CURRENT_DATE)), 0) as last_month
            FROM orders
            WHERE publisher_id = ${userId}
        `;
        const row = result.rows[0] as any;
        return {
            total_earned: parseInt(row.total_earned) || 0,
            pending_amount: parseInt(row.pending_amount) || 0,
            this_month: parseInt(row.this_month) || 0,
            last_month: parseInt(row.last_month) || 0,
        };
    } catch (error) {
        console.error('Error fetching earning stats:', error);
        return { total_earned: 0, pending_amount: 0, this_month: 0, last_month: 0 };
    }
}

async function getMonthlyEarnings(userId: string) {
    try {
        const result = await sql`
            SELECT 
                to_char(created_at, 'Month') as month,
                SUM(publisher_earnings) as amount,
                COUNT(*) as orders
            FROM orders
            WHERE publisher_id = ${userId} AND status = 'completed'
            GROUP BY to_char(created_at, 'Month'), date_trunc('month', created_at)
            ORDER BY date_trunc('month', created_at) DESC
            LIMIT 6
        `;
        return result.rows;
    } catch (error) {
        return [];
    }
}

export default async function EarningsPage() {
    const session = await getSession();

    if (!session) {
        return (
            <div className="text-center py-12">
                <p>Please log in to view earnings.</p>
                <Link href="/login"><Button className="mt-4">Login</Button></Link>
            </div>
        );
    }

    const stats = await getEarningsStats(session.user_id as string);
    const monthlyEarnings = await getMonthlyEarnings(session.user_id as string);

    const formatCurrency = (cents: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(cents / 100);
    };

    const percentChange = stats.last_month > 0
        ? ((stats.this_month - stats.last_month) / stats.last_month * 100).toFixed(1)
        : stats.this_month > 0 ? '100' : '0';
    const isPositive = parseFloat(percentChange) >= 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Earnings</h1>
                    <p className="text-gray-600 mt-1">Track your revenue and manage payouts</p>
                </div>
                <Link href="/publisher/payout">
                    <Button className="gap-2">
                        <Wallet className="w-4 h-4" />
                        Request Payout
                    </Button>
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className="w-4 h-4 text-emerald-600" />
                            <span className="text-sm text-gray-600">Total Earnings</span>
                        </div>
                        <div className="text-2xl font-bold text-emerald-600">{formatCurrency(stats.total_earned)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-1">
                            <Calendar className="w-4 h-4 text-violet-600" />
                            <span className="text-sm text-gray-600">This Month</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{formatCurrency(stats.this_month)}</div>
                        <div className={`text-xs mt-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                            {isPositive ? '+' : ''}{percentChange}% vs last month
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-1">
                            <Clock className="w-4 h-4 text-yellow-600" />
                            <span className="text-sm text-gray-600">Pending</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{formatCurrency(stats.pending_amount)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-1">
                            <DollarSign className="w-4 h-4 text-blue-600" />
                            <span className="text-sm text-gray-600">Available</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{formatCurrency((session.publisher_balance as number) || 0)}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Monthly History */}
                <Card className="md:col-span-2">
                    <CardContent className="p-6">
                        <h3 className="font-semibold text-gray-900 mb-4">Monthly Earnings</h3>
                        {monthlyEarnings.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">No earnings history yet</div>
                        ) : (
                            <div className="space-y-4">
                                {monthlyEarnings.map((item: any, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                                                <Calendar className="w-5 h-5 text-gray-500" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{item.month.trim()}</p>
                                                <p className="text-sm text-gray-500">{item.orders} orders</p>
                                            </div>
                                        </div>
                                        <span className="font-semibold text-gray-900">
                                            {formatCurrency(parseInt(item.amount))}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Payout History (Mock specific for UI structure, but can be empty) */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900">Payout History</h3>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Download className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="text-center py-8 text-gray-500">
                            <p>No payouts yet</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
