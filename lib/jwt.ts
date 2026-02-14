// JWT utilities using Web Crypto API for Edge Runtime
export const runtime = 'edge';

interface JWTPayload {
    userId: string;
    email: string;
    name: string;
    iat: number;
    exp: number;
}

// Base64URL encode/decode
function base64UrlEncode(data: string): string {
    return btoa(data)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

function base64UrlDecode(data: string): string {
    const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
    return atob(base64);
}

// Generate JWT secret key from environment variable
async function getSecretKey(): Promise<CryptoKey> {
    const secret = process.env.JWT_SECRET || 'default-secret-change-in-production';
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);

    return await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign', 'verify']
    );
}

// Create JWT token
export async function createToken(userId: string, email: string, name: string): Promise<string> {
    const header = {
        alg: 'HS256',
        typ: 'JWT'
    };

    const payload: JWTPayload = {
        userId,
        email,
        name,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days
    };

    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));
    const message = `${encodedHeader}.${encodedPayload}`;

    const key = await getSecretKey();
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const signature = await crypto.subtle.sign('HMAC', key, data);

    const encodedSignature = base64UrlEncode(
        String.fromCharCode(...new Uint8Array(signature))
    );

    return `${message}.${encodedSignature}`;
}

// Verify and decode JWT token
export async function verifyToken(token: string): Promise<JWTPayload | null> {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            return null;
        }

        const [encodedHeader, encodedPayload, encodedSignature] = parts;
        const message = `${encodedHeader}.${encodedPayload}`;

        // Verify signature
        const key = await getSecretKey();
        const encoder = new TextEncoder();
        const data = encoder.encode(message);

        // Decode signature
        const signatureData = base64UrlDecode(encodedSignature);
        const signature = new Uint8Array(signatureData.length);
        for (let i = 0; i < signatureData.length; i++) {
            signature[i] = signatureData.charCodeAt(i);
        }

        const isValid = await crypto.subtle.verify('HMAC', key, signature, data);
        if (!isValid) {
            console.log('[JWT] Signature verification failed');
            return null;
        }

        // Decode payload
        const payload = JSON.parse(base64UrlDecode(encodedPayload)) as JWTPayload;

        // Check expiration
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp < now) {
            console.log('[JWT] Token expired');
            return null;
        }

        return payload;
    } catch (error) {
        console.error('[JWT] Token verification error:', error);
        return null;
    }
}
