import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { emailService, AccountForSale, User } from '@/lib/email';
import { decryptAccountCredentials } from '@/lib/encryption';

// Type assertions for Prisma models until client is properly generated
const db = prisma as unknown as {
  user: {
    findUnique: (args: { where: { email: string } }) => Promise<User | null>;
    create: (args: { data: Record<string, unknown> }) => Promise<User>;
  };
  order: {
    create: (args: { data: Record<string, unknown> }) => Promise<{ id: string; orderNumber: string; userId: string; accountId: string; amount: number; status: string; customerEmail: string; customerName: string; deliveredAt?: Date | null; createdAt: Date; updatedAt: Date }>;
    findUnique: (args: { where: { id: string }; include: Record<string, unknown> }) => Promise<{ id: string; orderNumber: string; userId: string; accountId: string; amount: number; status: string; customerEmail: string; customerName: string; deliveredAt?: Date | null; createdAt: Date; updatedAt: Date; account: AccountForSale; user: User } | null>;
    findMany: (args: { where: Record<string, unknown>; include: Record<string, unknown>; orderBy: Record<string, string>; skip: number; take: number }) => Promise<Array<{ id: string; orderNumber: string; userId: string; accountId: string; amount: number; status: string; customerEmail: string; customerName: string; deliveredAt?: Date | null; createdAt: Date; updatedAt: Date; account: AccountForSale; payments: Array<{ id: string; method: string; status: string; amount: number; paidAt: Date | null }> }>>;
  };
  accountForSale: {
    findUnique: (args: { where: { id: string } }) => Promise<AccountForSale | null>;
    update: (args: { where: { id: string }; data: Record<string, unknown> }) => Promise<AccountForSale>;
  };
  payment: {
    create: (args: { data: Record<string, unknown> }) => Promise<{ id: string; orderId: string; amount: number; method: string; status: string; paidAt: Date | null; gatewayTransactionId: string | null }>;
  };
};

// Validation schemas
const createOrderSchema = z.object({
  accountId: z.string().min(1, 'Account ID is required'),
  customerName: z.string().min(1, 'Customer name is required'),
  customerEmail: z.string().email('Valid email is required'),
});

type CreateOrderRequest = z.infer<typeof createOrderSchema>;

// Helper functions
async function findOrCreateUser(userEmail: string, userName?: string) {
  const existingUser = await db.user.findUnique({
    where: { email: userEmail }
  });
  
  if (existingUser) {
    return existingUser.id;
  }
  
  // Create temporary user for demo purposes
  const tempUser = await db.user.create({
    data: {
      email: userEmail,
      passwordHash: 'demo-hash-temp',
      name: userName || 'Demo User',
      role: 'USER',
    },
  });
  
  return tempUser.id;
}

async function createOrderNumber(): Promise<string> {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `LQ${timestamp}${random}`;
}

async function processOrderCreation({
  orderNumber,
  userId,
  accountId,
  amount,
  customerEmail,
  customerName,
  paymentMethod
}: {
  orderNumber: string;
  userId: string;
  accountId: string;
  amount: number;
  customerEmail: string;
  customerName: string;
  paymentMethod: string;
}) {
  // Create order in pending state; payment via SePay webhook will complete it
  const order = await db.order.create({
    data: {
      orderNumber,
      userId,
      accountId,
      amount,
      customerEmail,
      customerName,
      status: 'PENDING',
      deliveredAt: null,
    },
  });

  // Create payment record in pending state
  await db.payment.create({
    data: {
      orderId: order.id,
      amount,
      method: paymentMethod,
      status: 'PENDING',
      paidAt: null,
      gatewayTransactionId: null,
    },
  });

  return order;
}

