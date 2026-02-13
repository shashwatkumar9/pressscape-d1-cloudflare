export const runtime = "edge";

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';



// POST /api/admin/migrate/seed-contributor - Seed an approved test contributor
export async function POST(request: NextRequest) {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();
        const now = new Date().toISOString();

        // Get a website from the marketplace (try approved first, then any website)
        let websitesResult = await sql`
      SELECT id, domain FROM websites WHERE verification_status = 'approved' AND is_active = true LIMIT 1
    `;

        // If no approved websites, try any website
        if (websitesResult.rows.length === 0) {
            websitesResult = await sql`
        SELECT id, domain FROM websites LIMIT 1
      `;
        }

        if (websitesResult.rows.length === 0) {
            return NextResponse.json({ error: 'No websites found in database' }, { status: 404 });
        }

        const website = websitesResult.rows[0];

        // Get a user to be the contributor (not the website owner)
        const usersResult = await sql`
      SELECT id, name, email FROM users 
      WHERE id != (SELECT owner_id FROM websites WHERE id = ${website.id})
      LIMIT 1
    `;

        if (usersResult.rows.length === 0) {
            return NextResponse.json({ error: 'No users found to be contributor' }, { status: 404 });
        }

        const user = usersResult.rows[0];

        // Check if contributor already exists
        const existingResult = await sql`
      SELECT id FROM website_contributors 
      WHERE website_id = ${website.id} AND user_id = ${user.id}
    `;

        let contributorId;

        if (existingResult.rows.length > 0) {
            // Update existing to be approved
            await sql`
        UPDATE website_contributors 
        SET is_approved = true, 
            is_active = true, 
            approved_at = ${now},
            writing_price = 5000,
            display_name = 'Pro Content Writer',
            bio = 'Experienced tech and business writer with 5+ years of expertise in SEO-optimized content.',
            specialties = ARRAY['technology', 'business', 'marketing'],
            average_rating = 4.8,
            rating_count = 15,
            turnaround_days = 3
        WHERE website_id = ${website.id} AND user_id = ${user.id}
      `;
            contributorId = existingResult.rows[0].id;
        } else {
            // Insert new approved contributor
            const insertResult = await sql`
        INSERT INTO website_contributors (
          website_id, user_id, writing_price, display_name, bio, 
          specialties, is_active, is_approved, approved_at,
          average_rating, rating_count, turnaround_days
        ) VALUES (
          ${website.id}, ${user.id}, 5000, 'Pro Content Writer',
          'Experienced tech and business writer with 5+ years of expertise in SEO-optimized content.',
          ARRAY['technology', 'business', 'marketing'], true, true, NOW(),
          4.8, 15, 3
        )
        RETURNING id
      `;
            contributorId = insertResult.rows[0].id;
        }

        return NextResponse.json({
            success: true,
            message: 'Test contributor seeded and approved',
            contributor: {
                id: contributorId,
                website_id: website.id,
                website_domain: website.domain,
                user_id: user.id,
                user_name: user.name,
                user_email: user.email
            }
        });
    } catch (error) {
        console.error('Seed contributor error:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to seed contributor'
        }, { status: 500 });
    }
}
