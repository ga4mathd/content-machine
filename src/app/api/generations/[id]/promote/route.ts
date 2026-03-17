import { NextRequest, NextResponse } from 'next/server';
import { getGenerationById } from '@/lib/db/generations';
import { getScriptById, createScript } from '@/lib/db/scripts';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const generation = getGenerationById(id);
    if (!generation) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy biến thể' }, { status: 404 });
    }

    const originalScript = getScriptById(generation.script_id);
    if (!originalScript) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy kịch bản gốc' }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const title = body.title || `[Win] ${generation.variation_type} — từ ${originalScript.title}`;

    const newScriptId = createScript({
      product_id: originalScript.product_id,
      title,
      content: generation.output_text,
      structure_tags: '[]',
      performance_notes: `Promoted từ biến thể ${generation.id} (${generation.variation_type}) của kịch bản "${originalScript.title}"`,
    });

    return NextResponse.json({ success: true, data: { id: newScriptId } }, { status: 201 });
  } catch (error) {
    console.error('Promote error:', error);
    return NextResponse.json({ success: false, error: 'Lỗi promote biến thể' }, { status: 500 });
  }
}
