export const runtime = "edge";

import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';



export async function POST() {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();

        // Add SEO fields to blog_posts table if they don't exist
        await sql`
            ALTER TABLE blog_posts 
            ADD COLUMN IF NOT EXISTS meta_title TEXT,
            ADD COLUMN IF NOT EXISTS meta_description TEXT,
            ADD COLUMN IF NOT EXISTS keywords TEXT
        `;

        return NextResponse.json({
            success: true,
            message: 'Blog schema updated successfully',
        });
    } catch (error) {
        console.error('Schema update error:', error);
        return NextResponse.json(
            {
                error: 'Failed to update schema',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
