'use server';

import { sql } from '@/lib/db';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';
import { verifyPassword } from '@/lib/password';
import { createToken } from '@/lib/jwt';

export async function loginAction(prevState: any, formData: FormData) {
    try {
        console.log('[Login] Starting login action');

        // Initialize D1 database
        await initializeDatabaseFromContext();
        const now = new Date().toISOString();

        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        console.log('[Login] Email:', email);

        if (!email || !password) {
            console.log('[Login] Missing credentials');
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

        // Create JWT token
        console.log('[Login] Creating JWT token for user:', user.id);
        const token = await createToken(
            user.id as string,
            user.email as string,
            user.name as string
        );

        console.log('[Login] JWT token created successfully');
        console.log('[Login] Login successful for user:', email);

        // Return token to client
        return {
            success: true,
            token
        };

    } catch (error) {
        console.error('[Login] Error occurred:', error);
        console.error('[Login] Error message:', error instanceof Error ? error.message : String(error));
        console.error('[Login] Error stack:', error instanceof Error ? error.stack : 'No stack');
        return {
            error: 'An error occurred during login',
            details: error instanceof Error ? error.message : String(error)
        };
    }
}
