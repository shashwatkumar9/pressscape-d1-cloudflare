export const runtime = "edge";

import { NextRequest, NextResponse } from 'next/server';
import { sql, generateId } from '@/lib/db';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';
import { cookies } from 'next/headers';
import { sendOrderPlacedBuyerEmail, sendNewOrderPublisherEmail } from '@/lib/email';



async function getSession() {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('auth_session')?.value;
    if (!sessionId) return null;

    const now = new Date().toISOString();
    const result = await sql`
        SELECT s.*, u.* FROM sessions s
        JOIN users u ON s.user_id = u.id
        WHERE s.id = ${sessionId} AND s.expires_at > ${now}
    `;
    return result.rows[0] || null;
}

/**
 * POST /api/orders/pay-wallet
 * Create and pay for an order using wallet balance
 *
 * Body: {
 *   website_id: string,
 *   order_type: 'guest_post' | 'link_insertion',
 *   title?: string,
 *   content?: string,
 *   anchor_text?: string,
 *   target_url?: string,
 *   notes?: string
 * }
 */
export async function POST(request: NextRequest) {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();

        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Please log in to place an order' }, { status: 401 });
        }

        const body = await request.json() as any;
        const { website_id, order_type, title, content, anchor_text, target_url, notes } = body;

        if (!website_id || !order_type) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Get website details with publisher info
        const websiteResult = await sql`
            SELECT w.*, u.email as publisher_email, u.name as publisher_name
            FROM websites w
            JOIN users u ON w.owner_id = u.id
            WHERE w.id = ${website_id} AND w.is_active = true
        `;

        if (websiteResult.rows.length === 0) {
            return NextResponse.json({ error: 'Website not found' }, { status: 404 });
        }

        const website = websiteResult.rows[0] as Record<string, unknown>;

        // Calculate price
        const basePrice = order_type === 'guest_post'
            ? (website.price_guest_post as number)
            : (website.price_link_insertion as number);

        if (!basePrice) {
            return NextResponse.json({ error: 'Website pricing not available' }, { status: 400 });
        }

        // Add 25% platform fee
        const totalAmount = Math.round(basePrice * 1.25);
        const platformFee = totalAmount - basePrice;
        const publisherEarnings = basePrice;

        // Check wallet balance
        const currentBalance = (session.buyer_balance as number) || 0;
        if (currentBalance < totalAmount) {
            return NextResponse.json({
                error: 'Insufficient wallet balance',
                required: totalAmount,
                available: currentBalance,
                requiredFormatted: `$${(totalAmount / 100).toFixed(2)}`,
                availableFormatted: `$${(currentBalance / 100).toFixed(2)}`
            }, { status: 400 });
        }

        // Deduct from wallet
        const newBalance = currentBalance - totalAmount;
        await sql`
            UPDATE users SET buyer_balance = ${newBalance} WHERE id = ${session.user_id}
        `;

        // Create order (D1 pattern)
        const orderId = generateId();
        const orderNumber = 'PS-' + generateId().substring(0, 8);
        const now = new Date().toISOString();

        await sql`
            INSERT INTO orders (
                id, order_number, buyer_id, website_id, publisher_id,
                order_type, status, payment_status,
                base_price, subtotal, platform_fee, total_amount, publisher_earnings,
                article_title, article_content, anchor_text, target_url, buyer_notes,
                turnaround_days, content_source, created_at, paid_at
            ) VALUES (
                ${orderId},
                ${orderNumber},
                ${session.user_id as string},
                ${website_id},
                ${website.owner_id as string},
                ${order_type},
                'pending',
                'paid',
                ${basePrice},
                ${basePrice},
                ${platformFee},
                ${totalAmount},
                ${publisherEarnings},
                ${title || null},
                ${content || null},
                ${anchor_text || 'Click Here'},
                ${target_url || 'https://example.com'},
                ${notes || null},
                ${(website.turnaround_days as number) || 3},
                'buyer_provided',
                ${now},
                ${now}
            )
        `;

        // Fetch the created order
        const orderResult = await sql`SELECT * FROM orders WHERE id = ${orderId}`;
        const order = orderResult.rows[0] as Record<string, unknown>;

        // Create conversation thread for this order
        const conversationId = generateId();
        await sql`
            INSERT INTO conversations (id, order_id, buyer_id, publisher_id)
            VALUES (
                ${conversationId},
                ${orderId},
                ${session.user_id as string},
                ${website.owner_id as string}
            )
            ON CONFLICT (order_id) DO NOTHING
        `;

        // Log transaction using the existing transactions table
        const transactionId = generateId();
        await sql`
            INSERT INTO transactions (
                id, user_id, type, amount,
                balance_type, balance_before, balance_after,
                reference_type, reference_id, description, status, created_at
            ) VALUES (
                ${transactionId},
                ${session.user_id as string},
                'purchase',
                ${totalAmount},
                'buyer',
                ${currentBalance},
                ${newBalance},
                'order',
                ${orderId},
                ${'Wallet payment for order ' + orderNumber},
                'completed',
                ${now}
            )
        `;

        // Send email notifications
        sendOrderPlacedBuyerEmail(
            session.email as string,
            session.name as string,
            order.order_number as string,
            website.domain as string,
            totalAmount
        ).catch(console.error);

        sendNewOrderPublisherEmail(
            website.publisher_email as string,
            website.publisher_name as string,
            order.order_number as string,
            website.domain as string,
            session.name as string,
            publisherEarnings
        ).catch(console.error);

        return NextResponse.json({
            success: true,
            order: {
                id: order.id,
                order_number: order.order_number,
                status: order.status,
                payment_status: 'paid',
                total: totalAmount,
                totalFormatted: `$${(totalAmount / 100).toFixed(2)}`
            },
            wallet: {
                balance: newBalance,
                balanceFormatted: `$${(newBalance / 100).toFixed(2)}`,
                deducted: totalAmount
            }
        });

    } catch (error) {
        console.error('Error creating wallet order:', error);
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }
}
