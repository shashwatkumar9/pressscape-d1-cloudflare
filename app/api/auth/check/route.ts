export const runtime = "edge";

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';



export async function GET() {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();

        const cookieStore = await cookies();
        const sessionId = cookieStore.get('auth_session')?.value;

        return NextResponse.json({
            isAuthenticated: !!sessionId,
            sessionId: sessionId ? 'exists' : null
        });
    } catch {
        return NextResponse.json({ isAuthenticated: false });
    }
}
