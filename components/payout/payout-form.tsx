'use client';

import { useState, useEffect } from 'react';
import { Wallet, ArrowRight, CheckCircle } from 'lucide-react';

interface PayoutFormProps {
    publisherBalance: number;
    affiliateBalance: number;
    onSuccess?: () => void;
}

export default function PayoutForm({ publisherBalance, affiliateBalance, onSuccess }: PayoutFormProps) {
    const [balanceType, setBalanceType] = useState<'publisher' | 'affiliate'>('publisher');
    const [payoutMethod, setPayoutMethod] = useState<'wallet_transfer' | 'paypal' | 'payoneer'>('wallet_transfer');
    const [amount, setAmount] = useState('');
    const [payoutEmail, setPayoutEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const availableBalance = balanceType === 'publisher' ? publisherBalance : affiliateBalance;

    const handleSubmit = async () => {
        setError('');
        setSuccess('');

        const amountCents = Math.round(parseFloat(amount) * 100);

        if (isNaN(amountCents) || amountCents < 500) {
            setError('Minimum payout is $5');
            return;
        }

        if (amountCents > availableBalance) {
            setError('Amount exceeds available balance');
            return;
        }

        if (['paypal', 'payoneer'].includes(payoutMethod) && !payoutEmail) {
            setError(`Please enter your ${payoutMethod === 'paypal' ? 'PayPal' : 'Payoneer'} email`);
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/payouts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: amountCents,
                    balance_type: balanceType,
                    payout_method: payoutMethod,
                    payout_email: payoutEmail || undefined
                })
            });

            const data = await res.json() as any;

            if (res.ok) {
                if (payoutMethod === 'wallet_transfer') {
                    setSuccess(`Successfully transferred $${amount} to your buyer wallet! You can now use it for orders.`);
                } else {
                    setSuccess(`Payout request submitted! $${amount} will be sent to ${payoutEmail} within 3-5 business days.`);
                }
                setAmount('');
                setPayoutEmail('');
                onSuccess?.();
            } else {
                setError(data.error || 'Failed to process payout');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl border p-6 space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Request Payout</h3>

            {/* Balance Type Selection */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Withdraw From</label>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={() => setBalanceType('publisher')}
                        className={`p-3 rounded-lg border-2 text-left transition ${balanceType === 'publisher'
                                ? 'border-violet-600 bg-violet-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                    >
                        <p className="font-medium text-gray-900">Publisher Earnings</p>
                        <p className="text-lg font-bold text-violet-600">${(publisherBalance / 100).toFixed(2)}</p>
                    </button>
                    <button
                        type="button"
                        onClick={() => setBalanceType('affiliate')}
                        className={`p-3 rounded-lg border-2 text-left transition ${balanceType === 'affiliate'
                                ? 'border-emerald-600 bg-emerald-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                    >
                        <p className="font-medium text-gray-900">Affiliate Earnings</p>
                        <p className="text-lg font-bold text-emerald-600">${(affiliateBalance / 100).toFixed(2)}</p>
                    </button>
                </div>
            </div>

            {/* Payout Method Selection */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Payout Method</label>
                <div className="grid grid-cols-3 gap-3">
                    <button
                        type="button"
                        onClick={() => setPayoutMethod('wallet_transfer')}
                        className={`p-3 rounded-lg border-2 text-center transition ${payoutMethod === 'wallet_transfer'
                                ? 'border-green-600 bg-green-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                    >
                        <Wallet className={`w-6 h-6 mx-auto mb-1 ${payoutMethod === 'wallet_transfer' ? 'text-green-600' : 'text-gray-400'}`} />
                        <p className="text-sm font-medium">Buyer Wallet</p>
                        <p className="text-xs text-gray-500">Instant</p>
                    </button>
                    <button
                        type="button"
                        onClick={() => setPayoutMethod('paypal')}
                        className={`p-3 rounded-lg border-2 text-center transition ${payoutMethod === 'paypal'
                                ? 'border-blue-600 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                    >
                        <svg className={`w-6 h-6 mx-auto mb-1 ${payoutMethod === 'paypal' ? 'text-[#0070BA]' : 'text-gray-400'}`} viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20.905 9.5c.21-1.337.095-2.268-.457-3.113C19.565 5.233 18.024 4.5 15.905 4.5H8.762c-.526 0-.988.382-1.071.9l-3.16 18c-.06.357.208.6.562.6h4.095l-.282 1.645c-.052.308.18.517.485.517h3.404c.455 0 .853-.331.927-.778l1.792-10.8c.082-.498.53-.855 1.037-.855h2.182c4.6 0 7.736-1.943 8.728-7.555.052-.297.242-.445.445-.445z" />
                        </svg>
                        <p className="text-sm font-medium">PayPal</p>
                        <p className="text-xs text-gray-500">3-5 days</p>
                    </button>
                    <button
                        type="button"
                        onClick={() => setPayoutMethod('payoneer')}
                        className={`p-3 rounded-lg border-2 text-center transition ${payoutMethod === 'payoneer'
                                ? 'border-orange-600 bg-orange-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                    >
                        <svg className={`w-6 h-6 mx-auto mb-1 ${payoutMethod === 'payoneer' ? 'text-orange-500' : 'text-gray-400'}`} viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                        </svg>
                        <p className="text-sm font-medium">Payoneer</p>
                        <p className="text-xs text-gray-500">3-5 days</p>
                    </button>
                </div>
            </div>

            {/* Wallet Transfer Info */}
            {payoutMethod === 'wallet_transfer' && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start gap-3">
                        <ArrowRight className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                            <p className="font-medium text-green-800">Transfer to Buyer Wallet</p>
                            <p className="text-sm text-green-700">
                                Instantly transfer your earnings to your buyer wallet to use for purchasing guest posts and link insertions.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Payout Email (for PayPal/Payoneer) */}
            {['paypal', 'payoneer'].includes(payoutMethod) && (
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                        {payoutMethod === 'paypal' ? 'PayPal Email' : 'Payoneer Email'}
                    </label>
                    <input
                        type="email"
                        value={payoutEmail}
                        onChange={(e) => setPayoutEmail(e.target.value)}
                        placeholder={payoutMethod === 'paypal' ? 'your@paypal.com' : 'your@payoneer.com'}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none"
                    />
                </div>
            )}

            {/* Amount */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Amount (USD)</label>
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        min="5"
                        max={(availableBalance / 100)}
                        className="w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none"
                    />
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Minimum: $5</span>
                    <button
                        type="button"
                        onClick={() => setAmount((availableBalance / 100).toFixed(2))}
                        className="text-violet-600 hover:text-violet-700 font-medium"
                    >
                        Withdraw All
                    </button>
                </div>
            </div>

            {/* Error/Success Messages */}
            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                </div>
            )}
            {success && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{success}</span>
                </div>
            )}

            {/* Submit Button */}
            <button
                onClick={handleSubmit}
                disabled={loading || !amount || parseFloat(amount) < 5}
                className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
                {loading ? 'Processing...' : payoutMethod === 'wallet_transfer' ? 'Transfer to Wallet' : 'Request Payout'}
            </button>
        </div>
    );
}
