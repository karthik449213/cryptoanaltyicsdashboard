import { NextResponse } from 'next/server';
import { prisma } from '@/lib/subscription/prisma';

export async function GET(req: Request) {
  try {
    const plans = await prisma.plan.findMany({ where: { isActive: true } });
    return NextResponse.json(plans);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, price, interval, features } = body;
    
    if (!name || !price || !interval) {
      return NextResponse.json({ error: 'name, price, and interval are required' }, { status: 400 });
    }

    const plan = await prisma.plan.create({
      data: {
        name,
        price,
        interval,
        features: features || [],
      },
    });

    return NextResponse.json(plan, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'error' }, { status: 500 });
  }
}
