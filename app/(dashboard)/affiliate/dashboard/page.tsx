'use client';


import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    DollarSign,
    Users,
    Link2,
    TrendingUp,
    ArrowRight,
    Copy,
    Check,
    Loader2,
} from 'lucide-react';

interface Stats {
    affiliateCode: string;
    affiliateBalance: number;
    totalEarnings: number;
    pendingCommissions: number;
    totalReferrals: number;
    convertedReferrals: number;
    conversionRate: number;
}

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

export default function AffiliateDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [referrals, setReferrals] = useState<Referral[]>([]);
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
                    setStats(statsData);
                }

                if (referralsRes.ok) {
                    const referralsData = await referralsRes.json() as any;
                    setReferrals(referralsData.referrals || []);
                }
            } catch (error) {
                console.error('Error fetching affiliate data:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const affiliateLink = stats?.affiliateCode
        ? `${typeof window !== 'undefined' ? window.location.origin : ''}/?ref=${stats.affiliateCode}`
        : '';

    const copyLink = () => {
        navigator.clipboard.writeText(affiliateLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const formatCurrency = (cents: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(cents / 100);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Affiliate Dashboard</h1>
                <p className="text-gray-500 mt-1">Track your referrals and earnings</p>
            </div>

            {/* Affiliate Link */}
            <Card className="bg-gradient-to-r from-emerald-500 to-green-500 text-white border-0">
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <p className="text-sm text-emerald-100">Your Affiliate Link</p>
                            <p className="font-mono text-lg mt-1 break-all">{affiliateLink}</p>
                            <p className="text-sm text-emerald-100 mt-2">
                                Earn <strong>7.5%</strong> on every order from your referrals!
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="secondary"
                                className="bg-white/20 hover:bg-white/30 text-white border-0"
                                onClick={copyLink}
                            >
                                {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                                {copied ? 'Copied!' : 'Copy Link'}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

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
                                    {formatCurrency(stats?.totalEarnings || 0)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                                <DollarSign className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Pending</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {formatCurrency(stats?.pendingCommissions || 0)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Referrals</p>
                                <p className="text-2xl font-bold text-gray-900">{stats?.totalReferrals || 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Conversion Rate</p>
                                <p className="text-2xl font-bold text-gray-900">{stats?.conversionRate || 0}%</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Referrals */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Recent Referrals</CardTitle>
                    <Link href="/affiliate/referrals" className="text-sm text-violet-600 hover:underline flex items-center gap-1">
                        View All <ArrowRight className="w-4 h-4" />
                    </Link>
                </CardHeader>
                <CardContent>
                    {referrals.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <Users className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                            <p>No referrals yet. Share your link to get started!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {referrals.slice(0, 5).map((referral) => (
                                <div
                                    key={referral.id}
                                    className="flex items-center justify-between p-4 rounded-lg border hover:border-violet-200 transition-colors"
                                >
                                    <div>
                                        <p className="font-medium text-gray-900">{referral.email}</p>
                                        <p className="text-sm text-gray-500">
                                            {referral.status === 'active'
                                                ? `${referral.totalOrders} orders placed`
                                                : 'Signed up, no orders yet'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${referral.status === 'active'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-gray-100 text-gray-700'
                                            }`}>
                                            {referral.status === 'active' ? 'Active' : 'Pending'}
                                        </span>
                                        {referral.yourCommission > 0 && (
                                            <span className="font-medium text-emerald-600">
                                                +{formatCurrency(referral.yourCommission)}
                                            </span>
                                        )}
                                        <span className="text-sm text-gray-500">{referral.signupDate}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Link2 className="w-5 h-5" />
                        Your Affiliate Code
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="font-mono text-2xl font-bold text-gray-900">
                            {stats?.affiliateCode || 'Loading...'}
                        </div>
                        <div className="text-sm text-gray-500">
                            <p>Cookie duration: <strong>180 days</strong></p>
                            <p>Commission rate: <strong className="text-emerald-600">7.5%</strong></p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
