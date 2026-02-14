'use client';


import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Users,
    Link2,
    Copy,
    CheckCircle,
    Loader2,
} from 'lucide-react';

interface Referral {
    id: string;
    name: string;
    email: string;
    status: string;
    signupDate: string;
    totalOrders: number;
    totalSpent: number;
    yourCommission: number;
}

export default function ReferralsPage() {
    const [referrals, setReferrals] = useState<Referral[]>([]);
    const [affiliateCode, setAffiliateCode] = useState('');
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        async function fetchData() {
            try {
                const [statsRes, referralsRes] = await Promise.all([
                    fetch('/api/affiliate/stats'),
                    fetch('/api/affiliate/referrals'),
                ]);

                if (statsRes.ok) {
                    const statsData = await statsRes.json() as any;
                    setAffiliateCode(statsData.affiliateCode || '');
                }

                if (referralsRes.ok) {
                    const referralsData = await referralsRes.json() as any;
                    setReferrals(referralsData.referrals || []);
                }
            } catch (error) {
                console.error('Error fetching referrals:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const affiliateLink = affiliateCode
        ? `${typeof window !== 'undefined' ? window.location.origin : ''}/?ref=${affiliateCode}`
        : '';

    const formatCurrency = (cents: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(cents / 100);
    };

    const copyLink = () => {
        navigator.clipboard.writeText(affiliateLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const totalReferrals = referrals.length;
    const activeReferrals = referrals.filter(r => r.status === 'active').length;
    const totalCommissions = referrals.reduce((sum, r) => sum + r.yourCommission, 0);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Referrals</h1>
                <p className="text-gray-600 mt-1">Track your referrals and earn 7.5% on every order they make</p>
            </div>

            {/* Referral Link Card */}
            <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
                <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center">
                            <Link2 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Your Referral Link</h3>
                            <p className="text-sm text-gray-600">Share this link to earn commissions</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex-1 px-4 py-3 bg-white rounded-lg border text-sm font-mono text-gray-700 truncate">
                            {affiliateLink}
                        </div>
                        <Button
                            onClick={copyLink}
                            className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                        >
                            {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            {copied ? 'Copied!' : 'Copy'}
                        </Button>
                    </div>
                    <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
                        <span>Your code: <strong className="text-gray-900">{affiliateCode}</strong></span>
                        <span>Cookie: <strong className="text-gray-900">180 days</strong></span>
                        <span>Commission: <strong className="text-emerald-600">7.5%</strong></span>
                    </div>
                </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-4">
                        <div className="text-2xl font-bold text-gray-900">{totalReferrals}</div>
                        <div className="text-sm text-gray-600">Total Referrals</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="text-2xl font-bold text-emerald-600">{activeReferrals}</div>
                        <div className="text-sm text-gray-600">Active Users</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="text-2xl font-bold text-gray-900">
                            {referrals.reduce((sum, r) => sum + r.totalOrders, 0)}
                        </div>
                        <div className="text-sm text-gray-600">Total Orders</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="text-2xl font-bold text-emerald-600">
                            {formatCurrency(totalCommissions)}
                        </div>
                        <div className="text-sm text-gray-600">Total Earned</div>
                    </CardContent>
                </Card>
            </div>

            {/* Referrals Table */}
            <Card>
                <CardContent className="pt-6">
                    <h3 className="font-semibold text-gray-900 mb-4">All Referrals</h3>
                    {referrals.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <Users className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                            <p className="font-medium">No referrals yet</p>
                            <p className="text-sm mt-1">Share your affiliate link to start earning commissions!</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left border-b">
                                        <th className="pb-3 font-medium text-gray-500 text-sm">User</th>
                                        <th className="pb-3 font-medium text-gray-500 text-sm">Status</th>
                                        <th className="pb-3 font-medium text-gray-500 text-sm">Signup Date</th>
                                        <th className="pb-3 font-medium text-gray-500 text-sm text-right">Orders</th>
                                        <th className="pb-3 font-medium text-gray-500 text-sm text-right">Spent</th>
                                        <th className="pb-3 font-medium text-gray-500 text-sm text-right">Your Commission</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {referrals.map((referral) => (
                                        <tr key={referral.id} className="border-b last:border-0">
                                            <td className="py-4">
                                                <div className="font-medium text-gray-900">{referral.name}</div>
                                                <div className="text-sm text-gray-500">{referral.email}</div>
                                            </td>
                                            <td className="py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${referral.status === 'active'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="py-4 text-gray-600">{referral.signupDate}</td>
                                            <td className="py-4 text-right text-gray-900">{referral.totalOrders}</td>
                                            <td className="py-4 text-right text-gray-900">{formatCurrency(referral.totalSpent)}</td>
                                            <td className="py-4 text-right font-medium text-emerald-600">
                                                {formatCurrency(referral.yourCommission)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
