'use client';

export const runtime = "edge";



import { useState, useEffect } from 'react';
import Link from 'next/link';

interface WalletData {
    balance: number;
    balanceFormatted: string;
}

interface Transaction {
    id: string;
    transaction_type: 'credit' | 'debit';
    amount: number;
    description: string;
    created_at: string;
}

export default function WalletPage() {
    const [wallet, setWallet] = useState<WalletData | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [rechargeAmount, setRechargeAmount] = useState('');
    const [recharging, setRecharging] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchWallet();
        fetchTransactions();
    }, []);

    async function fetchWallet() {
        try {
            const res = await fetch('/api/wallet');
            if (res.ok) {
                const data = await res.json() as any;
                setWallet(data);
            }
        } catch (err) {
            console.error('Failed to fetch wallet:', err);
        } finally {
            setLoading(false);
        }
    }

    async function fetchTransactions() {
        try {
            const res = await fetch('/api/wallet/transactions');
            if (res.ok) {
                const data = await res.json() as any;
                setTransactions(data.transactions || []);
            }
        } catch (err) {
            console.error('Failed to fetch transactions:', err);
        }
    }

    async function handleRecharge() {
        setError('');
        setSuccess('');

        const amount = parseFloat(rechargeAmount);
        if (isNaN(amount) || amount < 5) {
            setError('Minimum recharge amount is $5');
            return;
        }

        if (amount > 10000) {
            setError('Maximum recharge amount is $10,000');
            return;
        }

        setRecharging(true);

        try {
            const res = await fetch('/api/wallet/recharge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount, payment_method: 'stripe' })
            });

            const data = await res.json() as any;

            if (!res.ok) {
                setError(data.error || 'Failed to initiate recharge');
                return;
            }

            // For now, redirect to a payment page or open Stripe checkout
            // In a full implementation, you'd use Stripe Elements here
            setSuccess(`Payment initiated. Client secret: ${data.client_secret?.substring(0, 20)}...`);

        } catch (err) {
            setError('Failed to initiate recharge');
        } finally {
            setRecharging(false);
        }
    }

    const presetAmounts = [10, 25, 50, 100, 250, 500];

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Wallet</h1>
                        <p className="text-gray-400 mt-1">Manage your balance and transactions</p>
                    </div>
                    <Link href="/buyer/dashboard" className="text-purple-400 hover:text-purple-300">
                        ← Back to Dashboard
                    </Link>
                </div>

                {/* Balance Card */}
                <div className="bg-gradient-to-br from-purple-900 to-blue-900 rounded-2xl p-8 mb-8">
                    <p className="text-purple-200 text-sm font-medium mb-2">Available Balance</p>
                    <p className="text-5xl font-bold text-white mb-4">
                        {wallet?.balanceFormatted || '$0.00'}
                    </p>
                    <p className="text-purple-200 text-sm">
                        Use your balance to pay for guest posts and link insertions
                    </p>
                </div>

                {/* Recharge Section */}
                <div className="bg-gray-800 rounded-xl p-6 mb-8 border border-gray-700">
                    <h2 className="text-xl font-semibold text-white mb-4">Add Funds</h2>

                    {/* Preset Amounts */}
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-4">
                        {presetAmounts.map((amount) => (
                            <button
                                key={amount}
                                onClick={() => setRechargeAmount(amount.toString())}
                                className={`py-3 px-4 rounded-lg text-center font-medium transition ${rechargeAmount === amount.toString()
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                            >
                                ${amount}
                            </button>
                        ))}
                    </div>

                    {/* Custom Amount */}
                    <div className="flex gap-4 mb-4">
                        <div className="flex-1">
                            <label className="block text-sm text-gray-400 mb-2">Or enter custom amount</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                                <input
                                    type="number"
                                    value={rechargeAmount}
                                    onChange={(e) => setRechargeAmount(e.target.value)}
                                    placeholder="0.00"
                                    min="5"
                                    max="10000"
                                    className="w-full pl-8 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={handleRecharge}
                                disabled={recharging || !rechargeAmount}
                                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                {recharging ? 'Processing...' : 'Add Funds'}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="p-4 bg-green-900/50 border border-green-700 rounded-lg text-green-200">
                            {success}
                        </div>
                    )}

                    <p className="text-gray-500 text-sm mt-4">
                        Minimum: $5 · Maximum: $10,000 · Secure payment via Stripe
                    </p>
                </div>

                {/* Transaction History */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <h2 className="text-xl font-semibold text-white mb-4">Transaction History</h2>

                    {transactions.length === 0 ? (
                        <p className="text-gray-400 text-center py-8">
                            No transactions yet. Add funds to get started!
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {transactions.map((tx) => (
                                <div
                                    key={tx.id}
                                    className="flex items-center justify-between p-4 bg-gray-750 rounded-lg"
                                >
                                    <div>
                                        <p className="text-white font-medium">{tx.description}</p>
                                        <p className="text-gray-400 text-sm">
                                            {new Date(tx.created_at).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                    <span className={`font-bold ${tx.transaction_type === 'credit'
                                            ? 'text-green-400'
                                            : 'text-red-400'
                                        }`}>
                                        {tx.transaction_type === 'credit' ? '+' : '-'}
                                        ${(tx.amount / 100).toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
