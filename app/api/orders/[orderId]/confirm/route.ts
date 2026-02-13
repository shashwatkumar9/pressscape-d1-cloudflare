export const runtime = "edge";

import { NextRequest, NextResponse } from 'next/server';
import { sql, generateId } from '@/lib/db';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';
import { validateRequest } from '@/lib/auth';



// POST - Buyer confirms the published order
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ orderId: string }> }
) {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();

        const { user } = await validateRequest();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { orderId } = await params;

        // Get order and verify ownership
        const orderResult = await sql`
            SELECT * FROM orders 
            WHERE id = ${orderId} AND buyer_id = ${user.id}
        `;

        if (orderResult.rows.length === 0) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        const order = orderResult.rows[0];

        // Verify order is in published status
        if (order.status !== 'published') {
            return NextResponse.json(
                { error: 'Order is not in published status' },
                { status: 400 }
            );
        }

        // Update order to completed
        const now = new Date().toISOString();
        await sql`
            UPDATE orders
            SET
                status = 'completed',
                buyer_confirmed_at = ${now},
                completed_at = ${now},
                payment_status = 'released',
                released_at = ${now},
                updated_at = ${now}
            WHERE id = ${orderId}
        `;

        // Credit publisher earnings to their wallet
        const publisherEarnings = order.publisher_earnings as number;
        const publisherId = order.publisher_id as string;

        // Get current publisher balance
        const publisherResult = await sql`
            SELECT publisher_balance FROM users WHERE id = ${publisherId}
        `;
        const currentBalance = (publisherResult.rows[0]?.publisher_balance as number) || 0;
        const newBalance = currentBalance + publisherEarnings;

        // Update publisher balance
        await sql`
            UPDATE users
            SET publisher_balance = ${newBalance}, updated_at = ${now}
            WHERE id = ${publisherId}
        `;

        // Record transaction
        const transactionId = generateId();
        await sql`
            INSERT INTO transactions (
                id, user_id, type, amount,
                balance_type, balance_before, balance_after,
                reference_type, reference_id, description, status, created_at
            ) VALUES (
                ${transactionId},
                ${publisherId},
                'earning',
                ${publisherEarnings},
                'publisher',
                ${currentBalance},
                ${newBalance},
                'order',
                ${orderId},
                ${'Earnings from order ' + (order.order_number as string)},
                'completed',
                ${now}
            )
        `;

        // Credit contributor if applicable
        if (order.contributor_id && order.contributor_earnings && (order.contributor_earnings as number) > 0) {
            const contributorId = order.contributor_id as string;
            const contributorEarnings = order.contributor_earnings as number;

            const contributorResult = await sql`
                SELECT contributor_balance FROM users WHERE id = ${contributorId}
            `;
            const contributorCurrentBalance = (contributorResult.rows[0]?.contributor_balance as number) || 0;
            const contributorNewBalance = contributorCurrentBalance + contributorEarnings;

            await sql`
                UPDATE users
                SET contributor_balance = ${contributorNewBalance}, updated_at = ${now}
                WHERE id = ${contributorId}
            `;

            const contributorTransactionId = generateId();
            await sql`
                INSERT INTO transactions (
                    id, user_id, type, amount,
                    balance_type, balance_before, balance_after,
                    reference_type, reference_id, description, status, created_at
                ) VALUES (
                    ${contributorTransactionId},
                    ${contributorId},
                    'contributor',
                    ${contributorEarnings},
                    'contributor',
                    ${contributorCurrentBalance},
                    ${contributorNewBalance},
                    'order',
                    ${orderId},
                    ${'Contributor earnings from order ' + (order.order_number as string)},
                    'completed',
                    ${now}
                )
            `;
        }

        return NextResponse.json({
            success: true,
            message: 'Order confirmed and completed',
        });
    } catch (error) {
        console.error('Confirm order error:', error);
        return NextResponse.json(
            { error: 'Failed to confirm order' },
            { status: 500 }
        );
    }
}
