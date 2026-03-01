import { NextResponse } from 'next/server';
import { getSubscriptionStatus } from '@/lib/subscription/services';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const userId = url.searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

  try {
    const status = await getSubscriptionStatus(userId);
    return NextResponse.json(status);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'error' }, { status: 500 });
  }
}
