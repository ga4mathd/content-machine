import { NextRequest, NextResponse } from 'next/server';
import { getGenerationById, deleteGeneration } from '@/lib/db/generations';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const generation = getGenerationById(id);

    if (!generation) {
      return NextResponse.json(
        { success: false, error: 'Generation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: generation });
  } catch (error) {
    console.error('GET /api/generations/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch generation' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    deleteGeneration(id);
    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    console.error('DELETE /api/generations/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete generation' },
      { status: 500 }
    );
  }
}
