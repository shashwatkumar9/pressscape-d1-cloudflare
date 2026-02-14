export const runtime = 'edge';

import { sql } from '@/lib/db';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    PackageOpen,
    Clock,
    CheckCircle,
    XCircle,
    Globe,
    FileText,
    MessageSquare,
    ExternalLink,
    ChevronRight,
    AlertCircle,
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

interface Order {
    id: string;
    order_type: string;
    status: string;
    total_amount: number;
    publisher_earnings: number;
    created_at: string;
    deadline_at: string | null;
    completed_at: string | null;
    article_url: string | null;
    anchor_text: string;
    website_domain: string;
    buyer_name: string;
}

async function getPublisherOrders(userId: string) {
    try {
        const result = await sql`
            SELECT 
                o.id, o.order_type, o.status, o.total_amount, o.publisher_earnings, o.created_at, 
                o.deadline_at, o.completed_at, o.article_url, o.anchor_text,
                w.domain as website_domain,
                u.name as buyer_name
            FROM orders o
            JOIN websites w ON o.website_id = w.id
            JOIN users u ON o.buyer_id = u.id
            WHERE o.publisher_id = ${userId}
            ORDER BY o.created_at DESC
        `;
        return result.rows as unknown as Order[];
    } catch (error) {
        console.error('Error fetching publisher orders:', error);
        return [];
    }
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    accepted: { label: 'In Progress', color: 'bg-blue-100 text-blue-700', icon: FileText },
    writing: { label: 'In Progress', color: 'bg-blue-100 text-blue-700', icon: FileText },
    content_submitted: { label: 'Review', color: 'bg-purple-100 text-purple-700', icon: AlertCircle },
    revision_needed: { label: 'Revision', color: 'bg-orange-100 text-orange-700', icon: AlertCircle },
    approved: { label: 'Processing', color: 'bg-indigo-100 text-indigo-700', icon: Clock },
    published: { label: 'Published', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    completed: { label: 'Completed', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: XCircle },
    refunded: { label: 'Refunded', color: 'bg-gray-100 text-gray-700', icon: XCircle },
    disputed: { label: 'Disputed', color: 'bg-red-100 text-red-700', icon: AlertCircle },
};

export default async function PublisherOrdersPage() {
    const session = await getSession();

    if (!session) {
        return (
            <div className="text-center py-12">
                <p>Please log in to view your orders.</p>
                <Link href="/login"><Button className="mt-4">Login</Button></Link>
            </div>
        );
    }

    const orders = await getPublisherOrders(session.user_id as string);

    const formatCurrency = (cents: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(cents / 100);
    };

    const pendingOrders = orders.filter(o => o.status === 'pending');
    const activeOrders = orders.filter(o => ['accepted', 'writing', 'content_submitted', 'revision_needed'].includes(o.status));
    const completedOrders = orders.filter(o => ['published', 'completed'].includes(o.status));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
                <p className="text-gray-600 mt-1">Manage incoming orders and track fulfillment</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-4">
                        <div className="text-2xl font-bold text-yellow-600">{pendingOrders.length}</div>
                        <div className="text-sm text-gray-600">Pending</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="text-2xl font-bold text-blue-600">{activeOrders.length}</div>
                        <div className="text-sm text-gray-600">In Progress</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="text-2xl font-bold text-green-600">{completedOrders.length}</div>
                        <div className="text-sm text-gray-600">Completed</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="text-2xl font-bold text-emerald-600">
                            {formatCurrency(orders.reduce((sum, o) => sum + o.publisher_earnings, 0))}
                        </div>
                        <div className="text-sm text-gray-600">Total Value</div>
                    </CardContent>
                </Card>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
                {orders.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <PackageOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">No orders yet</h3>
                            <p className="text-gray-500 mt-1">Orders will appear here when buyers purchase from you</p>
                        </CardContent>
                    </Card>
                ) : (
                    orders.map((order) => {
                        const status = statusConfig[order.status] || { label: order.status, color: 'bg-gray-100', icon: Clock };

                        return (
                            <Card key={order.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="pt-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-lg bg-violet-100 flex items-center justify-center">
                                                <PackageOpen className="w-6 h-6 text-violet-600" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3">
                                                    <span className="font-mono text-sm text-gray-500">#{order.id.slice(0, 8)}</span>
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                                                        {status.label}
                                                    </span>
                                                </div>
                                                <h3 className="font-semibold text-gray-900 mt-1 capitalize">
                                                    {order.order_type.replace('_', ' ')} on {order.website_domain}
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    From: {order.buyer_name} • Anchor: "{order.anchor_text}"
                                                </p>

                                                {/* Timeline */}
                                                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                                                    <span>Ordered: {new Date(order.created_at).toLocaleDateString()}</span>
                                                    {order.deadline_at && <span>Due: {new Date(order.deadline_at).toLocaleDateString()}</span>}
                                                    {order.completed_at && <span className="text-green-600">Completed: {new Date(order.completed_at).toLocaleDateString()}</span>}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <div className="text-lg font-semibold text-gray-900">
                                                    {formatCurrency(order.publisher_earnings)}
                                                </div>
                                                <div className="text-sm text-gray-500 capitalize">{order.order_type.replace('_', ' ')}</div>
                                            </div>
                                            <Link href={`/publisher/orders/${order.id}`}>
                                                <Button variant="outline" size="sm" className="gap-1">
                                                    View <ChevronRight className="w-4 h-4" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    {order.status === 'pending' && (
                                        <div className="flex items-center gap-3 mt-4 pt-4 border-t">
                                            <Link href={`/publisher/orders/${order.id}`}>
                                                <Button size="sm" className="gap-1">
                                                    <CheckCircle className="w-4 h-4" />
                                                    View & Accept
                                                </Button>
                                            </Link>
                                            <Link href={`/publisher/orders/${order.id}`}>
                                                <Button variant="outline" size="sm" className="gap-1">
                                                    <MessageSquare className="w-4 h-4" />
                                                    Message Buyer
                                                </Button>
                                            </Link>
                                        </div>
                                    )}

                                    {order.article_url && (
                                        <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                                            <ExternalLink className="w-4 h-4 text-gray-400" />
                                            <a
                                                href={order.article_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-violet-600 hover:underline"
                                            >
                                                {order.article_url}
                                            </a>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </div>
        </div>
    );
}
