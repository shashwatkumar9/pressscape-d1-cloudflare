export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';
import { hashPassword, verifyPassword } from '@/lib/password';



export async function GET() {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();
        const now = new Date().toISOString();

        // Test Buyer details
        const email = 'buyer@test.com';
        const password = 'Buyer@123';
        const name = 'Test Buyer';

        // Hash the password
        const passwordHash = await hashPassword(password);

        // Check if buyer already exists
        const checkResult = await sql`SELECT id FROM users WHERE email = ${email}`;

        if (checkResult.rows.length > 0) {
            // Update existing user
            await sql`
                UPDATE users SET 
                    password_hash = ${passwordHash}, 
                    is_buyer = true,
                    buyer_balance = 100000,
                    email_verified = true,
                    is_active = true,
                    updated_at = ${now} 
                WHERE email = ${email}
            `;

            return NextResponse.json({
                success: true,
                message: '✅ Test buyer updated successfully!',
                credentials: {
                    email,
                    password,
                    balance: '$1000.00',
                    loginUrl: 'http://localhost:3000',
                    dashboardUrl: 'http://localhost:3000/buyer'
                }
            });
        } else {
            // Create new user
            await sql`
                INSERT INTO users (email, password_hash, name, is_buyer, buyer_balance, email_verified, is_active)
                VALUES (${email}, ${passwordHash}, ${name}, true, 100000, true, true)
            `;

            return NextResponse.json({
                success: true,
                message: '✅ Test buyer created successfully!',
                credentials: {
                    email,
                    password,
                    balance: '$1000.00',
                    loginUrl: 'http://localhost:3000',
                    dashboardUrl: 'http://localhost:3000/buyer'
                }
            });
        }
    } catch (error) {
        console.error('Error creating test buyer:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
