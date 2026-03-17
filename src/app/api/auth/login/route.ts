import { NextRequest, NextResponse } from 'next/server';
import { validatePassword, createSessionToken, COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const { password } = await req.json();

  if (!password) {
    return NextResponse.json({ error: 'Vui lòng nhập mật khẩu' }, { status: 400 });
  }

  const role = validatePassword(password);
  if (!role) {
    return NextResponse.json({ error: 'Mật khẩu không đúng' }, { status: 401 });
  }

  const token = createSessionToken(role);
  const response = NextResponse.json({ role });

  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 24 * 60 * 60, // 24 hours
    path: '/',
  });

  return response;
}
