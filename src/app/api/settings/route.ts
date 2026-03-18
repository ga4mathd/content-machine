import { NextRequest, NextResponse } from 'next/server';
import { getSetting, setSetting } from '@/lib/db/settings';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const aiModel = getSetting('ai_model', 'claude');
    // Debug: check actual env var presence
    const claudeKey = process.env.CLAUDE_API_KEY || '';
    const geminiKey = process.env.GEMINI_API_KEY || '';

    return NextResponse.json({
      success: true,
      data: {
        ai_model: aiModel,
        has_claude_key: claudeKey.length > 0,
        has_gemini_key: geminiKey.length > 0,
        debug_claude_len: claudeKey.length,
        debug_gemini_len: geminiKey.length,
        debug_gemini_prefix: geminiKey.substring(0, 5),
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
