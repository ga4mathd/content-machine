import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getDb();

    const totalProducts = (db.prepare('SELECT COUNT(*) as count FROM products').get() as { count: number }).count;
    const totalScripts = (db.prepare('SELECT COUNT(*) as count FROM scripts').get() as { count: number }).count;
    const totalGenerations = (db.prepare('SELECT COUNT(*) as count FROM generations').get() as { count: number }).count;
    const totalFavorites = (db.prepare('SELECT COUNT(*) as count FROM generations WHERE is_favorite = 1').get() as { count: number }).count;
    const totalWinners = (db.prepare('SELECT COUNT(*) as count FROM generations WHERE is_winner = 1').get() as { count: number }).count;

    // Top variation types
    const topTypes = db.prepare(`
      SELECT variation_type, COUNT(*) as count
      FROM generations
      GROUP BY variation_type
      ORDER BY count DESC
      LIMIT 10
    `).all();

    // Recent generations
    const recentGenerations = db.prepare(`
      SELECT g.id, g.variation_type, g.created_at, g.created_by, s.title as script_title
      FROM generations g
      JOIN scripts s ON g.script_id = s.id
      ORDER BY g.created_at DESC
      LIMIT 10
    `).all();

    // Scripts with low freshness (most multiplied)
    const overusedScripts = db.prepare(`
      SELECT s.id, s.title, s.times_multiplied, p.name as product_name
      FROM scripts s
      JOIN products p ON s.product_id = p.id
      ORDER BY s.times_multiplied DESC
      LIMIT 5
    `).all();

    return NextResponse.json({
      success: true,
      data: {
        total_products: totalProducts,
        total_scripts: totalScripts,
        total_generations: totalGenerations,
        total_favorites: totalFavorites,
        total_winners: totalWinners,
        top_types: topTypes,
        recent_generations: recentGenerations,
        overused_scripts: overusedScripts,
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ success: false, error: 'Lỗi tải thống kê' }, { status: 500 });
  }
}
