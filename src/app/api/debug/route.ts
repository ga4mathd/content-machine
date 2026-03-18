import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import path from 'path';
import fs from 'fs';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const railwayEnv = process.env.RAILWAY_ENVIRONMENT || 'not-set';
    const cwd = process.cwd();
    const dataDir = railwayEnv !== 'not-set'
      ? '/app/data'
      : path.join(cwd, 'data');

    const dbPath = path.join(dataDir, 'content-machine.db');
    const dbExists = fs.existsSync(dbPath);

    // Get counts from DB
    const db = getDb();
    const products = (db.prepare('SELECT COUNT(*) as c FROM products').get() as { c: number }).c;
    const scripts = (db.prepare('SELECT COUNT(*) as c FROM scripts').get() as { c: number }).c;
    const generations = (db.prepare('SELECT COUNT(*) as c FROM generations').get() as { c: number }).c;

    return NextResponse.json({
      railway_env: railwayEnv,
      cwd,
      data_dir: dataDir,
      db_path: dbPath,
      db_exists: dbExists,
      db_size: dbExists ? fs.statSync(dbPath).size : 0,
      counts: { products, scripts, generations },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
