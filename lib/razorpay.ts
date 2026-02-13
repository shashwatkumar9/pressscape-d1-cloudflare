import Razorpay from 'razorpay';

// Initialize Razorpay instance
export function getRazorpayInstance() {
    return new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID || '',
        key_secret: process.env.RAZORPAY_KEY_SECRET || '',
    });
}

// Create Razorpay Order
export async function createRazorpayOrder(amount: number, currency: string = 'INR', receipt?: string) {
    const razorpay = getRazorpayInstance();

    const options = {
        amount: amount, // amount in smallest currency unit (paise for INR, cents for USD)
        currency,
        receipt: receipt || `receipt_${Date.now()}`,
        notes: {
            platform: 'PressScape',
        },
    };

    try {
        const order = await razorpay.orders.create(options);
        return {
            id: order.id,
            amount: order.amount,
            currency: order.currency,
            receipt: order.receipt,
            status: order.status,
        };
    } catch (error) {
        console.error('Razorpay create order error:', error);
        throw error;
    }
}

// Verify Razorpay Payment Signature using Web Crypto API
export async function verifyRazorpaySignature(
    orderId: string,
    paymentId: string,
    signature: string
): Promise<boolean> {
    const keySecret = process.env.RAZORPAY_KEY_SECRET || '';

    // Import the secret key
    const encoder = new TextEncoder();
    const keyData = encoder.encode(keySecret);
    const key = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );

    // Create the message
    const message = encoder.encode(`${orderId}|${paymentId}`);

    // Sign the message
    const signatureBuffer = await crypto.subtle.sign('HMAC', key, message);

    // Convert to hex
    const signatureArray = Array.from(new Uint8Array(signatureBuffer));
    const generatedSignature = signatureArray
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('');

    return generatedSignature === signature;
}

// Get Razorpay Payment Details
export async function getRazorpayPayment(paymentId: string) {
    const razorpay = getRazorpayInstance();

    try {
        const payment = await razorpay.payments.fetch(paymentId);
        return {
            id: payment.id,
            amount: payment.amount,
            currency: payment.currency,
            status: payment.status,
            order_id: payment.order_id,
            method: payment.method,
            email: payment.email,
            contact: payment.contact,
            created_at: payment.created_at,
        };
    } catch (error) {
        console.error('Razorpay get payment error:', error);
        throw error;
    }
}

// Get Razorpay Order Details
export async function getRazorpayOrder(orderId: string) {
    const razorpay = getRazorpayInstance();

    try {
        const order = await razorpay.orders.fetch(orderId);
        return {
            id: order.id,
            amount: order.amount,
            amount_paid: order.amount_paid,
            amount_due: order.amount_due,
            currency: order.currency,
            receipt: order.receipt,
            status: order.status,
            attempts: order.attempts,
            created_at: order.created_at,
        };
    } catch (error) {
        console.error('Razorpay get order error:', error);
        throw error;
    }
}
