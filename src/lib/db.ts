import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { v4 as uuid } from 'uuid';
import { SEED_PRODUCTS, SEED_SCRIPTS_GT, SEED_SCRIPTS_TDRT } from './db/seed-data';

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    // On Railway, use fixed path to match volume mount /app/data
    const dataDir = process.env.RAILWAY_ENVIRONMENT
      ? '/app/data'
      : path.join(process.cwd(), 'data');
    // Ensure data directory exists (important for production/Docker)
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const dbPath = path.join(dataDir, 'content-machine.db');
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initSchema(db);
    autoSeed(db);
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

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_scripts_product ON scripts(product_id);
    CREATE INDEX IF NOT EXISTS idx_gen_script ON generations(script_id);
    CREATE INDEX IF NOT EXISTS idx_gen_fingerprint ON generations(fingerprint);
    CREATE INDEX IF NOT EXISTS idx_gen_type ON generations(variation_type);
  `);
}

function autoSeed(db: Database.Database) {
  const { count } = db.prepare('SELECT COUNT(*) as count FROM scripts').get() as { count: number };
  if (count > 0) return; // Already has data

  console.log('[DB] No scripts found, seeding initial data...');

  // Clear orphan products
  db.prepare('DELETE FROM products').run();

  const insertProduct = db.prepare('INSERT INTO products (id, name, market, kb_content) VALUES (?, ?, ?, ?)');
  const insertScript = db.prepare('INSERT INTO scripts (id, product_id, title, content, performance_notes) VALUES (?, ?, ?, ?, ?)');

  const seed = db.transaction(() => {
    // Product 1: Giao tiếp
    const gtId = uuid();
    insertProduct.run(gtId, SEED_PRODUCTS[0].name, SEED_PRODUCTS[0].market, SEED_PRODUCTS[0].kb_content);
    for (const s of SEED_SCRIPTS_GT) {
      insertScript.run(uuid(), gtId, s.title, s.content, s.performance_notes);
    }
    console.log(`[DB] ✅ ${SEED_PRODUCTS[0].name}: ${SEED_SCRIPTS_GT.length} scripts`);

    // Product 2: Tiền đẻ ra tiền
    const tdrtId = uuid();
    insertProduct.run(tdrtId, SEED_PRODUCTS[1].name, SEED_PRODUCTS[1].market, SEED_PRODUCTS[1].kb_content);
    for (const s of SEED_SCRIPTS_TDRT) {
      insertScript.run(uuid(), tdrtId, s.title, s.content, s.performance_notes);
    }
    console.log(`[DB] ✅ ${SEED_PRODUCTS[1].name}: ${SEED_SCRIPTS_TDRT.length} scripts`);
  });

  seed();
  console.log('[DB] Seed complete');
}
