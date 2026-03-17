import { NextRequest, NextResponse } from 'next/server';
import { getGenerationsByScript } from '@/lib/db/generations';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const scriptId = searchParams.get('script_id');

    if (!scriptId) {
      return NextResponse.json(
        { success: false, error: 'Missing required query parameter: script_id' },
        { status: 400 }
      );
    }

    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;

    const generations = getGenerationsByScript(scriptId, limit);
    return NextResponse.json({ success: true, data: generations });
  } catch (error) {
    console.error('GET /api/generations error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch generations' },
      { status: 500 }
    );
  }
}
