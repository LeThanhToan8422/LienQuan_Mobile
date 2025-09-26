import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { emailService, AccountForSale, User } from '@/lib/email';
import { decryptAccountCredentials } from '@/lib/encryption';

// Loose types that match our prisma mocks in this project
const db = prisma as unknown as {
  order: {
    findFirst: (args: { where: Record<string, unknown>; include?: Record<string, unknown> }) => Promise<{ id: string; orderNumber: string; userId: string; accountId: string; amount: number; status: string; customerEmail: string; customerName: string } | null>;
    update: (args: { where: { id: string }; data: Record<string, unknown> }) => Promise<unknown>;
    findUnique: (args: { where: { id: string }; include: Record<string, unknown> }) => Promise<{ id: string; orderNumber: string; userId: string; accountId: string; amount: number; status: string; customerEmail: string; customerName: string; account: AccountForSale; user: User } | null>;
  };
  payment: {
    findFirst: (args: { where: Record<string, unknown> }) => Promise<{ id: string } | null>;
    update: (args: { where: { id: string }; data: Record<string, unknown> }) => Promise<unknown>;
  };
  accountForSale: {
    update: (args: { where: { id: string }; data: Record<string, unknown> }) => Promise<unknown>;
  };
};

async function sendAccountEmail(orderWithRelations: { id: string; orderNumber: string; account: AccountForSale; customerEmail: string }) {
  const { account } = orderWithRelations;
  const decrypted = decryptAccountCredentials({
    gameUsername: account.gameUsername ?? undefined,
    gamePassword: account.gamePassword ?? undefined,
    additionalInfo: account.additionalInfo ?? undefined,
  });

  await emailService.sendAccountDelivery({
    order: { id: orderWithRelations.id, orderNumber: orderWithRelations.orderNumber, amount: account.price, status: 'COMPLETED', deliveryMethod: 'email' } as any,
    gameUsername: decrypted.gameUsername || `demo_user_${Date.now()}`,
    gamePassword: decrypted.gamePassword || 'DemoPassword123!',
    loginMethod: account.loginMethod || 'Facebook',
    additionalInfo: decrypted.additionalInfo || '',
  });
}

export async function POST(request: Request) {
  try {
    // Optional API Key verification
    const configuredApiKey = process.env.SEPAY_API_KEY;
    if (configuredApiKey) {
      const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
      const expected = `Apikey ${configuredApiKey}`;
      if (!authHeader || authHeader.trim() !== expected) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
      }
    }

    const body = await request.json();

    // Basic fields from SePay webhook
    const transferAmount: number | undefined = body?.transferAmount;
    const content: string = String(body?.content || '');
    const code: string | null = body?.code ?? null;
    const referenceCode: string | null = body?.referenceCode ?? null;
    const gateway: string | null = body?.gateway ?? null;

    // We embed the order number in QR desc (des=<orderNumber>),
    // banks typically echo it back in transaction content.
    const orderNumberMatch = content.match(/[A-Z]{2,}\d{6,}/) || (code ? [code] : null);
    const candidateKey = orderNumberMatch ? String(orderNumberMatch[0]) : null;

    if (!candidateKey) {
      return NextResponse.json({ success: false, message: 'Không tìm thấy mã đơn hàng trong nội dung' }, { status: 400 });
    }

    const order = await db.order.findFirst({
      where: { orderNumber: candidateKey },
    });

    if (!order) {
      return NextResponse.json({ success: false, message: 'Đơn hàng không tồn tại' }, { status: 404 });
    }

    // Validate transfer direction and amount
    if (String(body?.transferType || '').toLowerCase() !== 'in') {
      return NextResponse.json({ success: false, message: 'Sai loại giao dịch' }, { status: 400 });
    }
    if (typeof transferAmount === 'number' && transferAmount !== order.amount) {
      return NextResponse.json({ success: false, message: 'Số tiền không khớp đơn hàng' }, { status: 400 });
    }

    // Update payment
    const payment = await db.payment.findFirst({ where: { orderId: order.id } });
    // Idempotency: if payment already marked SUCCESS, return success
    if ((payment as unknown as { status?: string })?.status === 'SUCCESS') {
      return NextResponse.json({ success: true }, { status: 200 });
    }
    if (payment) {
      await db.payment.update({
        where: { id: payment.id },
        data: {
          status: 'SUCCESS',
          paidAt: new Date(),
          gatewayTransactionId: referenceCode || null,
          gatewayResponse: body,
        },
      });
    }

    // Mark order completed and lock the account
    await db.order.update({
      where: { id: order.id },
      data: { status: 'COMPLETED', deliveredAt: new Date() },
    });
    await db.accountForSale.update({ where: { id: order.accountId }, data: { status: 'sold' } });

    // Send account info email
    const fullOrder = await db.order.findUnique({ where: { id: order.id }, include: { account: true, user: true } });
    if (fullOrder) {
      await sendAccountEmail({ id: fullOrder.id, orderNumber: fullOrder.orderNumber, account: fullOrder.account, customerEmail: fullOrder.customerEmail });
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('SePay webhook error:', error);
    return NextResponse.json({ success: false, message: 'Webhook processing failed' }, { status: 500 });
  }
}


