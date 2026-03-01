import { NextResponse } from 'next/server';
import { handleWebhook } from '@/lib/subscription/services';

export async function POST(req: Request) {
  const signature = (req.headers.get('stripe-signature') as string) || undefined;
  const body = await req.text();
  try {
    await handleWebhook(body, signature);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'error' }, { status: 500 });
  }
}
