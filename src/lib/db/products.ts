import { getDb } from '@/lib/db';
import { v4 as uuid } from 'uuid';
import type { Product } from '@/types';

export function getAllProducts(market?: string): Product[] {
  const db = getDb();
  if (market) {
    return db.prepare('SELECT * FROM products WHERE market = ? ORDER BY created_at DESC').all(market) as Product[];
  }
  return db.prepare('SELECT * FROM products ORDER BY created_at DESC').all() as Product[];
}

export function getProductById(id: string): Product | undefined {
  const db = getDb();
  return db.prepare('SELECT * FROM products WHERE id = ?').get(id) as Product | undefined;
}

export function createProduct(data: { name: string; market: string; kb_content: string }): string {
  const db = getDb();
  const id = uuid();
  db.prepare('INSERT INTO products (id, name, market, kb_content) VALUES (?, ?, ?, ?)').run(id, data.name, data.market, data.kb_content);
  return id;
}

export function updateProduct(id: string, data: { name?: string; market?: string; kb_content?: string }): void {
  const db = getDb();
  const fields: string[] = [];
  const values: (string | undefined)[] = [];
  if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
  if (data.market !== undefined) { fields.push('market = ?'); values.push(data.market); }
  if (data.kb_content !== undefined) { fields.push('kb_content = ?'); values.push(data.kb_content); }
  fields.push("updated_at = datetime('now')");
  values.push(id);
  db.prepare(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`).run(...values);
}

export function deleteProduct(id: string): void {
  const db = getDb();
  db.prepare('DELETE FROM products WHERE id = ?').run(id);
}
