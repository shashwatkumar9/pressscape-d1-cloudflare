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

function parsePrice(price: string): number {
    if (!price) return 0;
    const cleaned = price.toString().replace(/[$,\s]/g, '');
    return Math.round(parseFloat(cleaned) * 100) || 0;
}

function parseTurnaround(tat: string): number {
    if (!tat) return 3;
    const match = tat.match(/(\d+)/);
    return match ? parseInt(match[1]) : 3;
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

        const { websites } = await request.json() as any;

        if (!websites || !Array.isArray(websites) || websites.length === 0) {
            return NextResponse.json({ error: 'No websites provided' }, { status: 400 });
        }

        let successCount = 0;
        const errors: string[] = [];

        for (const row of websites) {
            try {
                const domain = cleanDomain(row['Domains'] || row['Domain'] || row['domain'] || '');
                const da = parseInt(row['DA'] || row['da'] || '0');
                const dr = parseInt(row['DR'] || row['dr'] || '0') || null;
                const traffic = parseTraffic(row['Traffic'] || row['traffic'] || '');
                const niche = row['Niche'] || row['niche'] || '';
                const linkType = (row['Link'] || row['link_type'] || '').toLowerCase().includes('dofollow') ? 'dofollow' : 'nofollow';
                const turnaround = parseTurnaround(row['TaT'] || row['turnaround'] || '');
                const price = parsePrice(row['Price in USD'] || row['Price'] || row['price'] || '');
                const samplePost = row['Sample Post'] || row['sample_post'] || null;

                if (!domain || !da || !price) {
                    errors.push(`Skipped row: missing domain, DA, or price`);
                    continue;
                }

                // Check if domain already exists for this user
                const existing = await sql`
          SELECT id FROM websites WHERE domain = ${domain} AND owner_id = ${session.user_id as string}
        `;
                if (existing.rows.length > 0) {
                    errors.push(`${domain}: already exists`);
                    continue;
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
            ${domain},
            ${domain},
            ${da},
            ${dr},
            ${traffic},
            ${linkType},
            ${turnaround},
            ${price},
            ${samplePost},
            false,
            'pending',
            NOW()
          )
        `;
                successCount++;
            } catch (err) {
                errors.push(`Error processing row: ${String(err)}`);
            }
        }

        return NextResponse.json({
            success: true,
            count: successCount,
            errors: errors.length > 0 ? errors.slice(0, 10) : undefined
        });
    } catch (error) {
        console.error('Error bulk adding websites:', error);
        return NextResponse.json({ error: 'Failed to upload websites' }, { status: 500 });
    }
}
