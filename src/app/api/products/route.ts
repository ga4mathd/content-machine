import { NextRequest, NextResponse } from 'next/server';
import { getAllProducts, createProduct } from '@/lib/db/products';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const market = searchParams.get('market') || undefined;
    const products = getAllProducts(market);
    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    console.error('GET /api/products error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, market, kb_content } = body;

    if (!name || !market) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, market' },
        { status: 400 }
      );
    }

    const validMarkets = ['VN', 'KH', 'LA', 'PH'];
    if (!validMarkets.includes(market)) {
      return NextResponse.json(
        { success: false, error: `Invalid market. Must be one of: ${validMarkets.join(', ')}` },
        { status: 400 }
      );
    }

    const id = createProduct({ name, market, kb_content: kb_content ?? '' });
    return NextResponse.json({ success: true, data: { id } }, { status: 201 });
  } catch (error) {
    console.error('POST /api/products error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
