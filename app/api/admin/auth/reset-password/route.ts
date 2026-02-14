export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';
import { sendPasswordChangedEmail } from '@/lib/email';
import { hashPassword, verifyPassword } from '@/lib/password';
import { z } from 'zod';



const schema = z.object({
    token: z.string().min(1, 'Token is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function POST(request: NextRequest) {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();
        const now = new Date().toISOString();

        const body = await request.json() as any;

        const result = schema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { error: result.error.issues[0].message },
                { status: 400 }
            );
        }

        const { token, password } = result.data;

        // Find valid token
        const tokenResult = await sql`
      SELECT prt.*, a.email, a.name
      FROM admin_password_reset_tokens prt
      JOIN admin_users a ON prt.admin_id = a.id
      WHERE prt.token = ${token}
        AND prt.expires_at > ${now}
        AND prt.used_at IS NULL
    `;

        if (tokenResult.rows.length === 0) {
            return NextResponse.json(
                { error: 'Invalid or expired reset link' },
                { status: 400 }
            );
        }

        const tokenData = tokenResult.rows[0] as Record<string, unknown>;

        // Hash new password
        const passwordHash = await hashPassword(password);

        // Update admin password
        await sql`
      UPDATE admin_users SET password_hash = ${passwordHash}, updated_at = ${now}
      WHERE id = ${tokenData.admin_id as string}
    `;

        // Mark token as used
        await sql`
      UPDATE admin_password_reset_tokens SET used_at = ${now}
      WHERE id = ${tokenData.id as string}
    `;

        // Delete all sessions for this admin (security)
        await sql`DELETE FROM admin_sessions WHERE admin_id = ${tokenData.admin_id as string}`;

        // Send confirmation email
        await sendPasswordChangedEmail(
            tokenData.email as string,
            tokenData.name as string
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Admin reset password error:', error);
        return NextResponse.json(
            { error: 'An error occurred' },
            { status: 500 }
        );
    }
}
