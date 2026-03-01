import { NextResponse } from 'next/server';
import { cancelSubscription } from '@/lib/subscription/services';

export async function POST(req: Request) {
  const body = await req.json();
  const { userId } = body;
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

  try {
    await cancelSubscription(userId);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'error' }, { status: 500 });
  }
}
