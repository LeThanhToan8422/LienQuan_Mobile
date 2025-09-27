import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { z } from "zod";

const userQuerySchema = z.object({
  page: z.string().optional().default("1"),
  pageSize: z.string().optional().default("10"),
  search: z.string().optional(),
  role: z.string().optional(),
  sortBy: z.string().optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

const updateUserSchema = z.object({
  name: z.string().min(1, "Tên không được để trống").max(100, "Tên quá dài"),
  email: z.string().email("Email không hợp lệ"),
  role: z.enum(["USER", "ADMIN"]),
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
    const { page, pageSize, search, role, sortBy, sortOrder } = userQuerySchema.parse(query);

    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const take = parseInt(pageSize);

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role && role !== 'ALL') {
      where.role = role;
    }

    // Build orderBy clause
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    // Fetch users with order statistics
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        orderBy,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          emailVerifiedAt: true,
          twoFactorEnabled: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              orders: true,
            }
          }
        }
      }),
      prisma.user.count({ where })
    ]);

    // Get order statistics for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const orderStats = await prisma.order.groupBy({
          by: ['status'],
          where: { userId: user.id },
          _count: { status: true },
          _sum: { amount: true }
        });

        const stats = orderStats.reduce((acc, stat) => {
          acc[stat.status] = {
            count: stat._count.status,
            totalAmount: stat._sum.amount || 0
          };
          return acc;
        }, {} as Record<string, { count: number; totalAmount: number }>);

        return {
          ...user,
          orderStats: stats
        };
      })
    );

    // Calculate overall statistics
    const overallStats = await prisma.user.groupBy({
      by: ['role'],
      _count: { role: true }
    });

    const roleStats = overallStats.reduce((acc, stat) => {
      acc[stat.role] = stat._count.role;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      users: usersWithStats,
      pagination: {
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        total,
        totalPages: Math.ceil(total / parseInt(pageSize))
      },
      stats: roleStats
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi lấy danh sách người dùng' }, 
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
    const { userId, ...updateData } = body;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Thiếu ID người dùng' }, 
        { status: 400 }
      );
    }

    // Validate update data
    const parseResult = updateUserSchema.safeParse(updateData);
    if (!parseResult.success) {
      const errors = parseResult.error.issues
        .map((issue: z.ZodIssue) => issue.message)
        .join(', ');
      return NextResponse.json({ error: errors }, { status: 400 });
    }

    const { name, email, role } = parseResult.data;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Không tìm thấy người dùng' }, 
        { status: 404 }
      );
    }

    // Check if email is already taken by another user
    const emailExists = await prisma.user.findFirst({
      where: {
        email: email,
        id: { not: userId }
      }
    });

    if (emailExists) {
      return NextResponse.json(
        { error: 'Email này đã được sử dụng bởi tài khoản khác' }, 
        { status: 400 }
      );
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        email,
        role,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerifiedAt: true,
        twoFactorEnabled: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return NextResponse.json({
      message: 'Cập nhật người dùng thành công',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi cập nhật người dùng' }, 
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
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
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Thiếu ID người dùng' }, 
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        orders: true
      }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Không tìm thấy người dùng' }, 
        { status: 404 }
      );
    }

    // Check if user has orders
    if (existingUser.orders.length > 0) {
      return NextResponse.json(
        { error: 'Không thể xóa người dùng đã có đơn hàng' }, 
        { status: 400 }
      );
    }

    // Check if trying to delete self
    if (existingUser.id === (session.user as { id?: string })?.id) {
      return NextResponse.json(
        { error: 'Không thể xóa chính mình' }, 
        { status: 400 }
      );
    }

    // Delete user
    await prisma.user.delete({
      where: { id: userId }
    });

    return NextResponse.json({
      message: 'Xóa người dùng thành công'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi xóa người dùng' }, 
      { status: 500 }
    );
  }
}
