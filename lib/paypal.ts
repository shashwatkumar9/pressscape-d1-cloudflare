import paypal from '@paypal/checkout-server-sdk';

// PayPal Environment
function environment() {
    const clientId = process.env.PAYPAL_CLIENT_ID || '';
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET || '';
    const mode = process.env.PAYPAL_MODE || 'sandbox';

    if (mode === 'live') {
        return new paypal.core.LiveEnvironment(clientId, clientSecret);
    }
    return new paypal.core.SandboxEnvironment(clientId, clientSecret);
}

// PayPal Client
function client() {
    return new paypal.core.PayPalHttpClient(environment());
}

// Create PayPal Order
export async function createPayPalOrder(amount: number, currency: string = 'USD') {
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
        intent: 'CAPTURE',
        purchase_units: [{
            amount: {
                currency_code: currency,
                value: (amount / 100).toFixed(2), // Convert cents to dollars
            },
        }],
        application_context: {
            brand_name: 'PressScape',
            landing_page: 'NO_PREFERENCE',
            user_action: 'PAY_NOW',
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/paypal/success`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/paypal/cancel`,
        },
    });

    try {
        const response = await client().execute(request);
        return {
            id: response.result.id,
            status: response.result.status,
            links: response.result.links,
        };
    } catch (error) {
        console.error('PayPal create order error:', error);
        throw error;
    }
}

// Capture PayPal Order
export async function capturePayPalOrder(orderId: string) {
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    try {
        const response = await client().execute(request);
        return {
            id: response.result.id,
            status: response.result.status,
            payer: response.result.payer,
            purchase_units: response.result.purchase_units,
        };
    } catch (error) {
        console.error('PayPal capture order error:', error);
        throw error;
    }
}

// Get PayPal Order Details
export async function getPayPalOrderDetails(orderId: string) {
    const request = new paypal.orders.OrdersGetRequest(orderId);

    try {
        const response = await client().execute(request);
        return response.result;
    } catch (error) {
        console.error('PayPal get order error:', error);
        throw error;
    }
}
