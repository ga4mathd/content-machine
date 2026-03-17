import { NextRequest, NextResponse } from 'next/server';
import { getAllScripts, createScript } from '@/lib/db/scripts';
import { getProductById } from '@/lib/db/products';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('product_id') || undefined;
    const scripts = getAllScripts(productId);
    return NextResponse.json({ success: true, data: scripts });
  } catch (error) {
    console.error('GET /api/scripts error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch scripts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { product_id, title, content, structure_tags, performance_notes } = body;

    if (!product_id || !title || !content) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: product_id, title, content' },
        { status: 400 }
      );
    }

    const product = getProductById(product_id);
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    const id = createScript({
      product_id,
      title,
      content,
      structure_tags: structure_tags ? (typeof structure_tags === 'string' ? structure_tags : JSON.stringify(structure_tags)) : undefined,
      performance_notes,
    });

    return NextResponse.json({ success: true, data: { id } }, { status: 201 });
  } catch (error) {
    console.error('POST /api/scripts error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create script' },
      { status: 500 }
    );
  }
}
