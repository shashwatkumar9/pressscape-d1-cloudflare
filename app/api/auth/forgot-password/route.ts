export const runtime = "edge";

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';
import { sendPasswordResetEmail } from '@/lib/email';
import { z } from 'zod';

// Web Crypto API helpers for Edge Runtime
function generateRandomToken(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

function generateRandomInt(min: number, max: number): number {
  const range = max - min;
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return min + (array[0] % range);
}

async function generateMD5Hash(data: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('MD5', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 8);
}




const schema = z.object({
    email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();

        const body = await request.json() as any;

        const result = schema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { error: result.error.issues[0].message },
                { status: 400 }
            );
        }

        const { email } = result.data;

        // Find user
        const userResult = await sql`
      SELECT id, email, name FROM users WHERE email = ${email}
    `;

        // Always return success to prevent email enumeration
        if (userResult.rows.length === 0) {
            return NextResponse.json({ success: true });
        }

        const user = userResult.rows[0] as Record<string, unknown>;

        // Check if a token was created in the last 2 minutes to prevent duplicate emails
        const recentTokenResult = await sql`
      SELECT created_at, token
      FROM password_reset_tokens
      WHERE user_id = ${user.id as string}
      AND datetime(created_at) > datetime('now', '-2 minutes')
    `;

        // If recent token exists, reuse it instead of creating new one
        if (recentTokenResult.rows.length > 0) {
            const recentToken = recentTokenResult.rows[0] as Record<string, unknown>;
            console.log('[Forgot Password] Recent token exists (created:', recentToken.created_at, '), skipping duplicate email for:', email);
            return NextResponse.json({ success: true });
        }

        // Generate token
        const token = generateRandomToken(32);
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        // Delete any existing tokens for this user (older than 2 minutes)
        await sql`DELETE FROM password_reset_tokens WHERE user_id = ${user.id as string}`;

        // Save token
        await sql`
      INSERT INTO password_reset_tokens (user_id, token, expires_at)
      VALUES (${user.id as string}, ${token}, ${expiresAt.toISOString()})
    `;

        // Send email
        await sendPasswordResetEmail(
            user.email as string,
            user.name as string,
            token
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json(
            { error: 'An error occurred' },
            { status: 500 }
        );
    }
}
