'use client';


import { useState, useEffect } from 'react';
import Link from 'next/link';
import PayoutForm from '@/components/payout/payout-form';
import { ArrowLeft } from 'lucide-react';

interface Balances {
    publisherBalance: number;
    affiliateBalance: number;
    buyerBalance: number;
}

export default function PayoutPage() {
    const [balances, setBalances] = useState<Balances | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchBalances = async () => {
        try {
            const res = await fetch('/api/payouts');
            if (res.ok) {
                const data = await res.json() as any;
                setBalances({
                    publisherBalance: data.publisherBalance || 0,
                    affiliateBalance: data.affiliateBalance || 0,
                    buyerBalance: data.buyerBalance || 0
                });
            }
        } catch (err) {
            console.error('Failed to fetch balances:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBalances();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/publisher/earnings" className="text-gray-500 hover:text-gray-700">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Request Payout</h1>
                    <p className="text-gray-600">Withdraw your earnings via PayPal, Payoneer, or transfer to buyer wallet</p>
                </div>
            </div>

            {/* Balance Summary */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-violet-50 border border-violet-200 rounded-lg p-4">
                    <p className="text-sm text-violet-600 font-medium">Publisher Balance</p>
                    <p className="text-2xl font-bold text-violet-700">
                        ${((balances?.publisherBalance || 0) / 100).toFixed(2)}
                    </p>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                    <p className="text-sm text-emerald-600 font-medium">Affiliate Balance</p>
                    <p className="text-2xl font-bold text-emerald-700">
                        ${((balances?.affiliateBalance || 0) / 100).toFixed(2)}
                    </p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-600 font-medium">Buyer Wallet</p>
                    <p className="text-2xl font-bold text-green-700">
                        ${((balances?.buyerBalance || 0) / 100).toFixed(2)}
                    </p>
                </div>
            </div>

            {/* Payout Form */}
            {balances && (
                <PayoutForm
                    publisherBalance={balances.publisherBalance}
                    affiliateBalance={balances.affiliateBalance}
                    onSuccess={fetchBalances}
                />
            )}

            {/* Info */}
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                <p className="font-medium text-gray-900 mb-2">Payout Information</p>
                <ul className="space-y-1 list-disc list-inside">
                    <li><strong>Buyer Wallet Transfer:</strong> Instant - use for ordering guest posts & links</li>
                    <li><strong>PayPal:</strong> 3-5 business days processing time</li>
                    <li><strong>Payoneer:</strong> 3-5 business days processing time</li>
                    <li>Minimum payout: $5</li>
                    <li>No fees for transfers to buyer wallet</li>
                </ul>
            </div>
        </div>
    );
}
