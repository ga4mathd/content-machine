import { createHmac } from 'crypto';
import { cookies } from 'next/headers';
import type { SessionPayload } from '@/types';

const COOKIE_NAME = 'cm-session';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

function getSecret(): string {
  return process.env.AUTH_SECRET || 'default-secret-change-me';
}

function sign(payload: string): string {
  const hmac = createHmac('sha256', getSecret());
  hmac.update(payload);
  return hmac.digest('hex');
}

export function createSessionToken(role: 'admin' | 'team'): string {
  const payload: SessionPayload = {
    role,
    exp: Date.now() + SESSION_DURATION,
  };
  const payloadStr = JSON.stringify(payload);
  const payloadB64 = Buffer.from(payloadStr).toString('base64');
  const signature = sign(payloadB64);
  return `${payloadB64}.${signature}`;
}

export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const [payloadB64, signature] = token.split('.');
    if (!payloadB64 || !signature) return null;

    const expectedSig = sign(payloadB64);
    if (signature !== expectedSig) return null;

    const payloadStr = Buffer.from(payloadB64, 'base64').toString('utf-8');
    const payload: SessionPayload = JSON.parse(payloadStr);

    if (payload.exp < Date.now()) return null;

    return payload;
  } catch {
    return null;
  }
}

export function validatePassword(password: string): 'admin' | 'team' | null {
  if (password === process.env.ADMIN_PASSWORD) return 'admin';
  if (password === process.env.TEAM_PASSWORD) return 'team';
  return null;
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export { COOKIE_NAME };
