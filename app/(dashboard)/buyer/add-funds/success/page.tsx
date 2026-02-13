'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    CheckCircle,
    Wallet,
    ArrowRight,
    ShoppingBag,
    Sparkles,
    Loader2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

function SuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [isVerifying, setIsVerifying] = useState(true);
    const [verified, setVerified] = useState(false);

    const amount = parseFloat(searchParams.get('amount') || '0');
    const paymentIntent = searchParams.get('payment_intent');

    // Bonus tiers: No bonus till $1000, 3% for $1000+, 5% for $2500+, 10% for $5000+
    const getBonusRate = (amt: number): number => {
        if (amt >= 5000) return 0.10;
        if (amt >= 2500) return 0.05;
        if (amt >= 1000) return 0.03;
        return 0;
    };

    const bonusRate = getBonusRate(amount);
    const bonusAmount = amount * bonusRate;
    const totalCredit = amount + bonusAmount;

    useEffect(() => {
        // Verify the payment if coming from Stripe redirect
        const verifyPayment = async () => {
            if (paymentIntent) {
                try {
                    // The webhook should have already processed the payment
                    // Just verify the status
                    const response = await fetch(`/api/wallet/verify-payment?payment_intent=${paymentIntent}`);
                    const data = await response.json() as any;

                    if (data.success || response.ok) {
                        setVerified(true);
                        // Trigger confetti
                        confetti({
                            particleCount: 100,
                            spread: 70,
                            origin: { y: 0.6 }
                        });
                    }
                } catch (error) {
                    console.error('Error verifying payment:', error);
                    // Still show success since Stripe redirected here
                    setVerified(true);
                }
            } else {
                // No payment intent, just show success
                setVerified(true);
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            }
            setIsVerifying(false);
        };

        verifyPayment();
    }, [paymentIntent]);

    if (isVerifying) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-violet-600 animate-spin mx-auto" />
                    <p className="mt-4 text-gray-600">Verifying your payment...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-lg mx-auto space-y-6">
            {/* Success Animation */}
            <div className="text-center py-8">
                <div className="relative inline-block">
                    <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-green-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                        <CheckCircle className="w-12 h-12 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-yellow-800" />
                    </div>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mt-6">
                    Funds Added Successfully!
                </h1>
                <p className="text-gray-600 mt-2">
                    Your wallet has been topped up
                </p>
            </div>

            {/* Amount Summary */}
            <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
                <CardContent className="pt-6">
                    <div className="text-center">
                        <p className="text-sm text-emerald-700 font-medium">Added to your wallet</p>
                        <p className="text-4xl font-bold text-emerald-600 mt-2">
                            ${totalCredit.toFixed(2)}
                        </p>
                        {bonusAmount > 0 && (
                            <p className="text-sm text-emerald-600 mt-2 flex items-center justify-center gap-1">
                                <Sparkles className="w-4 h-4" />
                                Includes ${bonusAmount.toFixed(2)} bonus!
                            </p>
                        )}
                    </div>

                    <div className="mt-6 pt-6 border-t border-emerald-200 space-y-2 text-sm">
                        <div className="flex justify-between text-gray-600">
                            <span>Payment Amount</span>
                            <span>${amount.toFixed(2)}</span>
                        </div>
                        {bonusAmount > 0 && (
                            <div className="flex justify-between text-emerald-600">
                                <span>Bonus Credit ({(bonusRate * 100).toFixed(0)}%)</span>
                                <span>+${bonusAmount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between font-semibold text-gray-900 pt-2 border-t border-dashed border-emerald-200">
                            <span>Total Credit</span>
                            <span>${totalCredit.toFixed(2)}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="space-y-3">
                <Link href="/marketplace" className="block">
                    <Button className="w-full gap-2" size="lg">
                        <ShoppingBag className="w-5 h-5" />
                        Browse Marketplace
                        <ArrowRight className="w-4 h-4" />
                    </Button>
                </Link>
                <Link href="/buyer/dashboard" className="block">
                    <Button variant="outline" className="w-full gap-2" size="lg">
                        <Wallet className="w-5 h-5" />
                        Go to Dashboard
                    </Button>
                </Link>
            </div>

            {/* Help Text */}
            <p className="text-center text-sm text-gray-500">
                Your funds are available immediately. You can start placing orders right away!
            </p>
        </div>
    );
}

export default function AddFundsSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-violet-600 animate-spin" />
            </div>
        }>
            <SuccessContent />
        </Suspense>
    );
}
