import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { z } from "zod";

const orderQuerySchema = z.object({
  page: z.string().optional().default("1"),
  pageSize: z.string().optional().default("10"),
  search: z.string().optional(),
  status: z.string().optional(),
  sortBy: z.string().optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

const updateOrderStatusSchema = z.object({
  status: z.enum(["PENDING", "PROCESSING", "COMPLETED", "CANCELLED", "REFUNDED"]),
  notes: z.string().optional(),
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
    const { page, pageSize, search, status, sortBy, sortOrder } = orderQuerySchema.parse(query);

    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const take = parseInt(pageSize);

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } },
        { account: { rank: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (status && status !== 'ALL') {
      where.status = status;
    }

    // Build orderBy clause
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    // Fetch orders with related data
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            }
          },
          account: {
            select: {
              id: true,
              rank: true,
              price: true,
              heroesCount: true,
              skinsCount: true,
              description: true,
              images: true,
              level: true,
              matches: true,
              winRate: true,
              reputation: true,
            }
          },
          payments: {
            select: {
              id: true,
              amount: true,
              method: true,
              status: true,
              paidAt: true,
              createdAt: true,
            }
          }
        }
      }),
      prisma.order.count({ where })
    ]);

    // Calculate statistics
    const stats = await prisma.order.groupBy({
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

    return NextResponse.json({
      orders,
      pagination: {
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        total,
        totalPages: Math.ceil(total / parseInt(pageSize))
      },
      stats: statusStats
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi lấy danh sách đơn hàng' }, 
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
    const { orderId, ...updateData } = body;
    
    if (!orderId) {
      return NextResponse.json(
        { error: 'Thiếu ID đơn hàng' }, 
        { status: 400 }
      );
    }

    // Validate update data
    const parseResult = updateOrderStatusSchema.safeParse(updateData);
    if (!parseResult.success) {
      const errors = parseResult.error.issues
        .map((issue: z.ZodIssue) => issue.message)
        .join(', ');
      return NextResponse.json({ error: errors }, { status: 400 });
    }

    const { status, notes } = parseResult.data;

    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { account: true }
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Không tìm thấy đơn hàng' }, 
        { status: 404 }
      );
    }

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        notes: notes || existingOrder.notes,
        updatedAt: new Date(),
        // Set deliveredAt if status is COMPLETED
        ...(status === 'COMPLETED' && !existingOrder.deliveredAt ? { deliveredAt: new Date() } : {})
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        account: {
          select: {
            id: true,
            rank: true,
            price: true,
            heroesCount: true,
            skinsCount: true,
            description: true,
            images: true,
            level: true,
            matches: true,
            winRate: true,
            reputation: true,
          }
        },
        payments: {
          select: {
            id: true,
            amount: true,
            method: true,
            status: true,
            paidAt: true,
            createdAt: true,
          }
        }
      }
    });

    // If order is completed, update account status to sold
    if (status === 'COMPLETED') {
      await prisma.accountForSale.update({
        where: { id: existingOrder.accountId },
        data: { status: 'sold' }
      });
    }

    return NextResponse.json({
      message: 'Cập nhật đơn hàng thành công',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi cập nhật đơn hàng' }, 
      { status: 500 }
    );
  }
}
