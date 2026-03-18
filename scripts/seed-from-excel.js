/**
 * Seed script: Import 2 products + 20 scripts from Content-Machine-Template.xlsx
 * Run: node scripts/seed-from-excel.js
 */

const Database = require('better-sqlite3');
const XLSX = require('xlsx');
const { v4: uuid } = require('uuid');
const path = require('path');
const fs = require('fs');

const EXCEL_PATH = path.join(__dirname, '..', 'Content-Machine-Template.xlsx');
const DB_PATH = path.join(__dirname, '..', 'data', 'content-machine.db');

// Ensure data dir exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Init schema (same as app)
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

// Read Excel
const wb = XLSX.readFile(EXCEL_PATH);

// --- Extract KB from product sheet ---
function extractKB(sheetName) {
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { defval: '' });
  const lines = [];
  for (const row of rows) {
    const field = String(row['TRƯỜNG THÔNG TIN'] || '').trim();
    const value = String(row['TEAM ĐIỀN THÔNG TIN THẬT'] || '').trim();
    if (field && value) {
      lines.push(field + ': ' + value);
    }
  }
  return lines.join('\n\n');
}

// --- Extract scripts ---
function extractScripts(sheetName) {
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { defval: '' });
  return rows
    .filter(r => String(r['KỊCH BẢN'] || '').trim())
    .map(r => {
      const code = String(r['Mã KB'] || '').trim();
      const content = String(r['KỊCH BẢN'] || '').trim();
      const platform = String(r['Platform'] || '').trim();
      const views = String(r['Views'] || '').trim();
      const likes = String(r['Likes'] || '').trim();
      const comments = String(r['Comments'] || '').trim();
      const conversion = String(r['Conversion'] || '').trim();
      const notes = String(r['Ghi chú đặc biệt'] || '').trim();

      // Build performance notes
      const perfParts = [];
      if (platform) perfParts.push('Platform: ' + platform);
      if (views) perfParts.push('Views: ' + views);
      if (likes) perfParts.push('Likes: ' + likes);
      if (comments) perfParts.push('Comments: ' + comments);
      if (conversion) perfParts.push('Conversion: ' + conversion);
      if (notes) perfParts.push('Ghi chú: ' + notes);

      return {
        title: code ? `[${code}] ${content.substring(0, 60).replace(/\n/g, ' ')}...` : content.substring(0, 60).replace(/\n/g, ' ') + '...',
        content,
        performance_notes: perfParts.join(' | '),
      };
    });
}

// --- Seed ---
const insertProduct = db.prepare('INSERT INTO products (id, name, market, kb_content) VALUES (?, ?, ?, ?)');
const insertScript = db.prepare('INSERT INTO scripts (id, product_id, title, content, performance_notes) VALUES (?, ?, ?, ?, ?)');

// Check if products already exist
const existingProducts = db.prepare('SELECT COUNT(*) as count FROM products').get();
if (existingProducts.count > 0) {
  console.log(`⚠️  Database already has ${existingProducts.count} products. Skipping seed to avoid duplicates.`);
  console.log('   To re-seed, delete data/content-machine.db first.');
  process.exit(0);
}

const seed = db.transaction(() => {
  // Product 1: Giao tiếp
  const gtId = uuid();
  const gtKB = extractKB('Sản phẩm Giao tiếp');
  insertProduct.run(gtId, 'Sách Biến Giao Tiếp Thành Thế Mạnh', 'KH', gtKB);
  console.log('✅ Product: Sách Biến Giao Tiếp Thành Thế Mạnh (KH)');

  const gtScripts = extractScripts('Kịch bản GT');
  for (const s of gtScripts) {
    insertScript.run(uuid(), gtId, s.title, s.content, s.performance_notes);
  }
  console.log(`   → ${gtScripts.length} kịch bản imported`);

  // Product 2: Tiền đẻ ra tiền
  const tdrtId = uuid();
  const tdrtKB = extractKB('Sản phẩm Tiền đẻ ra tiền');
  insertProduct.run(tdrtId, 'Sách Tiền Đẻ Ra Tiền', 'KH', tdrtKB);
  console.log('✅ Product: Sách Tiền Đẻ Ra Tiền (KH)');

  const tdrtScripts = extractScripts('Kịch bản TDRT');
  for (const s of tdrtScripts) {
    insertScript.run(uuid(), tdrtId, s.title, s.content, s.performance_notes);
  }
  console.log(`   → ${tdrtScripts.length} kịch bản imported`);
});

seed();

// Verify
const stats = {
  products: db.prepare('SELECT COUNT(*) as c FROM products').get().c,
  scripts: db.prepare('SELECT COUNT(*) as c FROM scripts').get().c,
};
console.log(`\n🎉 Seed complete: ${stats.products} products, ${stats.scripts} scripts`);

db.close();
