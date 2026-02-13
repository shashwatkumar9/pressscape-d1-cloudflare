'use client';

import { useState } from 'react';
import { CreditCard, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PayPalButtonProps {
    orderId: string;
    amount: number;
    currency?: string;
    onSuccess: () => void;
    onError: (error: string) => void;
}

export default function PayPalButton({
    orderId,
    amount,
    currency = 'USD',
    onSuccess,
    onError,
}: PayPalButtonProps) {
    const [loading, setLoading] = useState(false);

    const handlePayPalPayment = async () => {
        setLoading(true);
        try {
            // Create PayPal order
            const createRes = await fetch('/api/payments/paypal/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount, currency, orderId }),
            });

            if (!createRes.ok) {
                throw new Error('Failed to create PayPal order');
            }

            const { paypalOrderId, approveUrl } = await createRes.json() as any;

            //  Redirect to PayPal for approval
            window.location.href = approveUrl;

            // Note: After PayPal approval, user will be redirected to return_url
            // The capture should happen in the return URL handler
        } catch (error) {
            onError(error instanceof Error ? error.message : 'Payment failed');
            setLoading(false);
        }
    };

    return (
        <Button
            onClick={handlePayPalPayment}
            disabled={loading}
            className="w-full bg-[#0070BA] hover:bg-[#005ea6] text-white py-6 text-lg font-semibold"
            size="lg"
        >
            {loading ? (
                <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Redirecting to PayPal...
                </>
            ) : (
                <>
                    <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.905 9.5c.21-1.337.095-2.268-.457-3.113C19.565 5.233 18.024 4.5 15.905 4.5H8.762c-.526 0-.988.382-1.071.9l-3.16 18c-.06.357.208.6.562.6h4.095l-282-.645 1.792-10.8c.082-.498.53-.855 1.037-.855h2.182c4.6 0 7.736-1.943 8.728-7.555.052-.297.242-.445.445-.445z" />
                    </svg>
                    Pay with PayPal
                </>
            )}
        </Button>
    );
}
