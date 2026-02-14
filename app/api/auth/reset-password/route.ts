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
      SELECT prt.*, u.email, u.name
      FROM password_reset_tokens prt
      JOIN users u ON prt.user_id = u.id
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

        // Update user password
        await sql`
      UPDATE users SET password_hash = ${passwordHash}, updated_at = ${now}
      WHERE id = ${tokenData.user_id as string}
    `;

        // Mark token as used
        await sql`
      UPDATE password_reset_tokens SET used_at = ${now}
      WHERE id = ${tokenData.id as string}
    `;

        // Send confirmation email
        await sendPasswordChangedEmail(
            tokenData.email as string,
            tokenData.name as string
        );

        // Delete all sessions for this user (security)
        await sql`DELETE FROM sessions WHERE user_id = ${tokenData.user_id as string}`;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Reset password error:', error);
        return NextResponse.json(
            { error: 'An error occurred' },
            { status: 500 }
        );
    }
}
