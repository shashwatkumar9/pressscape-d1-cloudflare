export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';
import { verifyPassword } from '@/lib/password';
import { createToken } from '@/lib/jwt';
import { z } from 'zod';



const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

export async function POST(request: NextRequest) {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();
        const now = new Date().toISOString();

        const body = await request.json() as any;

        // Validate input
        const result = loginSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { error: result.error.issues[0].message },
                { status: 400 }
            );
        }

        const { email, password } = result.data;

        // Find user
        const userResult = await sql`
      SELECT id, email, name, password_hash, is_buyer, is_publisher, is_affiliate, is_active, is_banned
      FROM users 
      WHERE email = ${email}
    `;

        if (userResult.rows.length === 0) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        const user = userResult.rows[0];

        // Check if user is banned
        if (user.is_banned) {
            return NextResponse.json(
                { error: 'Your account has been suspended' },
                { status: 403 }
            );
        }

        // Check if user is active
        if (!user.is_active) {
            return NextResponse.json(
                { error: 'Your account is deactivated' },
                { status: 403 }
            );
        }

        // Verify password
        console.log('Verifying password for user:', email);
        console.log('Password hash length:', (user.password_hash as string)?.length);

        const validPassword = await verifyPassword(password, user.password_hash as string);
        console.log('Password verification result:', validPassword);

        if (!validPassword) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        // Update last login
        await sql`UPDATE users SET last_login_at = ${now} WHERE id = ${user.id as string}`;

        // Create JWT token
        console.log('[Login API] Creating JWT token for user:', user.id);
        const token = await createToken(
            user.id as string,
            user.email as string,
            user.name as string
        );

        console.log('[Login API] JWT token created successfully');
        console.log('[Login API] Login successful for user:', email);

        // Return token to client
        return NextResponse.json({
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                isBuyer: user.is_buyer,
                isPublisher: user.is_publisher,
                isAffiliate: user.is_affiliate,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        console.error('Error details:', error instanceof Error ? error.message : String(error));
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        return NextResponse.json(
            {
                error: 'An error occurred during login',
                details: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
    }
}
