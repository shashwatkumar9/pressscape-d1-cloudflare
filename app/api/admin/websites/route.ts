export const runtime = "edge";

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';
import { validateAdminRequest, hasPermission } from '@/lib/admin-auth';
import { z } from 'zod';



const websiteSchema = z.object({
    domain: z.string().min(1, 'Domain is required'),
    name: z.string().min(1, 'Name is required'),
    ownerEmail: z.string().email('Valid owner email required'),
    domainAuthority: z.string().optional(),
    domainRating: z.string().optional(),
    organicTraffic: z.string().optional(),
    priceGuestPost: z.string().min(1, 'Price is required'),
    priceLinkInsertion: z.string().optional(),
    category: z.string().optional(),
    turnaroundDays: z.string().optional(),
});

// Create slug from domain
function createSlug(domain: string): string {
    return domain.toLowerCase().replace(/\./g, '-').replace(/[^a-z0-9-]/g, '');
}

export async function POST(request: NextRequest) {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();

        const { admin } = await validateAdminRequest();

        if (!admin || !hasPermission(admin.role, 'websites')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json() as any;
        const result = websiteSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error.issues[0].message },
                { status: 400 }
            );
        }

        const data = result.data;

        // Find owner by email
        const ownerResult = await sql`
      SELECT id FROM users WHERE email = ${data.ownerEmail}
    `;

        if (ownerResult.rows.length === 0) {
            return NextResponse.json(
                { error: 'Owner email not found. User must register first.' },
                { status: 400 }
            );
        }

        const ownerId = (ownerResult.rows[0] as Record<string, unknown>).id as string;

        // Check if domain already exists
        const existingResult = await sql`
      SELECT id FROM websites WHERE domain = ${data.domain}
    `;

        if (existingResult.rows.length > 0) {
            return NextResponse.json(
                { error: 'Domain already exists' },
                { status: 400 }
            );
        }

        // Get category ID
        let categoryId = null;
        if (data.category) {
            const catResult = await sql`
        SELECT id FROM categories WHERE slug = ${data.category} OR id = ${data.category}
      `;
            if (catResult.rows.length > 0) {
                categoryId = (catResult.rows[0] as Record<string, unknown>).id;
            }
        }

        const slug = createSlug(data.domain);

        // Insert website
        const websiteResult = await sql`
      INSERT INTO websites (
        domain, name, slug, owner_id, primary_category_id,
        domain_authority, domain_rating, organic_traffic,
        price_guest_post, price_link_insertion, turnaround_days,
        verification_status, is_active
      ) VALUES (
        ${data.domain},
        ${data.name},
        ${slug},
        ${ownerId},
        ${categoryId},
        ${data.domainAuthority ? parseInt(data.domainAuthority) : null},
        ${data.domainRating ? parseInt(data.domainRating) : null},
        ${data.organicTraffic ? parseInt(data.organicTraffic) : null},
        ${parseInt(data.priceGuestPost) * 100},
        ${data.priceLinkInsertion ? parseInt(data.priceLinkInsertion) * 100 : null},
        ${data.turnaroundDays ? parseInt(data.turnaroundDays) : 7},
        'approved',
        true
      )
      RETURNING id, domain, name
    `;

        // Update user to be a publisher if not already
        await sql`
      UPDATE users SET is_publisher = true WHERE id = ${ownerId} AND is_publisher = false
    `;

        return NextResponse.json({
            success: true,
            website: websiteResult.rows[0],
        });
    } catch (error) {
        console.error('Add website error:', error);
        return NextResponse.json(
            { error: 'An error occurred while adding website' },
            { status: 500 }
        );
    }
}
