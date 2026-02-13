import Stripe from 'stripe';

// Lazy initialization to avoid build-time errors when env vars aren't set
let stripeInstance: Stripe | null = null;

function getStripe(): Stripe {
    if (!stripeInstance) {
        if (!process.env.STRIPE_SECRET_KEY) {
            throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
        }
        stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
            apiVersion: '2025-12-18.acacia' as Stripe.LatestApiVersion,
            typescript: true,
        });
    }
    return stripeInstance;
}

// Export stripe getter for runtime use
export const stripe = {
    get instance() {
        return getStripe();
    }
};

/**
 * Create a Payment Intent for an order
 * @param amount - Amount in cents
 * @param metadata - Additional metadata to attach to the payment intent
 */
export async function createPaymentIntent(
    amount: number,
    metadata: {
        website_id: string;
        order_type: string;
        buyer_id: string;
    }
) {
    return await getStripe().paymentIntents.create({
        amount,
        currency: 'usd',
        automatic_payment_methods: {
            enabled: true,
        },
        metadata,
    });
}

/**
 * Retrieve a Payment Intent
 */
export async function getPaymentIntent(paymentIntentId: string) {
    return await getStripe().paymentIntents.retrieve(paymentIntentId);
}

/**
 * Create a refund for a payment
 */
export async function createRefund(paymentIntentId: string, amount?: number) {
    return await getStripe().refunds.create({
        payment_intent: paymentIntentId,
        amount, // If not provided, refunds the full amount
    });
}

/**
 * Verify webhook signature
 */
export function constructWebhookEvent(
    payload: string | Buffer,
    signature: string,
    webhookSecret: string
) {
    return getStripe().webhooks.constructEvent(payload, signature, webhookSecret);
}
