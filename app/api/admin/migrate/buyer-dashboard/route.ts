export const runtime = "edge";

import { NextRequest, NextResponse } from 'next/server';
import { sql , generateId } from '@/lib/db';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';



// POST /api/admin/migrate/buyer-dashboard - Apply buyer dashboard migration
export async function POST() {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();

        // Projects table
        await sql`
            CREATE TABLE IF NOT EXISTS projects (
                id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
                user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                name VARCHAR(100) NOT NULL,
                url VARCHAR(500) NOT NULL,
                description TEXT,
                favicon VARCHAR(500),
                budget_spent INTEGER DEFAULT 0,
                order_count INTEGER DEFAULT 0,
                completed_order_count INTEGER DEFAULT 0,
                last_order_at TIMESTAMPTZ,
                is_active BOOLEAN DEFAULT 1,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            )
        `;

        // Notifications table
        await sql`
            CREATE TABLE IF NOT EXISTS notifications (
                id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
                user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                type VARCHAR(100) NOT NULL,
                title VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                data JSONB DEFAULT '{}',
                link VARCHAR(500),
                is_read BOOLEAN DEFAULT 0,
                read_at TIMESTAMPTZ,
                created_at TIMESTAMPTZ DEFAULT NOW()
            )
        `;

        // Activity logs table
        await sql`
            CREATE TABLE IF NOT EXISTS activity_logs (
                id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
                user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                action VARCHAR(100) NOT NULL,
                description TEXT NOT NULL,
                model_type VARCHAR(100),
                model_id TEXT,
                ip_address VARCHAR(45),
                user_agent TEXT,
                metadata JSONB DEFAULT '{}',
                created_at TIMESTAMPTZ DEFAULT NOW()
            )
        `;

        // Favorites table
        await sql`
            CREATE TABLE IF NOT EXISTS favorites (
                id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
                user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
                website_id TEXT NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
                notes TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                UNIQUE(user_id, project_id, website_id)
            )
        `;

        // Blacklists table
        await sql`
            CREATE TABLE IF NOT EXISTS blacklists (
                id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
                user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
                website_id TEXT REFERENCES websites(id) ON DELETE CASCADE,
                domain VARCHAR(255),
                reason TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW()
            )
        `;

        // Add balance_reserved column to users
        try {
            await sql`ALTER TABLE users ADD COLUMN balance_reserved INTEGER DEFAULT 0`;
        } catch (e: any) {
            if (!e.message?.includes('already exists')) throw e;
        }

        // Add balance_bonus column to users
        try {
            await sql`ALTER TABLE users ADD COLUMN balance_bonus INTEGER DEFAULT 0`;
        } catch (e: any) {
            if (!e.message?.includes('already exists')) throw e;
        }

        // Add project_id to orders
        try {
            await sql`ALTER TABLE orders ADD COLUMN project_id TEXT REFERENCES projects(id) ON DELETE SET NULL`;
        } catch (e: any) {
            if (!e.message?.includes('already exists')) throw e;
        }

        // Create indexes
        await sql`CREATE INDEX IF NOT EXISTS idx_projects_user ON projects(user_id, is_active)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read, created_at DESC)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_activity_user ON activity_logs(user_id, created_at DESC)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id, project_id)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_blacklists_user ON blacklists(user_id, project_id)`;

        return NextResponse.json({
            success: true,
            message: 'Buyer dashboard migration applied successfully',
            tables: ['projects', 'notifications', 'activity_logs', 'favorites', 'blacklists'],
            columns: ['users.balance_reserved', 'users.balance_bonus', 'orders.project_id']
        });
    } catch (error) {
        console.error('Buyer dashboard migration error:', error);
        return NextResponse.json(
            {
                error: 'Failed to apply migration',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json({
        message: 'POST to this endpoint to apply the buyer dashboard migration',
        description: 'Creates projects, notifications, activity_logs, favorites, blacklists tables and adds balance columns to users'
    });
}
