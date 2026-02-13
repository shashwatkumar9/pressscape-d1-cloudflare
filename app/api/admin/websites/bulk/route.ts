export const runtime = "edge";

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';
import { validateAdminRequest, hasPermission } from '@/lib/admin-auth';



// Parse CSV string
function parseCSV(csv: string): Record<string, string>[] {
    const lines = csv.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const rows: Record<string, string>[] = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length !== headers.length) continue;

        const row: Record<string, string> = {};
        headers.forEach((header, index) => {
            row[header] = values[index];
        });
        rows.push(row);
    }

    return rows;
}

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
        const { csv } = body;

        if (!csv || typeof csv !== 'string') {
            return NextResponse.json({ error: 'CSV data is required' }, { status: 400 });
        }

        const rows = parseCSV(csv);
        if (rows.length === 0) {
            return NextResponse.json({ error: 'No valid rows found in CSV' }, { status: 400 });
        }

        let success = 0;
        let failed = 0;
        const errors: string[] = [];

        for (const row of rows) {
            try {
                // Validate required fields
                if (!row.domain || !row.name || !row.owner_email || !row.price_guest_post) {
                    errors.push(`Row missing required fields: ${row.domain || 'unknown'}`);
                    failed++;
                    continue;
                }

                // Find owner
                const ownerResult = await sql`
          SELECT id FROM users WHERE email = ${row.owner_email}
        `;

                if (ownerResult.rows.length === 0) {
                    errors.push(`Owner not found: ${row.owner_email}`);
                    failed++;
                    continue;
                }

                const ownerId = (ownerResult.rows[0] as Record<string, unknown>).id as string;

                // Check if domain exists
                const existingResult = await sql`
          SELECT id FROM websites WHERE domain = ${row.domain}
        `;

                if (existingResult.rows.length > 0) {
                    errors.push(`Domain already exists: ${row.domain}`);
                    failed++;
                    continue;
                }

                // Get category
                let categoryId = null;
                if (row.category) {
                    const catResult = await sql`
            SELECT id FROM categories WHERE slug = ${row.category} OR id = ${row.category}
          `;
                    if (catResult.rows.length > 0) {
                        categoryId = (catResult.rows[0] as Record<string, unknown>).id;
                    }
                }

                const slug = createSlug(row.domain);

                // Insert website
                await sql`
          INSERT INTO websites (
            domain, name, slug, owner_id, primary_category_id,
            domain_authority, domain_rating, organic_traffic,
            price_guest_post, price_link_insertion, turnaround_days,
            verification_status, is_active
          ) VALUES (
            ${row.domain},
            ${row.name},
            ${slug},
            ${ownerId},
            ${categoryId},
            ${row.da ? parseInt(row.da) : null},
            ${row.dr ? parseInt(row.dr) : null},
            ${row.traffic ? parseInt(row.traffic) : null},
            ${parseInt(row.price_guest_post) * 100},
            ${row.price_link_insertion ? parseInt(row.price_link_insertion) * 100 : null},
            ${row.turnaround_days ? parseInt(row.turnaround_days) : 7},
            'approved',
            true
          )
        `;

                // Update user to be publisher
                await sql`
          UPDATE users SET is_publisher = true WHERE id = ${ownerId} AND is_publisher = false
        `;

                success++;
            } catch (err) {
                errors.push(`Error importing ${row.domain}: ${err instanceof Error ? err.message : 'Unknown error'}`);
                failed++;
            }
        }

        return NextResponse.json({
            success,
            failed,
            errors,
        });
    } catch (error) {
        console.error('Bulk import error:', error);
        return NextResponse.json(
            { error: 'An error occurred during import' },
            { status: 500 }
        );
    }
}
