export const runtime = "edge";

import { NextRequest, NextResponse } from 'next/server';
import { sql , generateId } from '@/lib/db';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';



/**
 * GET /api/cron/auto-approve
 * Called by external cron job (e.g., Vercel cron) to auto-approve orders
 * where buyer hasn't confirmed within 3 days
 * 
 * Security: Add CRON_SECRET check in production
 */
export async function GET(request: NextRequest) {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();
        const now = new Date().toISOString();

        // Optional: Check for cron secret in production
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;

        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Find orders that are:
        // 1. Status = 'published'
        // 2. buyer_confirmation_deadline has passed
        // 3. buyer hasn't confirmed or rejected
        const ordersResult = await sql`
            SELECT 
                o.*,
                p.publisher_balance,
                c.contributor_balance
            FROM orders o
            LEFT JOIN users p ON o.publisher_id = p.id
            LEFT JOIN users c ON o.contributor_id = c.id
            WHERE o.status = 'published'
            AND o.buyer_confirmation_deadline < NOW()
            AND o.buyer_confirmed_at IS NULL
            AND o.buyer_rejected_at IS NULL
        `;

        const orders = ordersResult.rows;
        const results: { orderId: string; success: boolean; error?: string }[] = [];

        for (const order of orders) {
            try {
                // Auto-complete the order
                await sql`
                    UPDATE orders 
                    SET 
                        status = 'completed',
                        buyer_confirmed_at = ${now},
                        completed_at = ${now},
                        payment_status = 'released',
                        released_at = ${now},
                        updated_at = ${now}
                    WHERE id = ${order.id as string}
                `;

                // Credit publisher earnings
                const publisherEarnings = order.publisher_earnings as number;
                const publisherId = order.publisher_id as string;
                const currentPublisherBalance = (order.publisher_balance as number) || 0;
                const newPublisherBalance = currentPublisherBalance + publisherEarnings;

                await sql`
                    UPDATE users 
                    SET publisher_balance = ${newPublisherBalance}, updated_at = ${now}
                    WHERE id = ${publisherId}
                `;

                // Record publisher transaction
                await sql`
                    INSERT INTO transactions (
                        id, user_id, type, amount,
                        balance_type, balance_before, balance_after,
                        reference_type, reference_id, description, status, created_at
                    ) VALUES (
                        gen_random_uuid()::text,
                        ${publisherId},
                        'earning',
                        ${publisherEarnings},
                        'publisher',
                        ${currentPublisherBalance},
                        ${newPublisherBalance},
                        'order',
                        ${order.id as string},
                        ${'Auto-approved earnings from order ' + (order.order_number as string)},
                        'completed',
                        NOW()
                    )
                `;

                // Credit contributor if applicable
                if (order.contributor_id && order.contributor_earnings && (order.contributor_earnings as number) > 0) {
                    const contributorId = order.contributor_id as string;
                    const contributorEarnings = order.contributor_earnings as number;
                    const currentContributorBalance = (order.contributor_balance as number) || 0;
                    const newContributorBalance = currentContributorBalance + contributorEarnings;

                    await sql`
                        UPDATE users 
                        SET contributor_balance = ${newContributorBalance}, updated_at = ${now}
                        WHERE id = ${contributorId}
                    `;

                    await sql`
                        INSERT INTO transactions (
                            id, user_id, type, amount,
                            balance_type, balance_before, balance_after,
                            reference_type, reference_id, description, status, created_at
                        ) VALUES (
                            gen_random_uuid()::text,
                            ${contributorId},
                            'contributor',
                            ${contributorEarnings},
                            'contributor',
                            ${currentContributorBalance},
                            ${newContributorBalance},
                            'order',
                            ${order.id as string},
                            ${'Auto-approved contributor earnings from order ' + (order.order_number as string)},
                            'completed',
                            NOW()
                        )
                    `;
                }

                results.push({ orderId: order.id as string, success: true });
            } catch (error) {
                console.error(`Error auto-approving order ${order.id}:`, error);
                results.push({ orderId: order.id as string, success: false, error: String(error) });
            }
        }

        return NextResponse.json({
            success: true,
            processedCount: orders.length,
            results,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Auto-approve cron error:', error);
        return NextResponse.json(
            { error: 'Auto-approve failed', details: String(error) },
            { status: 500 }
        );
    }
}
