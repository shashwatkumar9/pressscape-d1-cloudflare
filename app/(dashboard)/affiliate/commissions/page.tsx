'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    DollarSign,
    TrendingUp,
    Clock,
    CheckCircle,
    Download,
    Calendar,
    ArrowUpRight,
    Wallet,
} from 'lucide-react';

// Mock data
const commissions = [
    {
        id: '1',
        referral: 'John Smith',
        orderId: 'PS-001234',
        orderAmount: 15000,
        commission: 1125,
        status: 'paid',
        date: '2024-01-15',
        paidDate: '2024-02-01',
    },
    {
        id: '2',
        referral: 'Sarah Johnson',
        orderId: 'PS-001235',
        orderAmount: 25000,
        commission: 1875,
        status: 'paid',
        date: '2024-01-14',
        paidDate: '2024-02-01',
    },
    {
        id: '3',
        referral: 'John Smith',
        orderId: 'PS-001236',
        orderAmount: 12000,
        commission: 900,
        status: 'pending',
        date: '2024-01-20',
    },
    {
        id: '4',
        referral: 'Emma Wilson',
        orderId: 'PS-001237',
        orderAmount: 8500,
        commission: 637,
        status: 'pending',
        date: '2024-01-18',
    },
    {
        id: '5',
        referral: 'Sarah Johnson',
        orderId: 'PS-001238',
        orderAmount: 18000,
        commission: 1350,
        status: 'pending',
        date: '2024-01-22',
    },
];

const payouts = [
    {
        id: '1',
        amount: 5250,
        method: 'PayPal',
        status: 'completed',
        date: '2024-02-01',
        reference: 'PAY-001234',
    },
    {
        id: '2',
        amount: 3800,
        method: 'Bank Transfer',
        status: 'completed',
        date: '2024-01-01',
        reference: 'PAY-001233',
    },
];

export default function CommissionsPage() {
    const formatCurrency = (cents: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(cents / 100);
    };

    const totalEarned = commissions.reduce((sum, c) => sum + c.commission, 0);
    const pendingCommissions = commissions.filter(c => c.status === 'pending').reduce((sum, c) => sum + c.commission, 0);
    const paidCommissions = commissions.filter(c => c.status === 'paid').reduce((sum, c) => sum + c.commission, 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Commissions</h1>
                    <p className="text-gray-600 mt-1">Track your earnings and payout history</p>
                </div>
                <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                    <Wallet className="w-4 h-4" />
                    Request Payout
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className="w-4 h-4 text-emerald-600" />
                            <span className="text-sm text-gray-600">Total Earned</span>
                        </div>
                        <div className="text-2xl font-bold text-emerald-600">{formatCurrency(totalEarned)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-1">
                            <Clock className="w-4 h-4 text-yellow-600" />
                            <span className="text-sm text-gray-600">Pending</span>
                        </div>
                        <div className="text-2xl font-bold text-yellow-600">{formatCurrency(pendingCommissions)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-1">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-gray-600">Paid Out</span>
                        </div>
                        <div className="text-2xl font-bold text-green-600">{formatCurrency(paidCommissions)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-1">
                            <Calendar className="w-4 h-4 text-gray-600" />
                            <span className="text-sm text-gray-600">Next Payout</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">Feb 1, 2024</div>
                    </CardContent>
                </Card>
            </div>

            {/* Commission Rate Info */}
            <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-gray-900">Your Commission Rate</h3>
                            <p className="text-sm text-gray-600">Earn on every order your referrals make for 90 days</p>
                        </div>
                        <div className="text-4xl font-bold text-emerald-600">7.5%</div>
                    </div>
                </CardContent>
            </Card>

            {/* Recent Commissions */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900">Recent Commissions</h3>
                        <Button variant="outline" size="sm" className="gap-1">
                            <Download className="w-4 h-4" />
                            Export
                        </Button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left border-b">
                                    <th className="pb-3 font-medium text-gray-500 text-sm">Date</th>
                                    <th className="pb-3 font-medium text-gray-500 text-sm">Referral</th>
                                    <th className="pb-3 font-medium text-gray-500 text-sm">Order</th>
                                    <th className="pb-3 font-medium text-gray-500 text-sm text-right">Order Amount</th>
                                    <th className="pb-3 font-medium text-gray-500 text-sm text-right">Commission (7.5%)</th>
                                    <th className="pb-3 font-medium text-gray-500 text-sm">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {commissions.map((commission) => (
                                    <tr key={commission.id} className="border-b last:border-0">
                                        <td className="py-4 text-gray-600">{commission.date}</td>
                                        <td className="py-4 font-medium text-gray-900">{commission.referral}</td>
                                        <td className="py-4">
                                            <span className="font-mono text-sm text-gray-600">{commission.orderId}</span>
                                        </td>
                                        <td className="py-4 text-right text-gray-900">
                                            {formatCurrency(commission.orderAmount)}
                                        </td>
                                        <td className="py-4 text-right font-medium text-emerald-600">
                                            {formatCurrency(commission.commission)}
                                        </td>
                                        <td className="py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${commission.status === 'paid'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {commission.status.charAt(0).toUpperCase() + commission.status.slice(1)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Payout History */}
            <Card>
                <CardContent className="pt-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Payout History</h3>
                    <div className="space-y-3">
                        {payouts.map((payout) => (
                            <div
                                key={payout.id}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">{payout.method}</div>
                                        <div className="text-sm text-gray-500">
                                            {payout.date} • Ref: {payout.reference}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-lg font-semibold text-gray-900">
                                    {formatCurrency(payout.amount)}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
