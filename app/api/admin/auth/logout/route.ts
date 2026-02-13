export const runtime = "edge";

import { NextResponse } from 'next/server';
import { invalidateAdminSession } from '@/lib/admin-auth';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';



export async function POST() {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();

        await invalidateAdminSession();
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Admin logout error:', error);
        return NextResponse.json(
            { error: 'An error occurred during logout' },
            { status: 500 }
        );
    }
}
