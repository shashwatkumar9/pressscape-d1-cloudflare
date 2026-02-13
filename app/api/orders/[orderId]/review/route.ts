export const runtime = "edge";

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { sql } from '@/lib/db';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';
import { sendEmail } from '@/lib/email';



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

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ orderId: string }> }
) {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();

        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { orderId } = await params;
        const { rating, review } = await request.json() as any;

        // Validate rating
        if (!rating || rating < 1 || rating > 5) {
            return NextResponse.json(
                { error: 'Rating must be between 1 and 5' },
                { status: 400 }
            );
        }

        // Get order and verify ownership
        const orderResult = await sql`
            SELECT o.*, w.domain as website_domain, w.id as website_id,
                   p.email as publisher_email, p.name as publisher_name
            FROM orders o
            JOIN websites w ON o.website_id = w.id
            JOIN users p ON o.publisher_id = p.id
            WHERE o.id = ${orderId}
        `;

        if (orderResult.rows.length === 0) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        const order = orderResult.rows[0] as Record<string, unknown>;

        // Verify buyer owns this order
        if (order.buyer_id !== session.user_id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Verify order is completed
        if (!['completed', 'published'].includes(order.status as string)) {
            return NextResponse.json(
                { error: 'Can only review completed orders' },
                { status: 400 }
            );
        }

        // Check if already reviewed
        if (order.buyer_rating) {
            return NextResponse.json(
                { error: 'Order already reviewed' },
                { status: 400 }
            );
        }

        // Update order with review
        const now = new Date().toISOString();
        await sql`
            UPDATE orders
            SET buyer_rating = ${rating},
                buyer_review = ${review || null},
                reviewed_at = ${now}
            WHERE id = ${orderId}
        `;

        // Get all ratings for this website to calculate average
        const ratingsResult = await sql`
            SELECT buyer_rating FROM orders
            WHERE website_id = ${order.website_id}
            AND buyer_rating IS NOT NULL
        `;

        const ratings = ratingsResult.rows.map(r => (r as { buyer_rating: number }).buyer_rating);
        const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
        const ratingCount = ratings.length;

        // Update website average rating
        await sql`
            UPDATE websites
            SET average_rating = ${Math.round(avgRating * 10) / 10},
                rating_count = ${ratingCount}
            WHERE id = ${order.website_id}
        `;

        // Send notification email to publisher
        try {
            await sendEmail({
                to: order.publisher_email as string,
                subject: `New Review Received - ${order.website_domain}`,
                html: `
                    <h2>You've Received a New Review!</h2>
                    <p>Hi ${order.publisher_name},</p>
                    <p>A buyer has left a review for your website <strong>${order.website_domain}</strong>.</p>
                    <p><strong>Rating:</strong> ${'★'.repeat(rating)}${'☆'.repeat(5 - rating)} (${rating}/5)</p>
                    ${review ? `<p><strong>Review:</strong> "${review}"</p>` : ''}
                    <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/publisher/dashboard">View Dashboard</a></p>
                `,
            });
        } catch (emailError) {
            console.error('Failed to send review notification email:', emailError);
            // Don't fail the request if email fails
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error submitting review:', error);
        return NextResponse.json(
            { error: 'Failed to submit review' },
            { status: 500 }
        );
    }
}

// GET endpoint to fetch review for an order
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ orderId: string }> }
) {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();

        const { orderId } = await params;

        const result = await sql`
            SELECT buyer_rating, buyer_review, reviewed_at
            FROM orders
            WHERE id = ${orderId}
        `;

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        const order = result.rows[0] as Record<string, unknown>;

        return NextResponse.json({
            rating: order.buyer_rating,
            review: order.buyer_review,
            reviewedAt: order.reviewed_at,
        });
    } catch (error) {
        console.error('Error fetching review:', error);
        return NextResponse.json(
            { error: 'Failed to fetch review' },
            { status: 500 }
        );
    }
}
