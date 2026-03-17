import { NextRequest, NextResponse } from 'next/server';
import { getScriptById } from '@/lib/db/scripts';
import { getVariationTypeUsage } from '@/lib/db/generations';
import { VARIATION_TYPES } from '@/lib/ai/variation-types';

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

    const usage = getVariationTypeUsage(id);
    const usageMap = new Map(usage.map(u => [u.variation_type, u.count]));

    // Build full matrix with all variation types
    const matrix = VARIATION_TYPES.map((vType) => ({
      type_id: vType.id,
      group: vType.group,
      name_vi: vType.name_vi,
      count: usageMap.get(vType.id) || 0,
    }));

    return NextResponse.json({
      success: true,
      data: {
        matrix,
        total_generations: usage.reduce((sum, u) => sum + u.count, 0),
        unique_types_used: usage.length,
      },
    });
  } catch (error) {
    console.error('Matrix error:', error);
    return NextResponse.json({ success: false, error: 'Lỗi tải matrix' }, { status: 500 });
  }
}
