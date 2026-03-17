import Database from 'better-sqlite3';
import path from 'path';

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    const dbPath = path.join(process.cwd(), 'data', 'content-machine.db');
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initSchema(db);
  }
  return db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      market TEXT NOT NULL CHECK(market IN ('VN','KH','LA','PH')),
      kb_content TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS scripts (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      structure_tags TEXT DEFAULT '[]',
      performance_notes TEXT DEFAULT '',
      times_multiplied INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS generations (
      id TEXT PRIMARY KEY,
      script_id TEXT NOT NULL REFERENCES scripts(id) ON DELETE CASCADE,
      variation_type TEXT NOT NULL,
      variation_params TEXT DEFAULT '{}',
      output_text TEXT NOT NULL,
      output_storyboard TEXT DEFAULT '[]',
      fingerprint TEXT NOT NULL,
      similarity_score REAL DEFAULT 0,
      is_favorite INTEGER DEFAULT 0,
      is_winner INTEGER DEFAULT 0,
      created_by TEXT NOT NULL DEFAULT 'team',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_scripts_product ON scripts(product_id);
    CREATE INDEX IF NOT EXISTS idx_gen_script ON generations(script_id);
    CREATE INDEX IF NOT EXISTS idx_gen_fingerprint ON generations(fingerprint);
    CREATE INDEX IF NOT EXISTS idx_gen_type ON generations(variation_type);
  `);
}
