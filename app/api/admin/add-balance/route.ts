export const runtime = "edge";

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';



export async function GET(request: NextRequest) {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();
        const now = new Date().toISOString();

        const searchParams = request.nextUrl.searchParams;
        const email = searchParams.get('email') || 'frankchiberi@gmail.com';
        const amount = parseInt(searchParams.get('amount') || '100000'); // Default $1000 in cents

        // Check if user exists
        const userResult = await sql`
            SELECT id, email, name, buyer_balance, is_buyer 
            FROM users 
            WHERE email = ${email}
        `;

        if (userResult.rows.length === 0) {
            return NextResponse.json({
                success: false,
                error: `User with email ${email} not found`
            }, { status: 404 });
        }

        const user = userResult.rows[0];

        // Update buyer balance and ensure is_buyer is true
        await sql`
            UPDATE users SET 
                buyer_balance = buyer_balance + ${amount},
                is_buyer = true,
                updated_at = ${now} 
            WHERE email = ${email}
        `;

        // Get updated balance
        const updatedUser = await sql`
            SELECT buyer_balance FROM users WHERE email = ${email}
        `;

        const newBalance = (updatedUser.rows[0].buyer_balance as any);

        return NextResponse.json({
            success: true,
            message: `✅ Added $${(amount / 100).toFixed(2)} to ${email}`,
            user: {
                email: user.email,
                name: user.name,
                previousBalance: `$${(((user.buyer_balance as any) || 0) / 100).toFixed(2)}`,
                addedAmount: `$${(amount / 100).toFixed(2)}`,
                newBalance: `$${(newBalance / 100).toFixed(2)}`
            }
        });
    } catch (error) {
        console.error('Error adding balance:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
