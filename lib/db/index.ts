// ==============================================================================
// CINDERPRESS DATABASE CLIENT (CLOUDFLARE D1 + LOCAL SQLITE DRIVER)
// ==============================================================================

import path from 'path';
import fs from 'fs';

// Global reference for Node local SQLite instance
let localDbInstance: any = null;

function getLocalDb() {
  if (localDbInstance) return localDbInstance;

  // Dynamically import node:sqlite (available in Node 22+)
  const { DatabaseSync } = require('node:sqlite');
  
  const dbDir = path.resolve(process.cwd(), 'db');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const dbPath = path.join(dbDir, 'cinderpress.sqlite');
  const db = new DatabaseSync(dbPath);

  // Enable WAL mode and foreign keys for high performance and integrity
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;');

  // Check if schema exists, otherwise initialize migrations
  try {
    const tableCheck = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='posts';"
    ).get();

    if (!tableCheck) {
      console.log('[CinderPress DB] Initializing D1 migrations...');
      const migDir = path.resolve(process.cwd(), 'migrations');
      const mig0001 = path.join(migDir, '0001_cinderpress_schema.sql');
      const mig0002 = path.join(migDir, '0002_cinderpress_seed.sql');

      if (fs.existsSync(mig0001)) {
        db.exec(fs.readFileSync(mig0001, 'utf-8'));
      }
      if (fs.existsSync(mig0002)) {
        db.exec(fs.readFileSync(mig0002, 'utf-8'));
      }
      console.log('[CinderPress DB] Database schema and initial seed created.');
    }
  } catch (err) {
    console.error('[CinderPress DB] Migration error:', err);
  }

  localDbInstance = db;
  return localDbInstance;
}

// Unified interface
export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  // 1. Check for Cloudflare D1 binding
  const cfDb = (globalThis as any).__D1_DB__ || (globalThis as any).env?.DB;
  if (cfDb && typeof cfDb.prepare === 'function') {
    const stmt = cfDb.prepare(sql).bind(...params);
    const result = await stmt.all();
    return (result.results || []) as T[];
  }

  // 2. Fall back to local SQLite engine
  const localDb = getLocalDb();
  const stmt = localDb.prepare(sql);
  const rows = stmt.all(...params);
  return rows as T[];
}

export async function queryOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
  const cfDb = (globalThis as any).__D1_DB__ || (globalThis as any).env?.DB;
  if (cfDb && typeof cfDb.prepare === 'function') {
    const stmt = cfDb.prepare(sql).bind(...params);
    const row = await stmt.first();
    return (row as T) || null;
  }

  const localDb = getLocalDb();
  const stmt = localDb.prepare(sql);
  const row = stmt.get(...params);
  return (row as T) || null;
}

export async function execute(sql: string, params: any[] = []): Promise<{ changes: number; lastInsertRowid?: number | bigint }> {
  const cfDb = (globalThis as any).__D1_DB__ || (globalThis as any).env?.DB;
  if (cfDb && typeof cfDb.prepare === 'function') {
    const stmt = cfDb.prepare(sql).bind(...params);
    const res = await stmt.run();
    return {
      changes: res.meta?.changes ?? 1,
      lastInsertRowid: res.meta?.last_row_id,
    };
  }

  const localDb = getLocalDb();
  const stmt = localDb.prepare(sql);
  const result = stmt.run(...params);
  return {
    changes: result.changes,
    lastInsertRowid: result.lastInsertRowid,
  };
}

export async function batch(statements: Array<{ sql: string; params?: any[] }>): Promise<any[]> {
  const cfDb = (globalThis as any).__D1_DB__ || (globalThis as any).env?.DB;
  if (cfDb && typeof cfDb.batch === 'function') {
    const prepared = statements.map(s => cfDb.prepare(s.sql).bind(...(s.params || [])));
    return await cfDb.batch(prepared);
  }

  const localDb = getLocalDb();
  const results = [];
  localDb.exec('BEGIN TRANSACTION;');
  try {
    for (const s of statements) {
      const stmt = localDb.prepare(s.sql);
      results.push(stmt.run(...(s.params || [])));
    }
    localDb.exec('COMMIT;');
  } catch (err) {
    localDb.exec('ROLLBACK;');
    throw err;
  }
  return results;
}

export function getCinderDb() {
  const cfDb = (globalThis as any).__D1_DB__ || (globalThis as any).env?.DB;
  if (cfDb && typeof cfDb.prepare === 'function') {
    return cfDb;
  }

  const localDb = getLocalDb();
  return {
    prepare(sql: string) {
      const binding = {
        _params: [] as any[],
        bind(...args: any[]) {
          this._params = args;
          return this;
        },
        async first<T = any>(colName?: string): Promise<T | null> {
          const row = localDb.prepare(sql).get(...this._params) as any;
          if (!row) return null;
          if (colName) return row[colName];
          return row as T;
        },
        async all<T = any>(): Promise<{ results: T[]; success: boolean }> {
          const rows = localDb.prepare(sql).all(...this._params) as T[];
          return { results: rows, success: true };
        },
        async run(): Promise<{ success: boolean; meta: any }> {
          const res = localDb.prepare(sql).run(...this._params);
          return { success: true, meta: { changes: res.changes, last_row_id: res.lastInsertRowid } };
        }
      };
      return binding;
    },
    async batch(stmts: any[]) {
      const results = [];
      for (const s of stmts) {
        results.push(await s.run());
      }
      return results;
    },
    async exec(sql: string) {
      localDb.exec(sql);
      return { count: 0, duration: 0 };
    }
  };
}

export * from './types';
