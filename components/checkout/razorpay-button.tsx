'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RazorpayButtonProps {
    orderId: string;
    amount: number;
    currency?: string;
    onSuccess: () => void;
    onError: (error: string) => void;
}

declare global {
    interface Window {
        Razorpay: any;
    }
}

export default function RazorpayButton({
    orderId,
    amount,
    currency = 'INR',
    onSuccess,
    onError,
}: RazorpayButtonProps) {
    const [loading, setLoading] = useState(false);
    const [scriptLoaded, setScriptLoaded] = useState(false);

    useEffect(() => {
        // Load Razorpay script
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => setScriptLoaded(true);
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const handleRazorpayPayment = async () => {
        if (!scriptLoaded) {
            onError('Razorpay script not loaded');
            return;
        }

        setLoading(true);
        try {
            // Create Razorpay order
            const createRes = await fetch('/api/payments/razorpay/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount, currency, orderId }),
            });

            if (!createRes.ok) {
                throw new Error('Failed to create Razorpay order');
            }

            const { razorpayOrderId, keyId } = await createRes.json() as any;

            // Open Razorpay checkout
            const options = {
                key: keyId,
                amount,
                currency,
                order_id: razorpayOrderId,
                name: 'PressScape',
                description: `Order #${orderId}`,
                handler: async (response: any) => {
                    // Verify payment on server
                    const verifyRes = await fetch('/api/payments/razorpay/verify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature,
                            orderId,
                        }),
                    });

                    if (verifyRes.ok) {
                        onSuccess();
                    } else {
                        onError('Payment verification failed');
                    }
                    setLoading(false);
                },
                prefill: {
                    name: '',
                    email: '',
                },
                theme: {
                    color: '#7C3AED',
                },
                modal: {
                    ondismiss: () => {
                        setLoading(false);
                        onError('Payment cancelled');
                    },
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error) {
            onError(error instanceof Error ? error.message : 'Payment failed');
            setLoading(false);
        }
    };

    return (
        <Button
            onClick={handleRazorpayPayment}
            disabled={loading || !scriptLoaded}
            className="w-full bg-gradient-to-r from-[#3395FF] to-[#3D5AF1] hover:opacity-90 text-white py-6 text-lg font-semibold"
            size="lg"
        >
            {loading ? (
                <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                </>
            ) : (
                <>
                    <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.436 0H1.564C.7 0 0 .7 0 1.564v20.872C0 23.3.7 24 1.564 24h20.872c.864 0 1.564-.7 1.564-1.564V1.564C24 .7 23.3 0 22.436 0zM8 18.123c-.717 0-1.353-.298-1.834-.786-.48-.488-.713-1.163-.713-2.004V8.667h3.074v5.476c0 .329.115.583.288.766.173.183.414.275.667.275.246 0 .485-.092.66-.275.173-.183.288-.437.288-.766V8.667h3.074v6.666c0 .841-.233 1.516-.713 2.004-.481.488-1.117.786-1.834.786h-2.957z" />
                    </svg>
                    Pay with Razorpay
                </>
            )}
        </Button>
    );
}
