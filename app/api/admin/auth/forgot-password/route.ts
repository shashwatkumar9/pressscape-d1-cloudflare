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

        // Find admin user
        const adminResult = await sql`
      SELECT id, email, name FROM admin_users WHERE email = ${email} AND is_active = true
    `;

        // Always return success to prevent email enumeration
        if (adminResult.rows.length === 0) {
            return NextResponse.json({ success: true });
        }

        const admin = adminResult.rows[0] as Record<string, unknown>;

        // Generate token
        const token = generateRandomToken(32);
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        // Delete any existing tokens for this admin
        await sql`DELETE FROM admin_password_reset_tokens WHERE admin_id = ${admin.id as string}`;

        // Save token
        await sql`
      INSERT INTO admin_password_reset_tokens (admin_id, token, expires_at)
      VALUES (${admin.id as string}, ${token}, ${expiresAt.toISOString()})
    `;

        // Send email (use admin-specific reset URL)
        const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
        const resetUrl = `${APP_URL}/admin/reset-password?token=${token}`;

        // Use a custom email send for admin reset
        await sendAdminPasswordResetEmail(
            admin.email as string,
            admin.name as string,
            resetUrl
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Admin forgot password error:', error);
        return NextResponse.json(
            { error: 'An error occurred' },
            { status: 500 }
        );
    }
}

// Custom admin reset email function
async function sendAdminPasswordResetEmail(to: string, name: string, resetUrl: string) {
    const { Resend } = await import('resend');

    if (!process.env.RESEND_API_KEY) {
        console.log('[Email] Admin password reset would send to:', to);
        return;
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const FROM_EMAIL = process.env.FROM_EMAIL || 'PressScape <noreply@pressscape.com>';

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#1e293b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#1e293b;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#0f172a;border-radius:12px;overflow:hidden;border:1px solid #334155;">
          <tr>
            <td style="background:linear-gradient(135deg,#dc2626 0%,#ea580c 100%);padding:32px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:bold;">🛡️ PressScape Admin</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <h2 style="margin:0 0 16px;color:#ffffff;font-size:24px;">Reset Your Admin Password</h2>
              <p style="margin:0 0 16px;color:#94a3b8;font-size:16px;line-height:1.6;">
                Hi ${name}, we received a request to reset your admin account password.
              </p>
              <p style="margin:0 0 24px;text-align:center;">
                <a href="${resetUrl}" style="display:inline-block;padding:12px 32px;background:linear-gradient(135deg,#dc2626 0%,#ea580c 100%);color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;">
                  Reset Password
                </a>
              </p>
              <p style="margin:0 0 8px;color:#64748b;font-size:14px;">
                This link expires in 1 hour. If you didn't request this, please secure your account.
              </p>
              <p style="margin:0;color:#475569;font-size:12px;word-break:break-all;">
                ${resetUrl}
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#0f172a;padding:24px;text-align:center;border-top:1px solid #334155;">
              <p style="margin:0;color:#64748b;font-size:14px;">
                PressScape Admin Panel
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

    await resend.emails.send({
        from: FROM_EMAIL,
        to,
        subject: '🛡️ Admin Password Reset - PressScape',
        html,
    });
}
