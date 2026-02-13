export const runtime = "edge";

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';



export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();

        const { id } = await params;

        const result = await sql`
      SELECT 
        w.*,
        c.name as category
      FROM websites w
      LEFT JOIN categories c ON w.primary_category_id = c.id
      WHERE w.id = ${id} AND w.is_active = true
    `;

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Website not found' }, { status: 404 });
        }

        const website = result.rows[0];

        // Fetch active, approved contributors for this website
        const contributorsResult = await sql`
          SELECT 
            wc.id,
            wc.user_id,
            wc.writing_price,
            wc.display_name,
            wc.bio,
            wc.specialties,
            wc.sample_work_url,
            wc.completed_orders,
            wc.average_rating,
            wc.rating_count,
            wc.turnaround_days,
            u.name as user_name,
            u.avatar_url
          FROM website_contributors wc
          JOIN users u ON wc.user_id = u.id
          WHERE wc.website_id = ${id}
            AND wc.is_active = true 
            AND wc.is_approved = true
          ORDER BY wc.average_rating DESC, wc.completed_orders DESC
        `;

        return NextResponse.json({
            ...website,
            contributors: contributorsResult.rows
        });
    } catch (error) {
        console.error('Error fetching website:', error);
        return NextResponse.json({ error: 'Failed to fetch website' }, { status: 500 });
    }
}
