// Type for D1 Database binding
export type D1Database = any; // Will be properly typed by Cloudflare Workers

// Helper function to generate UUIDs using Web Crypto API
export function generateId(): string {
    return crypto.randomUUID();
}

// Helper to convert boolean to SQLite integer
export function boolToInt(value: boolean | undefined | null): number {
    return value ? 1 : 0;
}

// Helper to convert SQLite integer to boolean
export function intToBool(value: number | undefined | null): boolean {
    return value === 1;
}

// Helper to format dates for SQLite
export function formatDate(date: Date | string | null | undefined): string | null {
    if (!date) return null;
    if (typeof date === 'string') return date;
    return date.toISOString();
}

// Helper to parse dates from SQLite
export function parseDate(dateStr: string | null | undefined): Date | null {
    if (!dateStr) return null;
    return new Date(dateStr);
}

// Get D1 database instance from environment
// This will be injected by Cloudflare Workers
let dbInstance: D1Database | null = null;

export function setDatabase(db: D1Database) {
    dbInstance = db;
}

export function getDatabase(): D1Database {
    if (!dbInstance) {
        throw new Error('Database not initialized. Call setDatabase() first.');
    }
    return dbInstance;
}

// SQL template tag that works with Cloudflare D1
export async function sql<T = Record<string, unknown>>(
    strings: TemplateStringsArray,
    ...values: unknown[]
): Promise<{ rows: T[]; rowCount: number }> {
    const db = getDatabase();

    // Build parameterized query
    let query = '';
    const params: unknown[] = [];

    strings.forEach((str, i) => {
        query += str;
        if (i < values.length) {
            params.push(values[i]);
            query += `?`;
        }
    });

    try {
        const result = await db.prepare(query).bind(...params).all();
        return {
            rows: (result.results as T[]) || [],
            rowCount: result.results?.length || 0,
        };
    } catch (error) {
        console.error('Database query error:', error);
        console.error('Query:', query);
        console.error('Params:', params);
        throw error;
    }
}

// Execute a single query (for INSERT, UPDATE, DELETE)
export async function execute(
    query: string,
    params: unknown[] = []
): Promise<{ success: boolean; rowsAffected: number }> {
    const db = getDatabase();

    try {
        const result = await db.prepare(query).bind(...params).run();
        return {
            success: result.success || false,
            rowsAffected: result.meta?.changes || 0,
        };
    } catch (error) {
        console.error('Database execute error:', error);
        console.error('Query:', query);
        console.error('Params:', params);
        throw error;
    }
}

// Execute multiple queries in a batch
export async function batch(
    queries: Array<{ query: string; params?: unknown[] }>
): Promise<boolean> {
    const db = getDatabase();

    try {
        const statements = queries.map(({ query, params = [] }) =>
            db.prepare(query).bind(...params)
        );
        const results = await db.batch(statements);
        return results.every((r: any) => r.success !== false);
    } catch (error) {
        console.error('Database batch error:', error);
        throw error;
    }
}

// Helper function to check database connection
export async function checkDatabaseConnection(): Promise<boolean> {
    try {
        await sql`SELECT 1`;
        return true;
    } catch (error) {
        console.error('Database connection failed:', error);
        return false;
    }
}

// Common query helpers
export async function getUserById(id: string) {
    const result = await sql<any>`SELECT * FROM users WHERE id = ${id}`;
    if (!result.rows[0]) return null;

    const user = result.rows[0];
    // Convert SQLite integers to booleans
    return {
        ...user,
        email_verified: intToBool(user.email_verified),
        is_buyer: intToBool(user.is_buyer),
        is_publisher: intToBool(user.is_publisher),
        is_affiliate: intToBool(user.is_affiliate),
        notification_email: intToBool(user.notification_email),
        notification_orders: intToBool(user.notification_orders),
        is_verified: intToBool(user.is_verified),
        is_active: intToBool(user.is_active),
        is_banned: intToBool(user.is_banned),
    };
}

export async function getUserByEmail(email: string) {
    const result = await sql<any>`SELECT * FROM users WHERE email = ${email}`;
    if (!result.rows[0]) return null;

    const user = result.rows[0];
    // Convert SQLite integers to booleans
    return {
        ...user,
        email_verified: intToBool(user.email_verified),
        is_buyer: intToBool(user.is_buyer),
        is_publisher: intToBool(user.is_publisher),
        is_affiliate: intToBool(user.is_affiliate),
        notification_email: intToBool(user.notification_email),
        notification_orders: intToBool(user.notification_orders),
        is_verified: intToBool(user.is_verified),
        is_active: intToBool(user.is_active),
        is_banned: intToBool(user.is_banned),
    };
}

export async function getSessionById(sessionId: string) {
    const result = await sql<any>`
    SELECT s.*, u.*
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.id = ${sessionId}
  `;
    if (!result.rows[0]) return null;

    const row = result.rows[0];
    // Convert SQLite integers to booleans for user fields
    return {
        ...row,
        is_buyer: intToBool(row.is_buyer),
        is_publisher: intToBool(row.is_publisher),
        is_affiliate: intToBool(row.is_affiliate),
        email_verified: intToBool(row.email_verified),
        is_verified: intToBool(row.is_verified),
        is_active: intToBool(row.is_active),
        is_banned: intToBool(row.is_banned),
    };
}

// Transaction helpers
export async function beginTransaction() {
    return execute('BEGIN TRANSACTION');
}

export async function commitTransaction() {
    return execute('COMMIT');
}

export async function rollbackTransaction() {
    return execute('ROLLBACK');
}

// Utility function to run migrations
export async function runMigrations(migrationSql: string): Promise<boolean> {
    try {
        const statements = migrationSql
            .split(';')
            .map((s) => s.trim())
            .filter((s) => s.length > 0 && !s.startsWith('--'));

        for (const statement of statements) {
            await execute(statement);
        }

        return true;
    } catch (error) {
        console.error('Migration error:', error);
        return false;
    }
}
