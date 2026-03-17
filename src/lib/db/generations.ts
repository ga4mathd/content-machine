import { getDb } from '@/lib/db';
import { v4 as uuid } from 'uuid';
import type { Generation } from '@/types';

export function getGenerationsByScript(scriptId: string, limit?: number): Generation[] {
  const db = getDb();
  if (limit) {
    return db.prepare('SELECT * FROM generations WHERE script_id = ? ORDER BY created_at DESC LIMIT ?').all(scriptId, limit) as Generation[];
  }
  return db.prepare('SELECT * FROM generations WHERE script_id = ? ORDER BY created_at DESC').all(scriptId) as Generation[];
}

export function getGenerationById(id: string): Generation | undefined {
  const db = getDb();
  return db.prepare('SELECT * FROM generations WHERE id = ?').get(id) as Generation | undefined;
}

export function createGeneration(data: {
  script_id: string;
  variation_type: string;
  variation_params: string;
  output_text: string;
  output_storyboard: string;
  fingerprint: string;
  similarity_score?: number;
  created_by?: string;
}): string {
  const db = getDb();
  const id = uuid();
  db.prepare(
    'INSERT INTO generations (id, script_id, variation_type, variation_params, output_text, output_storyboard, fingerprint, similarity_score, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(
    id,
    data.script_id,
    data.variation_type,
    data.variation_params,
    data.output_text,
    data.output_storyboard,
    data.fingerprint,
    data.similarity_score ?? 0,
    data.created_by ?? 'team'
  );
  return id;
}

export function deleteGeneration(id: string): void {
  const db = getDb();
  db.prepare('DELETE FROM generations WHERE id = ?').run(id);
}

export function toggleFavorite(id: string): void {
  const db = getDb();
  db.prepare('UPDATE generations SET is_favorite = CASE WHEN is_favorite = 1 THEN 0 ELSE 1 END WHERE id = ?').run(id);
}

export function toggleWinner(id: string): void {
  const db = getDb();
  db.prepare('UPDATE generations SET is_winner = CASE WHEN is_winner = 1 THEN 0 ELSE 1 END WHERE id = ?').run(id);
}

export function getRecentFingerprints(scriptId: string, limit?: number): string[] {
  const db = getDb();
  const effectiveLimit = limit ?? 50;
  const rows = db.prepare('SELECT fingerprint FROM generations WHERE script_id = ? ORDER BY created_at DESC LIMIT ?').all(scriptId, effectiveLimit) as { fingerprint: string }[];
  return rows.map(r => r.fingerprint);
}

export function getVariationTypeUsage(scriptId: string): { variation_type: string; count: number }[] {
  const db = getDb();
  return db.prepare(
    'SELECT variation_type, COUNT(*) as count FROM generations WHERE script_id = ? GROUP BY variation_type ORDER BY count DESC'
  ).all(scriptId) as { variation_type: string; count: number }[];
}
