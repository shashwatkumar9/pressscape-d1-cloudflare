// NOTE: This route uses bcrypt which requires Node.js
// export const runtime = "edge";

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';
import bcrypt from 'bcrypt';
import { createSession } from '@/lib/auth';
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
        const validPassword = await bcrypt.compare(password, user.password_hash as string);
        if (!validPassword) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        // Update last login
        await sql`UPDATE users SET last_login_at = ${now} WHERE id = ${user.id as string}`;

        // Create session
        await createSession(user.id as string);

        return NextResponse.json({
            success: true,
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
        return NextResponse.json(
            { error: 'An error occurred during login' },
            { status: 500 }
        );
    }
}
