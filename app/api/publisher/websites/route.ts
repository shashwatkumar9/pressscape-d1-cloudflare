export const runtime = "edge";

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';
import { cookies } from 'next/headers';



async function getSession() {
    const now = new Date().toISOString();
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('auth_session')?.value;
    if (!sessionId) return null;
    const result = await sql`
    SELECT s.*, u.* FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.id = ${sessionId} AND s.expires_at > ${now}
  `;
    return result.rows[0] || null;
}

function parseTraffic(traffic: string): number {
    if (!traffic) return 0;
    const cleaned = traffic.toString().replace(/[,\s]/g, '').toLowerCase();
    if (cleaned.includes('m')) return Math.round(parseFloat(cleaned) * 1000000);
    if (cleaned.includes('k')) return Math.round(parseFloat(cleaned) * 1000);
    return parseInt(cleaned) || 0;
}

function cleanDomain(url: string): string {
    try {
        const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
        return parsed.hostname.replace(/^www\./, '');
    } catch {
        return url.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '');
    }
}

export async function POST(request: NextRequest) {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();
        const now = new Date().toISOString();

        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Please log in' }, { status: 401 });
        }

        const body = await request.json() as any;
        const { domain, da, dr, traffic, niche, linkType, turnaround, price, samplePost } = body;

        if (!domain || !da || !price) {
            return NextResponse.json({ error: 'Domain, DA, and Price are required' }, { status: 400 });
        }

        const cleanedDomain = cleanDomain(domain);

        // Check if domain already exists for this user
        const existing = await sql`
      SELECT id FROM websites WHERE domain = ${cleanedDomain} AND owner_id = ${session.user_id as string}
    `;
        if (existing.rows.length > 0) {
            return NextResponse.json({ error: 'This website already exists in your portfolio' }, { status: 400 });
        }

        // Insert website
        await sql`
      INSERT INTO websites (
        id, owner_id, domain, name, domain_authority, domain_rating,
        organic_traffic, link_type, turnaround_days, price_guest_post,
        sample_post_url, is_active, verification_status, created_at
      ) VALUES (
        gen_random_uuid()::text,
        ${session.user_id as string},
        ${cleanedDomain},
        ${cleanedDomain},
        ${parseInt(da)},
        ${dr ? parseInt(dr) : null},
        ${parseTraffic(traffic)},
        ${linkType || 'dofollow'},
        ${turnaround ? parseInt(turnaround) : 3},
        ${price},
        ${samplePost || null},
        false,
        'pending',
        NOW()
      )
    `;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error adding website:', error);
        return NextResponse.json({ error: 'Failed to add website' }, { status: 500 });
    }
}
