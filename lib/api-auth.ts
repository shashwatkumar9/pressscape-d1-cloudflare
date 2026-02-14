/**
 * API Key Authentication for Public Buyer API
 * Provides key generation, validation, and rate limiting
 */

import { sql } from './db';
import { hashPassword, verifyPassword } from './password';

// Types
export interface ApiKey {
    id: string;
    userId: string;
    name: string;
    prefix: string;
    permissions: string[];
    rateLimit: number;
    isActive: boolean;
    lastUsedAt: Date | null;
    createdAt: Date;
}

export interface ApiKeyValidation {
    valid: boolean;
    key?: ApiKey;
    user?: {
        id: string;
        email: string;
        name: string;
        isBuyer: boolean;
    };
    error?: string;
}

/**
 * Generate a new API key for a user
 * Returns the raw key (only shown once) and the key metadata
 */
export async function generateApiKey(
    userId: string,
    name: string,
    permissions: string[] = ['read']
): Promise<{ rawKey: string; apiKey: ApiKey } | { error: string }> {
    try {
        // Generate a secure random key using Web Crypto API
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        const base64url = btoa(String.fromCharCode(...array))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
        const rawKey = `ps_${base64url}`;

        // Create prefix for identification (first 12 chars after ps_)
        const prefix = rawKey.substring(0, 15);

        // Hash the key for storage
        const keyHash = await hashPassword(rawKey);

        // Insert into database
        const result = await sql`
            INSERT INTO api_keys (user_id, name, key_hash, prefix, permissions)
            VALUES (${userId}, ${name}, ${keyHash}, ${prefix}, ${permissions})
            RETURNING id, user_id, name, prefix, permissions, rate_limit, is_active, created_at
        `;

        if (result.rows.length === 0) {
            return { error: 'Failed to create API key' };
        }

        const row = result.rows[0] as {
            id: string;
            user_id: string;
            name: string;
            prefix: string;
            permissions: string[];
            rate_limit: number;
            is_active: boolean;
            created_at: Date;
        };

        return {
            rawKey,
            apiKey: {
                id: row.id,
                userId: row.user_id,
                name: row.name,
                prefix: row.prefix,
                permissions: row.permissions,
                rateLimit: row.rate_limit,
                isActive: row.is_active,
                lastUsedAt: null,
                createdAt: row.created_at
            }
        };
    } catch (error) {
        console.error('Error generating API key:', error);
        return { error: 'Failed to generate API key' };
    }
}

/**
 * Validate an API key and return user info
 */
export async function validateApiKey(rawKey: string): Promise<ApiKeyValidation> {
    try {
        if (!rawKey || !rawKey.startsWith('ps_')) {
            return { valid: false, error: 'Invalid API key format' };
        }

        // Get prefix for lookup
        const prefix = rawKey.substring(0, 15);

        // Find keys with matching prefix
        const result = await sql`
            SELECT 
                k.id, k.user_id, k.name, k.key_hash, k.prefix, 
                k.permissions, k.rate_limit, k.is_active,
                u.email, u.name as user_name, u.is_buyer
            FROM api_keys k
            JOIN users u ON k.user_id = u.id
            WHERE k.prefix = ${prefix} AND k.is_active = true
        `;

        if (result.rows.length === 0) {
            return { valid: false, error: 'API key not found' };
        }

        // Verify the key hash
        for (const row of result.rows as Array<{
            id: string;
            user_id: string;
            name: string;
            key_hash: string;
            prefix: string;
            permissions: string[];
            rate_limit: number;
            is_active: boolean;
            email: string;
            user_name: string;
            is_buyer: boolean;
        }>) {
            const isValid = await verifyPassword(rawKey, row.key_hash);

            if (isValid) {
                // Update last used timestamp
                await sql`
                    UPDATE api_keys 
                    SET last_used_at = NOW(), request_count = request_count + 1
                    WHERE id = ${row.id}
                `;

                return {
                    valid: true,
                    key: {
                        id: row.id,
                        userId: row.user_id,
                        name: row.name,
                        prefix: row.prefix,
                        permissions: row.permissions,
                        rateLimit: row.rate_limit,
                        isActive: row.is_active,
                        lastUsedAt: new Date(),
                        createdAt: new Date()
                    },
                    user: {
                        id: row.user_id,
                        email: row.email,
                        name: row.user_name,
                        isBuyer: row.is_buyer
                    }
                };
            }
        }

        return { valid: false, error: 'Invalid API key' };
    } catch (error) {
        console.error('Error validating API key:', error);
        return { valid: false, error: 'Validation failed' };
    }
}

/**
 * Check rate limit for an API key
 * Returns true if request is allowed, false if rate limited
 */
export async function checkRateLimit(keyId: string, limit: number = 100): Promise<{
    allowed: boolean;
    remaining: number;
    resetAt: Date;
}> {
    try {
        // Get current minute window
        const now = new Date();
        const windowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(),
            now.getHours(), now.getMinutes(), 0, 0);
        const resetAt = new Date(windowStart.getTime() + 60000);

        // Upsert rate limit record
        const result = await sql`
            INSERT INTO api_rate_limits (api_key_id, window_start, request_count)
            VALUES (${keyId}, ${windowStart.toISOString()}, 1)
            ON CONFLICT (api_key_id, window_start) 
            DO UPDATE SET request_count = api_rate_limits.request_count + 1
            RETURNING request_count
        `;

        const count = parseInt(String((result.rows[0] as { request_count: number })?.request_count || '1'));
        const remaining = Math.max(0, limit - count);
        const allowed = count <= limit;

        return { allowed, remaining, resetAt };
    } catch (error) {
        console.error('Error checking rate limit:', error);
        // Allow on error to prevent blocking legitimate requests
        return { allowed: true, remaining: 100, resetAt: new Date() };
    }
}

/**
 * Get all API keys for a user (without the actual key)
 */
export async function getUserApiKeys(userId: string): Promise<ApiKey[]> {
    const result = await sql`
        SELECT id, user_id, name, prefix, permissions, rate_limit, 
               is_active, last_used_at, created_at
        FROM api_keys
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
    `;

    type DbRow = {
        id: string;
        user_id: string;
        name: string;
        prefix: string;
        permissions: string[];
        rate_limit: number;
        is_active: boolean;
        last_used_at: Date | null;
        created_at: Date;
    };

    return (result.rows as DbRow[]).map((row) => ({
        id: row.id,
        userId: row.user_id,
        name: row.name,
        prefix: row.prefix,
        permissions: row.permissions,
        rateLimit: row.rate_limit,
        isActive: row.is_active,
        lastUsedAt: row.last_used_at,
        createdAt: row.created_at
    }));
}

/**
 * Revoke an API key
 */
export async function revokeApiKey(keyId: string, userId: string): Promise<boolean> {
    const result = await sql`
        UPDATE api_keys 
        SET is_active = false 
        WHERE id = ${keyId} AND user_id = ${userId}
    `;

    return result.rowCount > 0;
}

/**
 * Delete an API key permanently
 */
export async function deleteApiKey(keyId: string, userId: string): Promise<boolean> {
    const result = await sql`
        DELETE FROM api_keys 
        WHERE id = ${keyId} AND user_id = ${userId}
    `;

    return result.rowCount > 0;
}

/**
 * Middleware helper to validate API key from request
 */
export async function getApiKeyFromRequest(request: Request): Promise<ApiKeyValidation> {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader) {
        return { valid: false, error: 'Missing Authorization header' };
    }

    // Support "Bearer <key>" format
    const key = authHeader.startsWith('Bearer ')
        ? authHeader.substring(7)
        : authHeader;

    return validateApiKey(key);
}
