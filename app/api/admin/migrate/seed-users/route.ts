export const runtime = "edge";

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';
import bcrypt from 'bcrypt';



// POST /api/admin/migrate/seed-users - Create test users for all roles
export async function POST(request: NextRequest) {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();

        const passwordHash = await bcrypt.hash('Test@123', 10);

        // Create test users for each role
        const testUsers = [
            {
                email: 'admin@pressscape.com',
                name: 'Admin User',
                is_buyer: true,
                is_publisher: true,
                is_affiliate: true,
                role: 'admin'
            },
            {
                email: 'publisher@test.com',
                name: 'Test Publisher',
                is_buyer: false,
                is_publisher: true,
                is_affiliate: false,
                role: 'publisher'
            },
            {
                email: 'buyer@test.com',
                name: 'Test Buyer',
                is_buyer: true,
                is_publisher: false,
                is_affiliate: false,
                role: 'buyer'
            },
            {
                email: 'affiliate@test.com',
                name: 'Test Affiliate',
                is_buyer: true,
                is_publisher: false,
                is_affiliate: true,
                role: 'affiliate'
            }
        ];

        const createdUsers = [];

        for (const user of testUsers) {
            // Check if user exists
            const existing = await sql`
        SELECT id, email FROM users WHERE email = ${user.email}
      `;

            if (existing.rows.length > 0) {
                // Update password for existing user
                await sql`
          UPDATE users 
          SET password_hash = ${passwordHash},
              is_buyer = ${user.is_buyer},
              is_publisher = ${user.is_publisher},
              is_affiliate = ${user.is_affiliate},
              buyer_balance = 50000,
              publisher_balance = 25000,
              affiliate_balance = 10000
          WHERE email = ${user.email}
        `;
                createdUsers.push({
                    ...user,
                    id: existing.rows[0].id,
                    status: 'updated'
                });
            } else {
                // Create new user
                const affiliateCode = user.is_affiliate ? `AFF${Date.now().toString(36).toUpperCase()}` : null;

                const result = await sql`
          INSERT INTO users (
            email, password_hash, name, 
            is_buyer, is_publisher, is_affiliate,
            affiliate_code, is_verified, email_verified,
            buyer_balance, publisher_balance, affiliate_balance
          ) VALUES (
            ${user.email}, ${passwordHash}, ${user.name},
            ${user.is_buyer}, ${user.is_publisher}, ${user.is_affiliate},
            ${affiliateCode}, true, true,
            50000, 25000, 10000
          )
          RETURNING id
        `;
                createdUsers.push({
                    ...user,
                    id: result.rows[0].id,
                    affiliate_code: affiliateCode,
                    status: 'created'
                });
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Test users created/updated successfully',
            password: 'Test@123',
            users: createdUsers.map(u => ({
                email: u.email,
                name: u.name,
                role: u.role,
                password: 'Test@123',
                status: u.status,
                affiliate_code: u.affiliate_code || null
            }))
        });
    } catch (error) {
        console.error('Seed users error:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to seed users'
        }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({
        message: 'POST to this endpoint to create test users',
        credentials: {
            password: 'Test@123',
            users: [
                { email: 'admin@pressscape.com', role: 'Admin (all roles)' },
                { email: 'publisher@test.com', role: 'Publisher' },
                { email: 'buyer@test.com', role: 'Buyer' },
                { email: 'affiliate@test.com', role: 'Affiliate + Buyer' }
            ]
        }
    });
}
