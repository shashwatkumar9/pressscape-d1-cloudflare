export const runtime = "edge";

import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';
import { validateRequest } from '@/lib/auth';



interface ReferralRow {
    id: string;
    name: string;
    email: string;
    signup_date: string;
    total_orders: string;
    total_spent: string;
    your_commission: string;
}

export async function GET() {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();

        const { user, session } = await validateRequest();

        if (!session || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is affiliate
        const userResult = await sql`
            SELECT is_affiliate FROM users WHERE id = ${user.id}
        `;

        if (userResult.rows.length === 0 || !(userResult.rows[0] as { is_affiliate: boolean }).is_affiliate) {
            return NextResponse.json({ error: 'Not an affiliate' }, { status: 403 });
        }

        // Get all referrals with their order stats
        const referrals = await sql`
            SELECT 
                u.id,
                u.name,
                CONCAT(LEFT(u.email, 3), '***', SUBSTRING(u.email FROM POSITION('@' IN u.email))) as email,
                u.created_at as signup_date,
                COALESCE(order_stats.total_orders, 0) as total_orders,
                COALESCE(order_stats.total_spent, 0) as total_spent,
                COALESCE(order_stats.your_commission, 0) as your_commission
            FROM affiliate_referrals ar
            JOIN users u ON ar.referred_user_id = u.id
            LEFT JOIN LATERAL (
                SELECT 
                    COUNT(*) as total_orders,
                    SUM(total_amount) as total_spent,
                    SUM(affiliate_fee) as your_commission
                FROM orders 
                WHERE buyer_id = u.id 
                  AND affiliate_id = ${user.id}
                  AND payment_status = 'paid'
            ) order_stats ON true
            WHERE ar.affiliate_id = ${user.id}
            ORDER BY u.created_at DESC
        `;

        const formattedReferrals = (referrals.rows as unknown as ReferralRow[]).map(r => ({
            id: r.id,
            name: r.name || 'User',
            email: r.email,
            status: parseInt(r.total_orders) > 0 ? 'active' : 'pending',
            signupDate: new Date(r.signup_date).toLocaleDateString(),
            totalOrders: parseInt(r.total_orders),
            totalSpent: parseInt(r.total_spent),
            yourCommission: parseInt(r.your_commission),
        }));

        return NextResponse.json({ referrals: formattedReferrals });

    } catch (error) {
        console.error('Error fetching referrals:', error);
        return NextResponse.json({ error: 'Failed to fetch referrals' }, { status: 500 });
    }
}
