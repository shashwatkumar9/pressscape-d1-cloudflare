/**
 * Development database configuration
 * This file provides local SQLite database for development when Cloudflare context is not available
 */

// @ts-ignore - Optional dev dependency not needed for production build
import Database from 'better-sqlite3';
import path from 'path';

let localDb: Database.Database | null = null;

/**
 * Initialize local SQLite database for development
 */
export function getLocalDevDatabase(): Database.Database {
  if (!localDb) {
    const dbPath = path.join(process.cwd(), 'local-dev.db');
    console.log('📦 Using local SQLite database for development:', dbPath);
    localDb = new Database(dbPath);

    // Enable foreign keys
    localDb.pragma('foreign_keys = ON');
  }
  return localDb;
}

/**
 * Close the local database connection
 */
export function closeLocalDevDatabase() {
  if (localDb) {
    localDb.close();
    localDb = null;
  }
}

/**
 * Adapter to make better-sqlite3 compatible with D1's interface
 */
export class D1Adapter {
  private db: Database.Database;

  constructor(db: Database.Database) {
    this.db = db;
  }

  prepare(query: string) {
    const stmt = this.db.prepare(query);

    return {
      bind: (...params: unknown[]) => {
        return {
          all: async () => {
            try {
              const results = stmt.all(...params);
              return {
                results: results || [],
                success: true,
                meta: {}
              };
            } catch (error) {
              console.error('Database query error:', error);
              return {
                results: [],
                success: false,
                error: error instanceof Error ? error.message : String(error)
              };
            }
          },
          first: async () => {
            try {
              const result = stmt.get(...params);
              return result || null;
            } catch (error) {
              console.error('Database query error:', error);
              return null;
            }
          },
          run: async () => {
            try {
              const result = stmt.run(...params);
              return {
                success: true,
                meta: {
                  changes: result.changes,
                  last_row_id: result.lastInsertRowid
                }
              };
            } catch (error) {
              console.error('Database query error:', error);
              return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
              };
            }
          }
        };
      }
    };
  }

  async batch(statements: unknown[]) {
    // Simple batch implementation for development
    const results = [];
    for (const stmt of statements) {
      results.push(await (stmt as any).run());
    }
    return results;
  }

  async exec(query: string) {
    try {
      this.db.exec(query);
      return { success: true };
    } catch (error) {
      console.error('Database exec error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
}
