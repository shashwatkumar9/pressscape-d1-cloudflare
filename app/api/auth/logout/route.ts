export const runtime = "edge";

import { NextResponse } from 'next/server';
import { invalidateSession } from '@/lib/auth';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';



export async function POST() {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();

        await invalidateSession();
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json(
            { error: 'An error occurred during logout' },
            { status: 500 }
        );
    }
}
