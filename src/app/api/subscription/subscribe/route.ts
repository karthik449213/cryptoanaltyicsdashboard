import { NextResponse } from 'next/server';
import { subscribeUserToPlan } from '@/lib/subscription/services';
import { prisma } from '@/lib/subscription/prisma';

export async function POST(req: Request) {
  const body = await req.json();
  const { userId, planId, trial } = body;
  if (!userId || !planId) return NextResponse.json({ error: 'userId and planId required' }, { status: 400 });

  try {
    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 });

    const res = await subscribeUserToPlan(userId, planId, { trial: !!trial });
    return NextResponse.json({ ok: true, ...(res || {}) });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'error' }, { status: 500 });
  }
}
