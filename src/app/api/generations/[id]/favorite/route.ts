import { NextRequest, NextResponse } from 'next/server';
import { getGenerationById, toggleFavorite } from '@/lib/db/generations';

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = getGenerationById(id);

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Generation not found' },
        { status: 404 }
      );
    }

    toggleFavorite(id);
    const updated = getGenerationById(id);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('PATCH /api/generations/[id]/favorite error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to toggle favorite' },
      { status: 500 }
    );
  }
}
