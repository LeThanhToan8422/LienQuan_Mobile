import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { z } from "zod";

const paymentQuerySchema = z.object({
  page: z.string().optional().default("1"),
  pageSize: z.string().optional().default("10"),
  search: z.string().optional(),
  status: z.string().optional(),
  method: z.string().optional(),
  sortBy: z.string().optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

const updatePaymentStatusSchema = z.object({
  status: z.enum(["PENDING", "SUCCESS", "FAILED", "CANCELLED", "REFUNDED"]),
  failureReason: z.string().optional(),
  refundAmount: z.number().optional(),
});

export async function GET(request: Request) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as { role?: string })?.role !== "ADMIN") {
      return NextResponse.json(
        { error: 'Không có quyền truy cập' }, 
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());
    const { page, pageSize, search, status, method, sortBy, sortOrder } = paymentQuerySchema.parse(query);

    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const take = parseInt(pageSize);

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { gatewayTransactionId: { contains: search, mode: 'insensitive' } },
        { order: { orderNumber: { contains: search, mode: 'insensitive' } } },
        { order: { customerName: { contains: search, mode: 'insensitive' } } },
        { order: { customerEmail: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (method && method !== 'ALL') {
      where.method = method;
    }

    // Build orderBy clause
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    // Fetch payments with related data
    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              amount: true,
              status: true,
              customerName: true,
              customerEmail: true,
              createdAt: true,
              account: {
                select: {
                  id: true,
                  rank: true,
                  price: true,
                }
              }
            }
          }
        }
      }),
      prisma.payment.count({ where })
    ]);

    // Calculate statistics
    const stats = await prisma.payment.groupBy({
      by: ['status'],
      _count: { status: true },
      _sum: { amount: true }
    });

    const statusStats = stats.reduce((acc, stat) => {
      acc[stat.status] = {
        count: stat._count.status,
        totalAmount: stat._sum.amount || 0
      };
      return acc;
    }, {} as Record<string, { count: number; totalAmount: number }>);

    // Method statistics
    const methodStats = await prisma.payment.groupBy({
      by: ['method'],
      _count: { method: true },
      _sum: { amount: true }
    });

    const methodStatsMap = methodStats.reduce((acc, stat) => {
      acc[stat.method] = {
        count: stat._count.method,
        totalAmount: stat._sum.amount || 0
      };
      return acc;
    }, {} as Record<string, { count: number; totalAmount: number }>);

    return NextResponse.json({
      payments,
      pagination: {
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        total,
        totalPages: Math.ceil(total / parseInt(pageSize))
      },
      stats: statusStats,
      methodStats: methodStatsMap
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi lấy danh sách thanh toán' }, 
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as { role?: string })?.role !== "ADMIN") {
      return NextResponse.json(
        { error: 'Không có quyền truy cập' }, 
        { status: 403 }
      );
    }

    const body = await request.json();
    const { paymentId, ...updateData } = body;
    
    if (!paymentId) {
      return NextResponse.json(
        { error: 'Thiếu ID thanh toán' }, 
        { status: 400 }
      );
    }

    // Validate update data
    const parseResult = updatePaymentStatusSchema.safeParse(updateData);
    if (!parseResult.success) {
      const errors = parseResult.error.issues
        .map((issue: z.ZodIssue) => issue.message)
        .join(', ');
      return NextResponse.json({ error: errors }, { status: 400 });
    }

    const { status, failureReason, refundAmount } = parseResult.data;

    // Check if payment exists
    const existingPayment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: true }
    });

    if (!existingPayment) {
      return NextResponse.json(
        { error: 'Không tìm thấy thanh toán' }, 
        { status: 404 }
      );
    }

    // Update payment
    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status,
        failureReason: failureReason || existingPayment.failureReason,
        refundAmount: refundAmount || existingPayment.refundAmount,
        updatedAt: new Date(),
        // Set paidAt if status is SUCCESS
        ...(status === 'SUCCESS' && !existingPayment.paidAt ? { paidAt: new Date() } : {}),
        // Set refundedAt if status is REFUNDED
        ...(status === 'REFUNDED' && !existingPayment.refundedAt ? { refundedAt: new Date() } : {})
      },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            amount: true,
            status: true,
            customerName: true,
            customerEmail: true,
            createdAt: true,
            account: {
              select: {
                id: true,
                rank: true,
                price: true,
              }
            }
          }
        }
      }
    });

    // If payment is successful, update order status to PROCESSING
    if (status === 'SUCCESS' && existingPayment.order.status === 'PENDING') {
      await prisma.order.update({
        where: { id: existingPayment.orderId },
        data: { status: 'PROCESSING' }
      });
    }

    return NextResponse.json({
      message: 'Cập nhật thanh toán thành công',
      payment: updatedPayment
    });
  } catch (error) {
    console.error('Error updating payment:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi cập nhật thanh toán' }, 
      { status: 500 }
    );
  }
}
