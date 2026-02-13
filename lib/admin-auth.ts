import { sql } from '@/lib/db';
import { cookies } from 'next/headers';
import { cache } from 'react';

// Types
interface AdminSession {
    id: string;
    adminId: string;
    expiresAt: Date;
}

interface AdminUser {
    id: string;
    email: string;
    name: string;
    role: AdminRole;
    avatarUrl: string | null;
}

export type AdminRole =
    | 'super_admin'
    | 'admin'
    | 'finance_manager'
    | 'content_manager'
    | 'support_agent'
    | 'editor';

interface ValidateResult {
    admin: AdminUser | null;
    session: AdminSession | null;
}

const ADMIN_SESSION_COOKIE = 'admin_session';
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000; // 8 hours

// Role hierarchy and permissions
export const ROLE_HIERARCHY: Record<AdminRole, number> = {
    super_admin: 1,
    admin: 2,
    finance_manager: 3,
    content_manager: 4,
    support_agent: 5,
    editor: 6,
};

export const ROLE_PERMISSIONS: Record<AdminRole, string[]> = {
    super_admin: ['*'], // All permissions
    admin: ['users', 'websites', 'orders', 'refunds', 'emails', 'blog', 'settings'],
    finance_manager: ['orders', 'refunds', 'transactions'],
    content_manager: ['websites', 'blog'],
    support_agent: ['users:read', 'orders:read', 'websites:read'],
    editor: ['blog:own'],
};

// Generate session ID using Web Crypto API
function generateSessionId(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

// Validate admin session
export const validateAdminRequest = cache(async (): Promise<ValidateResult> => {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(ADMIN_SESSION_COOKIE)?.value ?? null;

    if (!sessionId) {
        return { admin: null, session: null };
    }

    try {
        const result = await sql`
      SELECT 
        s.id as session_id,
        s.admin_id,
        s.expires_at,
        a.id,
        a.email,
        a.name,
        a.role,
        a.avatar_url
      FROM admin_sessions s
      JOIN admin_users a ON s.admin_id = a.id
      WHERE s.id = ${sessionId} AND a.is_active = true
    `;

        if (result.rows.length === 0) {
            cookieStore.set(ADMIN_SESSION_COOKIE, '', { maxAge: 0 });
            return { admin: null, session: null };
        }

        const row = result.rows[0] as Record<string, unknown>;
        const expiresAt = new Date(row.expires_at as string);

        if (expiresAt < new Date()) {
            await sql`DELETE FROM admin_sessions WHERE id = ${sessionId}`;
            cookieStore.set(ADMIN_SESSION_COOKIE, '', { maxAge: 0 });
            return { admin: null, session: null };
        }

        const session: AdminSession = {
            id: row.session_id as string,
            adminId: row.admin_id as string,
            expiresAt,
        };

        const admin: AdminUser = {
            id: row.id as string,
            email: row.email as string,
            name: row.name as string,
            role: row.role as AdminRole,
            avatarUrl: row.avatar_url as string | null,
        };

        return { admin, session };
    } catch (error) {
        console.error('Admin session validation error:', error);
        return { admin: null, session: null };
    }
});

// Create admin session
export async function createAdminSession(adminId: string): Promise<AdminSession> {
    const sessionId = generateSessionId();
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

    await sql`
    INSERT INTO admin_sessions (id, admin_id, expires_at)
    VALUES (${sessionId}, ${adminId}, ${expiresAt.toISOString()})
  `;

    const session: AdminSession = {
        id: sessionId,
        adminId,
        expiresAt,
    };

    const cookieStore = await cookies();
    cookieStore.set(ADMIN_SESSION_COOKIE, sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: expiresAt,
        path: '/',
    });

    return session;
}

// Invalidate admin session
export async function invalidateAdminSession(): Promise<void> {
    const { session } = await validateAdminRequest();
    if (!session) return;

    await sql`DELETE FROM admin_sessions WHERE id = ${session.id}`;

    const cookieStore = await cookies();
    cookieStore.set(ADMIN_SESSION_COOKIE, '', { maxAge: 0, path: '/' });
}

// Check if admin has permission
export function hasPermission(role: AdminRole, permission: string): boolean {
    const permissions = ROLE_PERMISSIONS[role];
    if (permissions.includes('*')) return true;
    if (permissions.includes(permission)) return true;

    // Check for partial permission (e.g., 'users' includes 'users:read')
    const basePermission = permission.split(':')[0];
    if (permissions.includes(basePermission)) return true;

    return false;
}

// Check if role can manage another role
export function canManageRole(managerRole: AdminRole, targetRole: AdminRole): boolean {
    return ROLE_HIERARCHY[managerRole] < ROLE_HIERARCHY[targetRole];
}

// Alias for backward compatibility
export const getAdminSession = validateAdminRequest;
