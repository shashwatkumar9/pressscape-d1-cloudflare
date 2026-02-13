export const runtime = "edge";

import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';
import { validateRequest } from '@/lib/auth';



export async function GET() {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();

        const { user, session } = await validateRequest();

        if (!session || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get user's affiliate data
        const userResult = await sql`
            SELECT affiliate_code, affiliate_balance, is_affiliate, referred_by
            FROM users WHERE id = ${user.id}
        `;

        if (userResult.rows.length === 0 || !userResult.rows[0].is_affiliate) {
            return NextResponse.json({ error: 'Not an affiliate' }, { status: 403 });
        }

        const userData = userResult.rows[0] as {
            affiliate_code: string;
            affiliate_balance: number;
            is_affiliate: boolean;
        };

        // Count total referrals
        const referralsResult = await sql`
            SELECT COUNT(*) as total FROM affiliate_referrals 
            WHERE affiliate_id = ${user.id}
        `;
        const totalReferrals = parseInt((referralsResult.rows[0] as { total: string }).total) || 0;

        // Count converted referrals (those who have placed orders)
        const convertedResult = await sql`
            SELECT COUNT(DISTINCT ar.referred_user_id) as converted
            FROM affiliate_referrals ar
            JOIN orders o ON o.buyer_id = ar.referred_user_id
            WHERE ar.affiliate_id = ${user.id}
              AND o.payment_status = 'paid'
        `;
        const convertedReferrals = parseInt((convertedResult.rows[0] as { converted: string }).converted) || 0;

        // Calculate total earnings from completed orders
        const earningsResult = await sql`
            SELECT COALESCE(SUM(o.affiliate_fee), 0) as total_earnings
            FROM orders o
            WHERE o.affiliate_id = ${user.id}
              AND o.status IN ('completed', 'published')
        `;
        const totalEarnings = parseInt((earningsResult.rows[0] as { total_earnings: string }).total_earnings) || 0;

        // Calculate pending commissions (from unpaid/processing orders)
        const pendingResult = await sql`
            SELECT COALESCE(SUM(o.affiliate_fee), 0) as pending
            FROM orders o
            WHERE o.affiliate_id = ${user.id}
              AND o.status NOT IN ('completed', 'published', 'cancelled', 'refunded')
        `;
        const pendingCommissions = parseInt((pendingResult.rows[0] as { pending: string }).pending) || 0;

        // Calculate conversion rate
        const conversionRate = totalReferrals > 0
            ? Math.round((convertedReferrals / totalReferrals) * 100)
            : 0;

        return NextResponse.json({
            affiliateCode: userData.affiliate_code,
            affiliateBalance: userData.affiliate_balance,
            totalEarnings,
            pendingCommissions,
            totalReferrals,
            convertedReferrals,
            conversionRate,
        });

    } catch (error) {
        console.error('Error fetching affiliate stats:', error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
