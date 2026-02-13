'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Wallet,
    CreditCard,
    DollarSign,
    ArrowLeft,
    Shield,
    Zap,
    CheckCircle,
    Loader2,
    Gift,
    AlertCircle,
} from 'lucide-react';

// Initialize Stripe
const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
    : null;

const PRESET_AMOUNTS = [50, 100, 250, 500, 1000, 2500, 5000];

// Bonus tiers: No bonus till $1000, 3% for $1000+, 5% for $2500+, 10% for $5000+
function getBonusRate(amount: number): number {
    if (amount >= 5000) return 0.10;
    if (amount >= 2500) return 0.05;
    if (amount >= 1000) return 0.03;
    return 0;
}

function getBonusLabel(amount: number): string | null {
    if (amount >= 5000) return '+10% bonus';
    if (amount >= 2500) return '+5% bonus';
    if (amount >= 1000) return '+3% bonus';
    return null;
}

interface PaymentFormProps {
    amount: number;
    clientSecret: string;
    onSuccess: () => void;
    onCancel: () => void;
}

function StripePaymentForm({ amount, clientSecret, onSuccess, onCancel }: PaymentFormProps) {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsProcessing(true);
        setError(null);

        const { error: submitError } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/buyer/add-funds/success?amount=${amount}`,
            },
        });

        if (submitError) {
            setError(submitError.message || 'An error occurred');
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <PaymentElement />
            {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            )}
            <div className="flex gap-3">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isProcessing}
                    className="flex-1"
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={!stripe || isProcessing}
                    className="flex-1 gap-2"
                >
                    {isProcessing ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            <CreditCard className="w-4 h-4" />
                            Pay ${amount}
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}

export default function AddFundsPage() {
    const router = useRouter();
    const [selectedAmount, setSelectedAmount] = useState<number>(100);
    const [customAmount, setCustomAmount] = useState<string>('');
    const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal' | 'razorpay'>('stripe');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [showPaymentForm, setShowPaymentForm] = useState(false);

    const amount = customAmount ? parseFloat(customAmount) : selectedAmount;
    const isValidAmount = amount >= 5 && amount <= 10000;

    const handleAmountSelect = (amt: number) => {
        setSelectedAmount(amt);
        setCustomAmount('');
    };

    const handleCustomAmountChange = (value: string) => {
        setCustomAmount(value);
        if (value) {
            setSelectedAmount(0);
        }
    };

    const initiatePayment = async () => {
        if (!isValidAmount) {
            setError('Amount must be between $5 and $10,000');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/wallet/recharge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount,
                    payment_method: paymentMethod,
                }),
            });

            const data = await response.json() as any;

            if (!response.ok) {
                throw new Error(data.error || 'Failed to initiate payment');
            }

            if (paymentMethod === 'stripe' && data.client_secret) {
                setClientSecret(data.client_secret);
                setShowPaymentForm(true);
            } else if (paymentMethod === 'paypal' && data.order_id) {
                // Redirect to PayPal
                window.location.href = `https://www.paypal.com/checkoutnow?token=${data.order_id}`;
            } else if (paymentMethod === 'razorpay' && data.order_id) {
                // Initialize Razorpay
                const options = {
                    key: data.key_id,
                    amount: data.amount,
                    currency: 'USD',
                    name: 'PressScape',
                    description: 'Wallet Recharge',
                    order_id: data.order_id,
                    handler: function (response: any) {
                        // Verify payment on server
                        fetch('/api/payments/razorpay/verify', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                            }),
                        }).then(() => {
                            router.push(`/buyer/add-funds/success?amount=${amount}`);
                        });
                    },
                    prefill: {},
                    theme: {
                        color: '#7c3aed',
                    },
                };
                const rzp = new (window as any).Razorpay(options);
                rzp.open();
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePaymentSuccess = () => {
        router.push(`/buyer/add-funds/success?amount=${amount}`);
    };

    const handlePaymentCancel = () => {
        setShowPaymentForm(false);
        setClientSecret(null);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/buyer/dashboard">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Add Funds</h1>
                    <p className="text-gray-600">Top up your wallet to place orders</p>
                </div>
            </div>

            {/* Promotional Banner */}
            <Card className="bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0">
                <CardContent className="py-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <Gift className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-medium">Bonus Credits</p>
                            <p className="text-sm text-violet-100">
                                $1000+ → 3% bonus • $2500+ → 5% bonus • $5000+ → 10% bonus
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {showPaymentForm && clientSecret && stripePromise ? (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="w-5 h-5" />
                            Complete Payment
                        </CardTitle>
                        <CardDescription>
                            Adding ${amount.toFixed(2)} to your wallet
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Elements
                            stripe={stripePromise}
                            options={{
                                clientSecret,
                                appearance: {
                                    theme: 'stripe',
                                    variables: {
                                        colorPrimary: '#7c3aed',
                                    },
                                },
                            }}
                        >
                            <StripePaymentForm
                                amount={amount}
                                clientSecret={clientSecret}
                                onSuccess={handlePaymentSuccess}
                                onCancel={handlePaymentCancel}
                            />
                        </Elements>
                    </CardContent>
                </Card>
            ) : (
                <>
                    {/* Amount Selection */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-emerald-600" />
                                Select Amount
                            </CardTitle>
                            <CardDescription>
                                Choose a preset amount or enter a custom value
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Preset Amounts */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                {PRESET_AMOUNTS.map((amt) => {
                                    const bonusLabel = getBonusLabel(amt);
                                    return (
                                        <button
                                            key={amt}
                                            onClick={() => handleAmountSelect(amt)}
                                            className={`p-4 rounded-xl border-2 transition-all ${selectedAmount === amt && !customAmount
                                                ? 'border-violet-500 bg-violet-50 text-violet-700'
                                                : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                                }`}
                                        >
                                            <div className="text-xl font-bold">${amt.toLocaleString()}</div>
                                            {bonusLabel && (
                                                <div className="text-xs text-emerald-600 mt-1">
                                                    {bonusLabel}
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Custom Amount */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                    Custom Amount
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                        $
                                    </span>
                                    <input
                                        type="number"
                                        value={customAmount}
                                        onChange={(e) => handleCustomAmountChange(e.target.value)}
                                        placeholder="Enter amount"
                                        min="5"
                                        max="10000"
                                        className="w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                                    />
                                </div>
                                <p className="text-xs text-gray-500">
                                    Minimum: $5 • Maximum: $10,000
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment Method */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Wallet className="w-5 h-5 text-blue-600" />
                                Payment Method
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <button
                                onClick={() => setPaymentMethod('stripe')}
                                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${paymentMethod === 'stripe'
                                    ? 'border-violet-500 bg-violet-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                                    <CreditCard className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-left flex-1">
                                    <div className="font-medium text-gray-900">Credit / Debit Card</div>
                                    <div className="text-sm text-gray-500">Pay with Stripe</div>
                                </div>
                                {paymentMethod === 'stripe' && (
                                    <CheckCircle className="w-5 h-5 text-violet-600" />
                                )}
                            </button>

                            <button
                                onClick={() => setPaymentMethod('paypal')}
                                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${paymentMethod === 'paypal'
                                    ? 'border-violet-500 bg-violet-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className="w-12 h-12 bg-[#003087] rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                    PP
                                </div>
                                <div className="text-left flex-1">
                                    <div className="font-medium text-gray-900">PayPal</div>
                                    <div className="text-sm text-gray-500">Pay with PayPal account</div>
                                </div>
                                {paymentMethod === 'paypal' && (
                                    <CheckCircle className="w-5 h-5 text-violet-600" />
                                )}
                            </button>

                            <button
                                onClick={() => setPaymentMethod('razorpay')}
                                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${paymentMethod === 'razorpay'
                                    ? 'border-violet-500 bg-violet-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                    RP
                                </div>
                                <div className="text-left flex-1">
                                    <div className="font-medium text-gray-900">Razorpay</div>
                                    <div className="text-sm text-gray-500">UPI, Netbanking, Cards (India)</div>
                                </div>
                                {paymentMethod === 'razorpay' && (
                                    <CheckCircle className="w-5 h-5 text-violet-600" />
                                )}
                            </button>
                        </CardContent>
                    </Card>

                    {/* Summary & Submit */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="space-y-3">
                                <div className="flex justify-between text-gray-600">
                                    <span>Amount</span>
                                    <span>${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                </div>
                                {getBonusRate(amount) > 0 && (
                                    <div className="flex justify-between text-emerald-600">
                                        <span>Bonus ({(getBonusRate(amount) * 100).toFixed(0)}%)</span>
                                        <span>+${(amount * getBonusRate(amount)).toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="border-t pt-3 flex justify-between font-semibold text-lg">
                                    <span>You'll receive</span>
                                    <span className="text-emerald-600">
                                        ${(amount * (1 + getBonusRate(amount))).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>

                            {error && (
                                <div className="mt-4 flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                                    <AlertCircle className="w-4 h-4" />
                                    {error}
                                </div>
                            )}

                            <Button
                                onClick={initiatePayment}
                                disabled={!isValidAmount || isLoading}
                                className="w-full mt-4 gap-2"
                                size="lg"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Zap className="w-4 h-4" />
                                        Add ${amount.toFixed(2)} to Wallet
                                    </>
                                )}
                            </Button>

                            <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-500">
                                <Shield className="w-4 h-4" />
                                <span>Secure payment powered by industry-leading encryption</span>
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}
