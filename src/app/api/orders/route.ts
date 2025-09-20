import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { emailService } from '@/lib/email';
import { decryptAccountCredentials } from '@/lib/encryption';

// Type assertions for Prisma models until client is properly generated
const db = prisma as any;

// Validation schemas
const createOrderSchema = z.object({
  accountId: z.string().min(1, 'Account ID is required'),
  customerName: z.string().min(1, 'Customer name is required'),
  customerEmail: z.string().email('Valid email is required'),
  paymentMethod: z.enum(['VNPAY', 'ZALOPAY', 'BANK', 'MOMO']),
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
  // Create order
  const order = await db.order.create({
    data: {
      orderNumber,
      userId,
      accountId,
      amount,
      customerEmail,
      customerName,
      status: 'COMPLETED',
      deliveredAt: new Date(),
    },
  });

  // Update account status
  await db.accountForSale.update({
    where: { id: accountId },
    data: { status: 'sold' },
  });

  // Create payment record
  await db.payment.create({
    data: {
      orderId: order.id,
      amount,
      method: paymentMethod,
      status: 'SUCCESS',
      paidAt: new Date(),
      gatewayTransactionId: `DEMO_${Date.now()}`,
    },
  });

  return order;
}

async function sendAccountEmail(order: any, account: any, customerEmail: string) {
  try {
    // Decrypt account credentials before sending email
    const decryptedCredentials = decryptAccountCredentials({
      gameUsername: account.gameUsername,
      gamePassword: account.gamePassword,
      additionalInfo: account.additionalInfo,
    });

    const emailSent = await emailService.sendAccountDelivery({
      order,
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
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Vui lòng đăng nhập để tiếp tục' }, 
        { status: 401 }
      );
    }

    // Extract user information from session
    const userEmail = (session.user as any).email;
    const userName = (session.user as any).name;
    
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
        .map((issue: any) => issue.message)
        .join(', ');
      return NextResponse.json({ error: errors }, { status: 400 });
    }

    const { accountId, customerName, customerEmail, paymentMethod }: CreateOrderRequest = parseResult.data;

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
    
    // Generate order number
    const orderNumber = await createOrderNumber();

    // Process order creation
    const order = await processOrderCreation({
      orderNumber,
      userId,
      accountId,
      amount: account.price,
      customerEmail,
      customerName,
      paymentMethod,
    });

    // Get complete order information
    const completedOrder = await db.order.findUnique({
      where: { id: order.id },
      include: {
        account: true,
        user: true,
      },
    });

    // Send email notification
    const emailResult = await sendAccountEmail(completedOrder, account, customerEmail);

    // Return response
    const message = emailResult.success 
      ? '🎉 Đơn hàng hoàn thành! Thông tin tài khoản đã được gửi qua email.'
      : 'Đơn hàng hoàn thành nhưng có lỗi khi gửi email. Vui lòng liên hệ hỗ trợ.';

    return NextResponse.json({
      success: true,
      message,
      order: {
        id: completedOrder.id,
        orderNumber: completedOrder.orderNumber,
        amount: completedOrder.amount,
        status: completedOrder.status,
        deliveredAt: completedOrder.deliveredAt,
        customerEmail: completedOrder.customerEmail,
      },
      email: {
        sent: emailResult.success,
        to: customerEmail,
        error: emailResult.error,
      },
      demo: {
        note: 'Đây là chế độ demo - thanh toán đã được bỏ qua',
        paymentSkipped: true,
      },
    });

  } catch (error) {
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
    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;
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

  } catch (error) {
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