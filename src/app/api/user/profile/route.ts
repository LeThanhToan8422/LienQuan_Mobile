import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { decryptAccountCredentials } from "@/lib/encryption";

const updateProfileSchema = z.object({
  name: z.string().min(1, "Tên không được để trống").max(100, "Tên quá dài"),
  email: z.string().email("Email không hợp lệ"),
});

export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Vui lòng đăng nhập để tiếp tục' }, 
        { status: 401 }
      );
    }

    const userId = (session.user as { id?: string })?.id;
    if (!userId) {
      return NextResponse.json(
        { error: 'Không tìm thấy thông tin người dùng' }, 
        { status: 401 }
      );
    }

    // Get user profile with orders
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerifiedAt: true,
        twoFactorEnabled: true,
        createdAt: true,
        updatedAt: true,
        orders: {
          where: {
            status: 'COMPLETED' // Chỉ lấy đơn hàng đã hoàn thành
          },
          include: {
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
                characterSkins: true,
                gameUsername: true,
                gamePassword: true,
                loginMethod: true,
                additionalInfo: true,
                createdAt: true,
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
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Không tìm thấy thông tin người dùng' }, 
        { status: 404 }
      );
    }

    // Decrypt sensitive account information
    const decryptedOrders = user.orders.map(order => ({
      ...order,
      account: {
        ...order.account,
        ...decryptAccountCredentials({
          gameUsername: order.account.gameUsername || undefined,
          gamePassword: order.account.gamePassword || undefined,
          additionalInfo: order.account.additionalInfo || undefined,
        })
      }
    }));

    // Calculate statistics
    const totalOrders = decryptedOrders.length;
    const completedOrders = decryptedOrders.filter(order => order.status === 'COMPLETED').length;
    const totalSpent = decryptedOrders
      .filter(order => order.status === 'COMPLETED')
      .reduce((sum, order) => sum + order.amount, 0);

    const profileData = {
      ...user,
      orders: decryptedOrders,
      statistics: {
        totalOrders,
        completedOrders,
        totalSpent,
        pendingOrders: 0, // Không hiển thị đơn hàng pending
        cancelledOrders: 0, // Không hiển thị đơn hàng đã hủy
      }
    };

    return NextResponse.json(profileData);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi lấy thông tin người dùng' }, 
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Vui lòng đăng nhập để tiếp tục' }, 
        { status: 401 }
      );
    }

    const userId = (session.user as { id?: string })?.id;
    if (!userId) {
      return NextResponse.json(
        { error: 'Không tìm thấy thông tin người dùng' }, 
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const parseResult = updateProfileSchema.safeParse(body);
    
    if (!parseResult.success) {
      const errors = parseResult.error.issues
        .map((issue: z.ZodIssue) => issue.message)
        .join(', ');
      return NextResponse.json({ error: errors }, { status: 400 });
    }

    const { name, email } = parseResult.data;

    // Check if email is already taken by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        email: email,
        id: { not: userId }
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email này đã được sử dụng bởi tài khoản khác' }, 
        { status: 400 }
      );
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        email,
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
      message: 'Cập nhật thông tin thành công',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi cập nhật thông tin' }, 
      { status: 500 }
    );
  }
}