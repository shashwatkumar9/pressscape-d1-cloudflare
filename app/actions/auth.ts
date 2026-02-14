'use server';

export const runtime = 'edge';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { sql } from '@/lib/db';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';
import { verifyPassword } from '@/lib/password';

const SESSION_COOKIE_NAME = 'auth_session';
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

// Generate session ID using Web Crypto API
function generateSessionId(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

export async function loginAction(prevState: any, formData: FormData) {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();
        const now = new Date().toISOString();

        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        if (!email || !password) {
            return { error: 'Email and password are required' };
        }

        // Find user
        const userResult = await sql`
            SELECT id, email, name, password_hash, is_buyer, is_publisher, is_affiliate, is_active, is_banned
            FROM users
            WHERE email = ${email}
        `;

        if (userResult.rows.length === 0) {
            return { error: 'Invalid email or password' };
        }

        const user = userResult.rows[0];

        // Check if user is banned
        if (user.is_banned) {
            return { error: 'Your account has been suspended' };
        }

        // Check if user is active
        if (!user.is_active) {
            return { error: 'Your account is deactivated' };
        }

        // Verify password
        const validPassword = await verifyPassword(password, user.password_hash as string);

        if (!validPassword) {
            return { error: 'Invalid email or password' };
        }

        // Update last login
        await sql`UPDATE users SET last_login_at = ${now} WHERE id = ${user.id as string}`;

        // Generate session ID
        const sessionId = generateSessionId();
        const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

        // Insert session into database
        await sql`
            INSERT INTO sessions (id, user_id, expires_at)
            VALUES (${sessionId}, ${user.id as string}, ${expiresAt.toISOString()})
        `;

        // Set cookie using Next.js cookies() API
        const cookieStore = await cookies();
        cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
            path: '/',
        });

        console.log('Login successful for user:', email);
        console.log('Session created with ID:', sessionId.substring(0, 10) + '...');

        // Success - redirect will happen on client
        return { success: true };

    } catch (error) {
        console.error('Login error:', error);
        return { error: 'An error occurred during login' };
    }
}
