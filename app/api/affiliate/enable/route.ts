export const runtime = "edge";

import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';
import { validateRequest } from '@/lib/auth';

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




function generateAffiliateCode(name: string): string {
    // Generate code like "JOHN1234" - first 4 chars of name + 4 random digits
    const prefix = name.replace(/[^a-zA-Z]/g, '').substring(0, 4).toUpperCase() || 'USER';
    const suffix = generateRandomInt(1000, 9999);
    return `${prefix}${suffix}`;
}

export async function POST() {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();
        const now = new Date().toISOString();

        const { user, session } = await validateRequest();

        if (!session || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if already an affiliate
        const userResult = await sql`
            SELECT is_affiliate, affiliate_code, name FROM users WHERE id = ${user.id}
        `;

        if (userResult.rows.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const userData = userResult.rows[0] as {
            is_affiliate: boolean;
            affiliate_code: string | null;
            name: string;
        };

        if (userData.is_affiliate && userData.affiliate_code) {
            return NextResponse.json({
                message: 'Already an affiliate',
                affiliateCode: userData.affiliate_code
            });
        }

        // Generate unique affiliate code
        let affiliateCode = generateAffiliateCode(userData.name);
        let attempts = 0;

        // Ensure uniqueness
        while (attempts < 10) {
            const existing = await sql`
                SELECT id FROM users WHERE affiliate_code = ${affiliateCode}
            `;
            if (existing.rows.length === 0) break;
            affiliateCode = generateAffiliateCode(userData.name);
            attempts++;
        }

        // Enable affiliate and set code
        await sql`
            UPDATE users 
            SET is_affiliate = true, affiliate_code = ${affiliateCode}, updated_at = ${now}
            WHERE id = ${user.id}
        `;

        return NextResponse.json({
            success: true,
            affiliateCode,
            message: 'Affiliate program enabled successfully!'
        });

    } catch (error) {
        console.error('Error enabling affiliate:', error);
        return NextResponse.json({ error: 'Failed to enable affiliate program' }, { status: 500 });
    }
}
