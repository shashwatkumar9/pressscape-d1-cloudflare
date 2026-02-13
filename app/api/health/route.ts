export const runtime = "edge";

import { NextResponse } from 'next/server';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';
import { checkDatabaseConnection } from '@/lib/db';



export async function GET() {
    try {
        // Initialize D1 database from Cloudflare context
        await initializeDatabaseFromContext();

        const dbConnected = await checkDatabaseConnection();

        return NextResponse.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            database: dbConnected ? 'connected' : 'disconnected',
            version: '1.0.0-d1',
        });
    } catch (error) {
        console.error('Health check error:', error);
        return NextResponse.json(
            {
                status: 'error',
                timestamp: new Date().toISOString(),
                database: 'error',
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
