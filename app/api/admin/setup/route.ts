export const runtime = "edge";

import { NextResponse } from 'next/server';
import { sql , generateId } from '@/lib/db';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';
import bcrypt from 'bcrypt';



export async function POST() {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();
        const now = new Date().toISOString();

        // Admin details
        const email = 'nanoo.shashwat@gmail.com';
        const password = 'Admin@123';
        const name = 'Shashwat Kumar';
        const role = 'super_admin';

        // Hash the password
        const passwordHash = await bcrypt.hash(password, 10);

        // Check if admin_users table exists
        const tableCheck = await sql`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'admin_users'
            )
        `;

        if (!tableCheck.rows[0].exists) {
            // Create the admin_users table first
            await sql`
                CREATE TABLE IF NOT EXISTS admin_users (
                  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
                  email TEXT UNIQUE NOT NULL,
                  password_hash TEXT NOT NULL,
                  name TEXT NOT NULL,
                  role TEXT NOT NULL CHECK (role IN (
                    'super_admin', 'admin', 'finance_manager', 
                    'content_manager', 'support_agent', 'editor'
                  )),
                  avatar_url TEXT,
                  is_active BOOLEAN DEFAULT true,
                  last_login_at TIMESTAMPTZ,
                  created_at TIMESTAMPTZ DEFAULT NOW(),
                  updated_at TIMESTAMPTZ DEFAULT NOW()
                )
            `;

            await sql`
                CREATE TABLE IF NOT EXISTS admin_sessions (
                  id TEXT PRIMARY KEY,
                  admin_id TEXT NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
                  expires_at TIMESTAMPTZ NOT NULL,
                  ip_address TEXT,
                  user_agent TEXT,
                  created_at TIMESTAMPTZ DEFAULT NOW()
                )
            `;

            await sql`CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email)`;
            await sql`CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role)`;
            await sql`CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin ON admin_sessions(admin_id)`;
        }

        // Use UPSERT to create or update admin user (handles race conditions)
        const result = await sql`
            INSERT INTO admin_users (email, password_hash, name, role, is_active)
            VALUES (${email}, ${passwordHash}, ${name}, ${role}, true)
            ON CONFLICT (email) 
            DO UPDATE SET 
                password_hash = EXCLUDED.password_hash,
                name = EXCLUDED.name,
                role = EXCLUDED.role,
                is_active = true,
                updated_at = ${now}
            RETURNING id, email
        `;

        const wasUpdated = result.rows.length > 0;

        return NextResponse.json({
            success: true,
            message: wasUpdated ? 'Admin user created/updated successfully' : 'Failed to upsert admin',
            credentials: {
                email,
                password,
                role,
                loginUrl: '/admin/login'
            }
        });
    } catch (error) {
        console.error('Admin setup error:', error);
        return NextResponse.json(
            {
                error: 'Failed to create admin account',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
