import { NextRequest, NextResponse } from 'next/server';
import { getScriptById } from '@/lib/db/scripts';
import { calculateFreshnessScore } from '@/lib/anti-dup/freshness-calculator';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const script = getScriptById(id);
    if (!script) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy kịch bản' }, { status: 404 });
    }

    const freshness = calculateFreshnessScore(id);

    return NextResponse.json({
      success: true,
      data: {
        script_id: id,
        freshness_score: freshness,
        times_multiplied: script.times_multiplied,
      },
    });
  } catch (error) {
    console.error('Freshness error:', error);
    return NextResponse.json({ success: false, error: 'Lỗi tính freshness' }, { status: 500 });
  }
}
