import { Lucia } from 'lucia';
import { sql, intToBool } from '@/lib/db';
import { cookies } from 'next/headers';
import { cache } from 'react';
import crypto from 'crypto';

// Types
interface Session {
    id: string;
    userId: string;
    expiresAt: Date;
}

interface User {
    id: string;
    email: string;
    name: string;
    isBuyer: boolean;
    isPublisher: boolean;
    isAffiliate: boolean;
    avatarUrl: string | null;
}

interface ValidateResult {
    user: User | null;
    session: Session | null;
}

const SESSION_COOKIE_NAME = 'auth_session';
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

// Generate session ID
function generateSessionId(): string {
    return crypto.randomBytes(32).toString('base64url');
}

// Validate session directly without Lucia
export const validateRequest = cache(async (): Promise<ValidateResult> => {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;

    if (!sessionId) {
        return { user: null, session: null };
    }

    try {
        const result = await sql`
      SELECT 
        s.id as session_id,
        s.user_id,
        s.expires_at,
        u.id,
        u.email,
        u.name,
        u.is_buyer,
        u.is_publisher,
        u.is_affiliate,
        u.avatar_url
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.id = ${sessionId}
    `;

        if (result.rows.length === 0) {
            // Clear invalid session cookie
            cookieStore.set(SESSION_COOKIE_NAME, '', { maxAge: 0 });
            return { user: null, session: null };
        }

        const row = result.rows[0] as Record<string, unknown>;
        const expiresAt = new Date(row.expires_at as string);

        // Check if session is expired
        if (expiresAt < new Date()) {
            await sql`DELETE FROM sessions WHERE id = ${sessionId}`;
            cookieStore.set(SESSION_COOKIE_NAME, '', { maxAge: 0 });
            return { user: null, session: null };
        }

        const session: Session = {
            id: row.session_id as string,
            userId: row.user_id as string,
            expiresAt,
        };

        const user: User = {
            id: row.id as string,
            email: row.email as string,
            name: row.name as string,
            isBuyer: intToBool(row.is_buyer as number),
            isPublisher: intToBool(row.is_publisher as number),
            isAffiliate: intToBool(row.is_affiliate as number),
            avatarUrl: row.avatar_url as string | null,
        };

        // Extend session if it's within 15 days of expiring
        const extendThreshold = Date.now() + 15 * 24 * 60 * 60 * 1000;
        if (expiresAt.getTime() < extendThreshold) {
            const newExpiresAt = new Date(Date.now() + SESSION_DURATION_MS);
            await sql`UPDATE sessions SET expires_at = ${newExpiresAt.toISOString()} WHERE id = ${sessionId}`;
        }

        return { user, session };
    } catch (error) {
        console.error('Session validation error:', error);
        return { user: null, session: null };
    }
});

// Create session
export async function createSession(userId: string): Promise<Session> {
    const sessionId = generateSessionId();
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

    await sql`
    INSERT INTO sessions (id, user_id, expires_at)
    VALUES (${sessionId}, ${userId}, ${expiresAt.toISOString()})
  `;

    const session: Session = {
        id: sessionId,
        userId,
        expiresAt,
    };

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: expiresAt,
        path: '/',
    });

    return session;
}

// Invalidate session
export async function invalidateSession(): Promise<void> {
    const { session } = await validateRequest();
    if (!session) {
        return;
    }

    await sql`DELETE FROM sessions WHERE id = ${session.id}`;

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, '', { maxAge: 0, path: '/' });
}

// Re-export for backwards compatibility (not using lucia anymore)
export const lucia = {
    sessionCookieName: SESSION_COOKIE_NAME,
};
