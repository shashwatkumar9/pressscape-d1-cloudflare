// Cloudflare bindings and environment types
export interface CloudflareEnv {
    DB: D1Database;
    // Add other Cloudflare bindings here
    // KV: KVNamespace;
    // R2: R2Bucket;
}

// Type for Cloudflare request context
export type CloudflareContext = {
    env: CloudflareEnv;
    ctx: ExecutionContext;
};

// Get Cloudflare context in API routes
// This is a placeholder - actual implementation depends on @cloudflare/next-on-pages
export async function getCloudflareContext(): Promise<CloudflareContext | null> {
    try {
        // In production with Cloudflare Pages, use getRequestContext from @cloudflare/next-on-pages
        // @ts-ignore
        const { getRequestContext } = await import('@cloudflare/next-on-pages');
        return getRequestContext();
    } catch (error) {
        console.warn('Running in development mode without Cloudflare context');
        return null;
    }
}

// Initialize database from Cloudflare context
export async function initializeDatabaseFromContext() {
    const context = await getCloudflareContext();

    if (context?.env?.DB) {
        const { setDatabase } = await import('@/lib/db');
        setDatabase(context.env.DB);
        return true;
    }

    // Fallback to local development database
    if (process.env.NODE_ENV === 'development') {
        console.log('🔧 Using local SQLite for development');
        const { getLocalDevDatabase, D1Adapter } = await import('@/lib/db-dev');
        const { setDatabase } = await import('@/lib/db');
        const localDb = getLocalDevDatabase();
        const adapter = new D1Adapter(localDb) as any;
        setDatabase(adapter);
        return true;
    }

    return false;
}
