// NOTE: This route uses api-auth which depends on bcrypt (Node.js)
// export const runtime = "edge";

import { NextRequest, NextResponse } from 'next/server';
import { validateRequest } from '@/lib/auth';
import { generateApiKey, getUserApiKeys, deleteApiKey } from '@/lib/api-auth';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';



/**
 * GET /api/buyer/api-keys
 * List all API keys for the current user
 */
export async function GET() {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();

        const { user } = await validateRequest();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const keys = await getUserApiKeys(user.id);

        return NextResponse.json({ keys });
    } catch (error) {
        console.error('Error fetching API keys:', error);
        return NextResponse.json({ error: 'Failed to fetch API keys' }, { status: 500 });
    }
}

/**
 * POST /api/buyer/api-keys
 * Generate a new API key
 * 
 * Body: { name: string, permissions?: string[] }
 */
export async function POST(request: NextRequest) {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();

        const { user } = await validateRequest();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is a buyer
        if (!user.isBuyer) {
            return NextResponse.json({
                error: 'Only buyers can create API keys'
            }, { status: 403 });
        }

        const body = await request.json() as any;
        const { name, permissions = ['read'] } = body;

        if (!name || name.trim().length === 0) {
            return NextResponse.json({
                error: 'Key name is required'
            }, { status: 400 });
        }

        // Limit number of API keys per user
        const existingKeys = await getUserApiKeys(user.id);
        if (existingKeys.length >= 5) {
            return NextResponse.json({
                error: 'Maximum of 5 API keys allowed per user'
            }, { status: 400 });
        }

        const result = await generateApiKey(user.id, name.trim(), permissions);

        if ('error' in result) {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }

        return NextResponse.json({
            message: 'API key created successfully',
            key: result.rawKey,  // Only shown once!
            apiKey: result.apiKey
        });
    } catch (error) {
        console.error('Error creating API key:', error);
        return NextResponse.json({ error: 'Failed to create API key' }, { status: 500 });
    }
}

/**
 * DELETE /api/buyer/api-keys
 * Delete an API key
 * 
 * Body: { keyId: string }
 */
export async function DELETE(request: NextRequest) {
    try {
        // Initialize D1 database
        await initializeDatabaseFromContext();

        const { user } = await validateRequest();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json() as any;
        const { keyId } = body;

        if (!keyId) {
            return NextResponse.json({ error: 'Key ID is required' }, { status: 400 });
        }

        const deleted = await deleteApiKey(keyId, user.id);

        if (!deleted) {
            return NextResponse.json({
                error: 'API key not found or already deleted'
            }, { status: 404 });
        }

        return NextResponse.json({ message: 'API key deleted successfully' });
    } catch (error) {
        console.error('Error deleting API key:', error);
        return NextResponse.json({ error: 'Failed to delete API key' }, { status: 500 });
    }
}
