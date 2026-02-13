export const runtime = "edge";

import { sql } from '@/lib/db';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, CheckCircle, XCircle, Clock, Eye } from 'lucide-react';



async function getRefundRequests() {
    try {
        const result = await sql`
      SELECT rr.*, 
             o.order_number, o.total_amount as order_total,
             u.name as buyer_name, u.email as buyer_email
      FROM refund_requests rr
      JOIN orders o ON rr.order_id = o.id
      JOIN users u ON rr.buyer_id = u.id
      ORDER BY rr.created_at DESC
      LIMIT 50
    `;
        return result.rows;
    } catch (error) {
        console.error('Error fetching refund requests:', error);
        return [];
    }
}

export default async function AdminRefundsPage() {
    const refunds = await getRefundRequests();

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
                    <h1 className="text-3xl font-bold text-white">Refund Requests</h1>
                    <p className="text-slate-400 mt-1">Review and process refund requests</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2 text-yellow-400">
                            <Clock className="w-5 h-5" />
                            <span className="text-2xl font-bold">
                                {refunds.filter((r: any) => r.status === 'pending').length}
                            </span>
                        </div>
                        <p className="text-sm text-slate-400 mt-1">Pending</p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2 text-green-400">
                            <CheckCircle className="w-5 h-5" />
                            <span className="text-2xl font-bold">
                                {refunds.filter((r: any) => r.status === 'approved').length}
                            </span>
                        </div>
                        <p className="text-sm text-slate-400 mt-1">Approved</p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2 text-red-400">
                            <XCircle className="w-5 h-5" />
                            <span className="text-2xl font-bold">
                                {refunds.filter((r: any) => r.status === 'rejected').length}
                            </span>
                        </div>
                        <p className="text-sm text-slate-400 mt-1">Rejected</p>
                    </CardContent>
                </Card>
            </div>

            {/* Refunds Table */}
            <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-0">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-700">
                                <th className="text-left p-4 text-sm font-medium text-slate-400">Request</th>
                                <th className="text-left p-4 text-sm font-medium text-slate-400">Buyer</th>
                                <th className="text-left p-4 text-sm font-medium text-slate-400">Reason</th>
                                <th className="text-left p-4 text-sm font-medium text-slate-400">Amount</th>
                                <th className="text-left p-4 text-sm font-medium text-slate-400">Status</th>
                                <th className="text-right p-4 text-sm font-medium text-slate-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {refunds.map((refund: any) => (
                                <tr key={refund.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                                    <td className="p-4">
                                        <div>
                                            <span className="font-mono text-sm text-white">{refund.order_number}</span>
                                            <div className="text-xs text-slate-400 mt-1">
                                                Order total: {formatCurrency(refund.order_total)}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div>
                                            <div className="text-white">{refund.buyer_name}</div>
                                            <div className="text-xs text-slate-400">{refund.buyer_email}</div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-slate-300 max-w-xs truncate">{refund.reason}</td>
                                    <td className="p-4">
                                        <span className="font-medium text-emerald-400">{formatCurrency(refund.amount)}</span>
                                    </td>
                                    <td className="p-4">
                                        {refund.status === 'pending' && (
                                            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full flex items-center gap-1 w-fit">
                                                <Clock className="w-3 h-3" /> Pending
                                            </span>
                                        )}
                                        {refund.status === 'approved' && (
                                            <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full flex items-center gap-1 w-fit">
                                                <CheckCircle className="w-3 h-3" /> Approved
                                            </span>
                                        )}
                                        {refund.status === 'rejected' && (
                                            <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full flex items-center gap-1 w-fit">
                                                <XCircle className="w-3 h-3" /> Rejected
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 text-right">
                                        {refund.status === 'pending' ? (
                                            <div className="flex items-center justify-end gap-2">
                                                <Button size="sm" className="bg-green-600 hover:bg-green-500 gap-1">
                                                    <CheckCircle className="w-4 h-4" /> Approve
                                                </Button>
                                                <Button size="sm" variant="outline" className="border-red-600 text-red-400 hover:bg-red-600/20 gap-1">
                                                    <XCircle className="w-4 h-4" /> Reject
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white gap-1">
                                                <Eye className="w-4 h-4" /> View
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {refunds.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-slate-400">
                                        No refund requests
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
