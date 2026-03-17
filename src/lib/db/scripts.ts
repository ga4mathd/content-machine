import { getDb } from '@/lib/db';
import { v4 as uuid } from 'uuid';
import type { Script } from '@/types';

export function getAllScripts(productId?: string): Script[] {
  const db = getDb();
  if (productId) {
    return db.prepare('SELECT * FROM scripts WHERE product_id = ? ORDER BY created_at DESC').all(productId) as Script[];
  }
  return db.prepare('SELECT * FROM scripts ORDER BY created_at DESC').all() as Script[];
}

export function getScriptById(id: string): Script | undefined {
  const db = getDb();
  return db.prepare('SELECT * FROM scripts WHERE id = ?').get(id) as Script | undefined;
}

export function getScriptWithProduct(id: string): (Script & { product_name: string; product_market: string; product_kb: string }) | undefined {
  const db = getDb();
  return db.prepare(`
    SELECT
      s.*,
      p.name AS product_name,
      p.market AS product_market,
      p.kb_content AS product_kb
    FROM scripts s
    JOIN products p ON s.product_id = p.id
    WHERE s.id = ?
  `).get(id) as (Script & { product_name: string; product_market: string; product_kb: string }) | undefined;
}

export function createScript(data: {
  product_id: string;
  title: string;
  content: string;
  structure_tags?: string;
  performance_notes?: string;
}): string {
  const db = getDb();
  const id = uuid();
  db.prepare(
    'INSERT INTO scripts (id, product_id, title, content, structure_tags, performance_notes) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(
    id,
    data.product_id,
    data.title,
    data.content,
    data.structure_tags ?? '[]',
    data.performance_notes ?? ''
  );
  return id;
}

export function updateScript(id: string, data: {
  title?: string;
  content?: string;
  structure_tags?: string;
  performance_notes?: string;
  is_active?: number;
}): void {
  const db = getDb();
  const fields: string[] = [];
  const values: (string | number | undefined)[] = [];
  if (data.title !== undefined) { fields.push('title = ?'); values.push(data.title); }
  if (data.content !== undefined) { fields.push('content = ?'); values.push(data.content); }
  if (data.structure_tags !== undefined) { fields.push('structure_tags = ?'); values.push(data.structure_tags); }
  if (data.performance_notes !== undefined) { fields.push('performance_notes = ?'); values.push(data.performance_notes); }
  if (data.is_active !== undefined) { fields.push('is_active = ?'); values.push(data.is_active); }
  fields.push("updated_at = datetime('now')");
  values.push(id);
  db.prepare(`UPDATE scripts SET ${fields.join(', ')} WHERE id = ?`).run(...values);
}

export function deleteScript(id: string): void {
  const db = getDb();
  db.prepare('DELETE FROM scripts WHERE id = ?').run(id);
}

export function incrementTimesMultiplied(id: string): void {
  const db = getDb();
  db.prepare("UPDATE scripts SET times_multiplied = times_multiplied + 1, updated_at = datetime('now') WHERE id = ?").run(id);
}