async function sendAccountEmail(order: { id: string; orderNumber: string; userId: string; accountId: string; amount: number; status: string; customerEmail: string; customerName: string; deliveredAt?: Date | null; createdAt: Date; updatedAt: Date; account: AccountForSale; user: User }, account: AccountForSale, customerEmail: string) {
  try {
    // Decrypt account credentials before sending email
    const decryptedCredentials = decryptAccountCredentials({
      gameUsername: account.gameUsername ?? undefined,
      gamePassword: account.gamePassword ?? undefined,
      additionalInfo: account.additionalInfo ?? undefined,
    });

    const emailSent = await emailService.sendAccountDelivery({
      order: {
        ...order,
        deliveryMethod: 'email',
      },
      // Use decrypted credentials for email
      gameUsername: decryptedCredentials.gameUsername || `demo_user_${Date.now()}`,
      gamePassword: decryptedCredentials.gamePassword || 'DemoPassword123!',
      loginMethod: account.loginMethod || 'Facebook',
      additionalInfo: decryptedCredentials.additionalInfo || 
        `Tài khoản demo: Rank ${account.rank}, ${account.heroesCount} tướng, ${account.skinsCount} skin`,
    });
    
    return { success: emailSent, error: null };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
    return { success: false, error: errorMessage };
  }
}

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Vui lòng đăng nhập để tiếp tục' }, 
        { status: 401 }
      );
    }

    // Extract user information from session
    const userEmail = (session.user as { email?: string })?.email;
    const userName = (session.user as { name?: string })?.name;
    
    if (!userEmail) {
      return NextResponse.json(
        { error: 'Không tìm thấy thông tin email người dùng' }, 
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const parseResult = createOrderSchema.safeParse(body);
    
    if (!parseResult.success) {
      const errors = parseResult.error.issues
        .map((issue: z.ZodIssue) => issue.message)
        .join(', ');
      return NextResponse.json({ error: errors }, { status: 400 });
    }

    const { accountId, customerName, customerEmail }: CreateOrderRequest = parseResult.data;

    // Check account availability
    const account = await db.accountForSale.findUnique({
      where: { id: accountId },
    });

    if (!account || account.status !== 'available') {
      return NextResponse.json(
        { error: 'Tài khoản không có sẵn hoặc đã được bán' }, 
        { status: 400 }
      );
    }

    // Find or create user
    const userId = await findOrCreateUser(userEmail, userName);
    
    // Reuse existing pending order (any time) for same user + account if price unchanged
    const existingPending = await db.order.findMany({
      where: {
        userId,
        accountId,
        status: 'PENDING',
      } as unknown as Record<string, unknown>,
      include: {},
      orderBy: { createdAt: 'desc' },
      skip: 0,
      take: 1,
    });
    if (Array.isArray(existingPending) && existingPending.length > 0) {
      const recent = existingPending[0] as unknown as { id: string; orderNumber: string; amount: number; status: string; customerEmail: string };
      if (recent.amount === account.price) {
        const qrUrlReuse = `https://qr.sepay.vn/img?acc=VQRQAELDF3783&bank=MBBank&amount=${recent.amount}&des=${encodeURIComponent(recent.orderNumber)}`;
        return NextResponse.json({
          success: true,
          message: 'Bạn đang có đơn hàng chờ thanh toán cho tài khoản này. Vui lòng quét lại QR.',
          order: {
            id: recent.id,
            orderNumber: recent.orderNumber,
            amount: recent.amount,
            status: recent.status,
            customerEmail: recent.customerEmail,
          },
          sepay: { qrUrl: qrUrlReuse },
        });
      }
      // If price changed, cancel the old pending order before creating a new one
      try {
        await (prisma as any).order.update({ where: { id: (recent as any).id }, data: { status: 'CANCELLED', notes: 'Auto-cancel: price changed' } });
      } catch {}
    }

    // Basic rate-limit: max 3 pending orders within 10 minutes per user
    const pendingRecent = await db.order.findMany({
      where: {
        userId,
        status: 'PENDING',
        createdAt: { gte: new Date(Date.now() - 10 * 60 * 1000) } as unknown as Record<string, unknown>,
      } as unknown as Record<string, unknown>,
      include: {},
      orderBy: { createdAt: 'desc' },
      skip: 0,
      take: 10,
    });
    if (Array.isArray(pendingRecent) && pendingRecent.length >= 3) {
      return NextResponse.json({
        success: false,
        error: 'Bạn đang có quá nhiều đơn hàng đang chờ thanh toán. Vui lòng hoàn tất một đơn trước.',
      }, { status: 429 });
    }

    // Generate new order number
    const orderNumber = await createOrderNumber();

    // Process order creation (default payment method: SePay)
    const order = await processOrderCreation({
      orderNumber,
      userId,
      accountId,
      amount: account.price,
      customerEmail,
      customerName,
      paymentMethod: 'BANK',
    });

    // Get order information
    const pendingOrder = await db.order.findUnique({
      where: { id: order.id },
      include: {
        account: true,
        user: true,
      },
    });

    if (!pendingOrder) {
      return NextResponse.json({ 
        error: 'Không thể tìm thấy đơn hàng sau khi tạo',
        success: false
      }, { status: 500 });
    }

    // Build SePay QR URL
    const qrUrl = `https://qr.sepay.vn/img?acc=VQRQAELDF3783&bank=MBBank&amount=${pendingOrder.amount}&des=${encodeURIComponent(pendingOrder.orderNumber)}`;

    return NextResponse.json({
      success: true,
      message: 'Đơn hàng đã được tạo. Vui lòng quét QR để thanh toán.',
      order: {
        id: pendingOrder.id,
        orderNumber: pendingOrder.orderNumber,
        amount: pendingOrder.amount,
        status: pendingOrder.status,
        customerEmail: pendingOrder.customerEmail,
      },
      sepay: {
        qrUrl,
      },
    });

  } catch (error: unknown) {
    console.error('❌ Order creation error:', error);
    
    return NextResponse.json({ 
      error: 'Không thể tạo đơn hàng',
      details: error instanceof Error ? error.message : 'Lỗi không xác định',
      success: false
    }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' }, 
        { status: 401 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') || '10')));
    const skip = (page - 1) * pageSize;

    // Determine access level
    const userId = (session.user as { id?: string })?.id;
    const userRole = (session.user as { role?: string })?.role;
    const isAdmin = userRole === 'ADMIN';

    // Build query filter
    const whereClause = isAdmin ? {} : { userId };

    // Fetch orders with relations
    const orders = await db.order.findMany({
      where: whereClause,
      include: {
        account: { 
          select: { 
            id: true, 
            rank: true, 
            heroesCount: true, 
            skinsCount: true, 
            price: true 
          } 
        },
        payments: { 
          select: { 
            id: true, 
            method: true, 
            status: true, 
            amount: true, 
            paidAt: true 
          } 
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    });

    return NextResponse.json({ 
      success: true, 
      data: orders,
      pagination: {
        page,
        pageSize,
        total: orders.length
      }
    });

  } catch (error: unknown) {
    console.error('Failed to fetch orders:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch orders',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}