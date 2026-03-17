import { NextRequest, NextResponse } from 'next/server';
import { getScriptById, getScriptWithProduct, updateScript, deleteScript } from '@/lib/db/scripts';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const script = getScriptWithProduct(id);

    if (!script) {
      return NextResponse.json(
        { success: false, error: 'Script not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: script });
  } catch (error) {
    console.error('GET /api/scripts/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch script' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = getScriptById(id);

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Script not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { title, content, structure_tags, performance_notes, is_active } = body;

    updateScript(id, {
      title,
      content,
      structure_tags: structure_tags !== undefined
        ? (typeof structure_tags === 'string' ? structure_tags : JSON.stringify(structure_tags))
        : undefined,
      performance_notes,
      is_active,
    });

    const updated = getScriptWithProduct(id);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('PUT /api/scripts/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update script' },
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
    const existing = getScriptById(id);

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Script not found' },
        { status: 404 }
      );
    }

    deleteScript(id);
    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    console.error('DELETE /api/scripts/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete script' },
      { status: 500 }
    );
  }
}
