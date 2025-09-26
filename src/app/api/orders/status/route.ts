import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

const db = prisma as unknown as {
  order: {
    findFirst: (args: { where: Record<string, unknown>; orderBy?: Record<string, unknown> }) => Promise<{ id: string; orderNumber: string; userId: string; accountId: string; amount: number; status: string } | null>;
  };
};

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const userId = (session.user as { id?: string })?.id;
    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get('orderNumber');
    const accountId = searchParams.get('accountId');

    if (!orderNumber && !accountId) {
      return NextResponse.json({ success: false, error: 'Missing orderNumber or accountId' }, { status: 400 });
    }

    const where: Record<string, unknown> = { userId };
    if (orderNumber) where.orderNumber = orderNumber;
    if (accountId) where.accountId = accountId;

    const order = await db.order.findFirst({ where, orderBy: { createdAt: 'desc' } as any });
    if (!order) {
      return NextResponse.json({ success: true, found: false });
    }
    return NextResponse.json({ success: true, found: true, status: order.status, orderNumber: order.orderNumber, amount: order.amount });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to fetch status' }, { status: 500 });
  }
}


