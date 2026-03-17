import { NextRequest, NextResponse } from 'next/server';
import { getScriptById } from '@/lib/db/scripts';
import { suggestUnusedCombos, getUsedCombos } from '@/lib/anti-dup/freshness-calculator';
import { getVariationType, VARIATION_GROUPS } from '@/lib/ai/variation-types';

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

    const suggestions = suggestUnusedCombos(id, 10);
    const usedCombos = getUsedCombos(id);

    // Enrich suggestions with labels
    const enriched = suggestions.map((combo) => {
      const types = combo.split('+');
      const labels = types.map((typeId) => {
        const vType = getVariationType(typeId);
        return vType ? `${typeId} - ${vType.name_vi}` : typeId;
      });
      const groups = types.map((t) => {
        const groupId = t[0];
        return VARIATION_GROUPS[groupId]?.name_vi || groupId;
      });

      return {
        combo,
        types,
        labels,
        groups: Array.from(new Set(groups)),
        times_used: usedCombos.get(combo) || 0,
      };
    });

    return NextResponse.json({ success: true, data: enriched });
  } catch (error) {
    console.error('Suggestions error:', error);
    return NextResponse.json({ success: false, error: 'Lỗi tải gợi ý' }, { status: 500 });
  }
}
