import { NextRequest, NextResponse } from 'next/server';
import { getGenerationById } from '@/lib/db/generations';
import { getScriptWithProduct } from '@/lib/db/scripts';
import { generateDocxBuffer } from '@/lib/export/docx-generator';
import type { StoryboardScene } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { generation_id } = await req.json();

    if (!generation_id) {
      return NextResponse.json({ success: false, error: 'Thiếu generation_id' }, { status: 400 });
    }

    const generation = getGenerationById(generation_id);
    if (!generation) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy biến thể' }, { status: 404 });
    }

    const scriptWithProduct = getScriptWithProduct(generation.script_id);
    if (!scriptWithProduct) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy kịch bản' }, { status: 404 });
    }

    let storyboard: StoryboardScene[] = [];
    try {
      storyboard = JSON.parse(generation.output_storyboard || '[]');
    } catch {
      storyboard = [];
    }

    const buffer = await generateDocxBuffer({
      productName: scriptWithProduct.product_name,
      variationLabel: generation.variation_type,
      variationType: generation.variation_type,
      variationDescription: '',
      fullScript: generation.output_text,
      storyboard,
      createdAt: generation.created_at,
    });

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="variation-${generation.id.slice(0, 8)}.docx"`,
      },
    });
  } catch (error) {
    console.error('Export DOCX error:', error);
    return NextResponse.json({ success: false, error: 'Lỗi xuất file' }, { status: 500 });
  }
}
