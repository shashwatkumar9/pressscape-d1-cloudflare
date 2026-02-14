export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';
import { hashPassword, verifyPassword } from '@/lib/password';
import { createAdminSession } from '@/lib/admin-auth';
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

        const result = loginSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { error: result.error.issues[0].message },
                { status: 400 }
            );
        }

        const { email, password } = result.data;

        // Find admin user (use LOWER for case-insensitive match)
        const adminResult = await sql`
      SELECT id, email, name, password_hash, role, is_active
      FROM admin_users 
      WHERE LOWER(email) = LOWER(${email})
    `;

        if (adminResult.rows.length === 0) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        const admin = adminResult.rows[0] as Record<string, unknown>;

        if (!admin.is_active) {
            return NextResponse.json(
                { error: 'Account is deactivated' },
                { status: 403 }
            );
        }

        // Verify password
        const validPassword = await verifyPassword(password, admin.password_hash as string);
        if (!validPassword) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Update last login
        await sql`UPDATE admin_users SET last_login_at = ${now} WHERE id = ${admin.id as string}`;

        // Create session
        await createAdminSession(admin.id as string);

        return NextResponse.json({
            success: true,
            admin: {
                id: admin.id,
                email: admin.email,
                name: admin.name,
                role: admin.role,
            },
        });
    } catch (error) {
        console.error('Admin login error:', error);
        return NextResponse.json(
            { error: 'An error occurred during login' },
            { status: 500 }
        );
    }
}
