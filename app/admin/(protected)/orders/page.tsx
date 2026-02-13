export const runtime = "edge";

import { sql } from '@/lib/db';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PackageOpen, Search, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';



async function getOrders() {
    try {
        const result = await sql`
      SELECT o.*, 
             b.name as buyer_name, b.email as buyer_email,
             w.domain as website_domain,
             p.name as publisher_name, p.email as publisher_email
      FROM orders o
      JOIN users b ON o.buyer_id = b.id
      JOIN websites w ON o.website_id = w.id
      JOIN users p ON o.publisher_id = p.id
      ORDER BY o.created_at DESC
      LIMIT 50
    `;
        return result.rows;
    } catch (error) {
        console.error('Error fetching orders:', error);
        return [];
    }
}

const statusConfig: Record<string, { color: string; icon: any }> = {
    pending: { color: 'bg-yellow-500/20 text-yellow-400', icon: Clock },
    accepted: { color: 'bg-blue-500/20 text-blue-400', icon: Clock },
    writing: { color: 'bg-purple-500/20 text-purple-400', icon: Clock },
    published: { color: 'bg-green-500/20 text-green-400', icon: CheckCircle },
    completed: { color: 'bg-emerald-500/20 text-emerald-400', icon: CheckCircle },
    cancelled: { color: 'bg-red-500/20 text-red-400', icon: XCircle },
    refunded: { color: 'bg-orange-500/20 text-orange-400', icon: XCircle },
};

export default async function AdminOrdersPage() {
    const orders = await getOrders();

    const formatCurrency = (cents: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(cents / 100);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Orders</h1>
                    <p className="text-slate-400 mt-1">View and manage all orders</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search orders..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder:text-slate-400"
                    />
                </div>
                <select className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white">
                    <option>All Status</option>
                    <option>Pending</option>
                    <option>In Progress</option>
                    <option>Completed</option>
                    <option>Cancelled</option>
                </select>
            </div>

            {/* Orders Table */}
            <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-0">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-700">
                                <th className="text-left p-4 text-sm font-medium text-slate-400">Order</th>
                                <th className="text-left p-4 text-sm font-medium text-slate-400">Website</th>
                                <th className="text-left p-4 text-sm font-medium text-slate-400">Buyer</th>
                                <th className="text-left p-4 text-sm font-medium text-slate-400">Publisher</th>
                                <th className="text-left p-4 text-sm font-medium text-slate-400">Type</th>
                                <th className="text-left p-4 text-sm font-medium text-slate-400">Amount</th>
                                <th className="text-left p-4 text-sm font-medium text-slate-400">Status</th>
                                <th className="text-left p-4 text-sm font-medium text-slate-400">Date</th>
                                <th className="text-right p-4 text-sm font-medium text-slate-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order: any) => {
                                const status = statusConfig[order.status] || statusConfig.pending;
                                const StatusIcon = status.icon;
                                return (
                                    <tr key={order.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                                        <td className="p-4">
                                            <span className="font-mono text-sm text-white">{order.order_number}</span>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-white">{order.website_domain}</span>
                                        </td>
                                        <td className="p-4">
                                            <div>
                                                <div className="text-white">{order.buyer_name}</div>
                                                <div className="text-xs text-slate-400">{order.buyer_email}</div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div>
                                                <div className="text-white">{order.publisher_name}</div>
                                                <div className="text-xs text-slate-400">{order.publisher_email}</div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="capitalize text-slate-300">{order.order_type?.replace('_', ' ')}</span>
                                        </td>
                                        <td className="p-4">
                                            <span className="font-medium text-emerald-400">{formatCurrency(order.total_amount)}</span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${status.color}`}>
                                                <StatusIcon className="w-3 h-3" />
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-slate-400">
                                            {new Date(order.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-right">
                                            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white gap-1">
                                                <Eye className="w-4 h-4" /> View
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {orders.length === 0 && (
                                <tr>
                                    <td colSpan={9} className="p-8 text-center text-slate-400">
                                        No orders found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
}
