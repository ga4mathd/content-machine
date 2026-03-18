import { NextRequest, NextResponse } from 'next/server';
import { getSetting, setSetting } from '@/lib/db/settings';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const aiModel = getSetting('ai_model', 'claude');
    return NextResponse.json({
      success: true,
      data: {
        ai_model: aiModel,
        has_claude_key: !!(process.env.CLAUDE_API_KEY),
        has_gemini_key: !!(process.env.GEMINI_API_KEY),
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Lỗi không xác định';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { ai_model } = body;

    if (ai_model && (ai_model === 'claude' || ai_model === 'gemini')) {
      setSetting('ai_model', ai_model);
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Lỗi không xác định';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
