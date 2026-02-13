import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

/**
 * Get the Stripe.js instance (client-side only)
 * This is a singleton pattern to ensure we only load Stripe once
 */
export const getStripe = () => {
    if (!stripePromise) {
        const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

        if (!publishableKey) {
            console.error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set');
            return null;
        }

        stripePromise = loadStripe(publishableKey);
    }

    return stripePromise;
};
