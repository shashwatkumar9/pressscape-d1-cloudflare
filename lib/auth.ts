import { cookies } from 'next/headers';
import { cache } from 'react';
import { verifyToken } from '@/lib/jwt';

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

const AUTH_COOKIE_NAME = 'auth_token';

// Validate JWT token
export const validateRequest = cache(async (): Promise<ValidateResult> => {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value ?? null;

    console.log('[Auth] Validating JWT, cookie found:', !!token);

    if (!token) {
        console.log('[Auth] No JWT token found');
        return { user: null, session: null };
    }

    try {
        // Verify JWT token
        const payload = await verifyToken(token);

        if (!payload) {
            console.log('[Auth] JWT verification failed');
            return { user: null, session: null };
        }

        console.log('[Auth] JWT verified for user:', payload.email);

        // Create user object from JWT payload
        const user: User = {
            id: payload.userId,
            email: payload.email,
            name: payload.name,
            isBuyer: false, // These will be fetched from DB if needed
            isPublisher: false,
            isAffiliate: false,
            avatarUrl: null,
        };

        // Create session object from JWT
        const session: Session = {
            id: token.substring(0, 16),
            userId: payload.userId,
            expiresAt: new Date(payload.exp * 1000),
        };

        return { user, session };
    } catch (error) {
        console.error('JWT validation error:', error);
        return { user: null, session: null };
    }
});

// Invalidate session (clear JWT cookie)
export async function invalidateSession(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, '', { maxAge: 0, path: '/' });
}

// Re-export for backwards compatibility
export const lucia = {
    sessionCookieName: AUTH_COOKIE_NAME,
};
