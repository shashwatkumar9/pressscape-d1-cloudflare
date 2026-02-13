export const runtime = "edge";

import { sql } from '@/lib/db';
import { validateAdminRequest } from '@/lib/admin-auth';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, Clock, CheckCircle, XCircle } from 'lucide-react';



async function getPayoutRequests() {
    try {
        const result = await sql`
            SELECT 
                pr.*,
                u.name as publisher_name,
                u.email as publisher_email
            FROM payout_requests pr
            JOIN users u ON pr.user_id = u.id
            ORDER BY 
                CASE pr.status
                    WHEN 'pending' THEN 1
                    WHEN 'processing' THEN 2
                    WHEN 'completed' THEN 3
                    ELSE 4
                END,
                pr.created_at DESC
            LIMIT 100
        `;
        return result.rows;
    } catch (error) {
        console.error('Error fetching payout requests:', error);
        return [];
    }
}

interface PayoutStats {
    pending_count: number;
    processing_count: number;
    completed_count: number;
    pending_amount: number;
    total_paid: number;
}

async function getPayoutStats(): Promise<PayoutStats> {
    try {
        const result = await sql`
            SELECT 
                COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
                COUNT(*) FILTER (WHERE status = 'processing') as processing_count,
                COUNT(*) FILTER (WHERE status = 'completed') as completed_count,
                COALESCE(SUM(amount) FILTER (WHERE status = 'pending'), 0) as pending_amount,
                COALESCE(SUM(amount) FILTER (WHERE status = 'completed'), 0) as total_paid
            FROM payout_requests
        `;
        const row = result.rows[0] as Record<string, unknown>;
        return {
            pending_count: parseInt(String(row.pending_count)) || 0,
            processing_count: parseInt(String(row.processing_count)) || 0,
            completed_count: parseInt(String(row.completed_count)) || 0,
            pending_amount: parseInt(String(row.pending_amount)) || 0,
            total_paid: parseInt(String(row.total_paid)) || 0,
        };
    } catch (error) {
        console.error('Error fetching stats:', error);
        return { pending_count: 0, processing_count: 0, completed_count: 0, pending_amount: 0, total_paid: 0 };
    }
}

export default async function AdminPayoutsPage() {
    const payouts = await getPayoutRequests();
    const stats = await getPayoutStats();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white">Publisher Payouts</h1>
                <p className="text-slate-400 mt-1">Manage withdrawal requests from publishers</p>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-4 gap-4">
                <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm">Pending</p>
                                <p className="text-2xl font-bold text-white mt-1">{stats.pending_count}</p>
                                <p className="text-slate-500 text-sm mt-1">
                                    ${(stats.pending_amount / 100).toFixed(2)}
                                </p>
                            </div>
                            <Clock className="w-8 h-8 text-yellow-400" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm">Processing</p>
                                <p className="text-2xl font-bold text-white mt-1">{stats.processing_count}</p>
                            </div>
                            <DollarSign className="w-8 h-8 text-blue-400" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm">Completed</p>
                                <p className="text-2xl font-bold text-white mt-1">{stats.completed_count}</p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-green-400" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm">Total Paid</p>
                                <p className="text-2xl font-bold text-white mt-1">
                                    ${(stats.total_paid / 100).toFixed(2)}
                                </p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-violet-400" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Payouts Table */}
            <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                    <CardTitle className="text-white">Payout Requests</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-700">
                                <th className="text-left p-4 text-sm font-medium text-slate-400">Publisher</th>
                                <th className="text-left p-4 text-sm font-medium text-slate-400">Amount</th>
                                <th className="text-left p-4 text-sm font-medium text-slate-400">Method</th>
                                <th className="text-left p-4 text-sm font-medium text-slate-400">Email</th>
                                <th className="text-left p-4 text-sm font-medium text-slate-400">Status</th>
                                <th className="text-left p-4 text-sm font-medium text-slate-400">Requested</th>
                                <th className="text-right p-4 text-sm font-medium text-slate-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payouts.map((payout: any) => (
                                <tr key={payout.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                                    <td className="p-4">
                                        <div>
                                            <div className="font-medium text-white">{payout.publisher_name}</div>
                                            <div className="text-sm text-slate-400">{payout.publisher_email}</div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="font-semibold text-white">
                                            ${(payout.amount / 100).toFixed(2)}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded-full capitalize">
                                            {payout.payout_method}
                                        </span>
                                    </td>
                                    <td className="p-4 text-slate-300 text-sm">{payout.payout_email}</td>
                                    <td className="p-4">
                                        {payout.status === 'pending' && (
                                            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full flex items-center gap-1 w-fit">
                                                <Clock className="w-3 h-3" /> Pending
                                            </span>
                                        )}
                                        {payout.status === 'processing' && (
                                            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full flex items-center gap-1 w-fit">
                                                <DollarSign className="w-3 h-3" /> Processing
                                            </span>
                                        )}
                                        {payout.status === 'completed' && (
                                            <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full flex items-center gap-1 w-fit">
                                                <CheckCircle className="w-3 h-3" /> Completed
                                            </span>
                                        )}
                                        {payout.status === 'rejected' && (
                                            <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full flex items-center gap-1 w-fit">
                                                <XCircle className="w-3 h-3" /> Rejected
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 text-sm text-slate-400">
                                        {new Date(payout.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-right">
                                        {payout.status === 'pending' && (
                                            <Link href={`/admin/payouts/${payout.id}`}>
                                                <Button size="sm" className="bg-gradient-to-r from-violet-600 to-indigo-600">
                                                    Process
                                                </Button>
                                            </Link>
                                        )}
                                        {payout.status === 'completed' && payout.processed_at && (
                                            <div className="text-xs text-slate-500">
                                                {new Date(payout.processed_at).toLocaleDateString()}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {payouts.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-slate-400">
                                        No payout requests yet
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
