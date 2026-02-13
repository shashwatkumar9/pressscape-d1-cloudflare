/// <reference types="@cloudflare/workers-types" />

// Extend the global namespace for Cloudflare Workers
declare global {
    interface CloudflareEnv {
        DB: D1Database;
        // Add other bindings here
    }
}

export {};
