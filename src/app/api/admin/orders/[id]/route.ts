import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { decryptAccountCredentials } from "@/lib/encryption";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as { role?: string })?.role !== "ADMIN") {
      return NextResponse.json(
        { error: 'Không có quyền truy cập' }, 
        { status: 403 }
      );
    }

    const { id } = await context.params;

    // Fetch order with all related data
    const order = await prisma.order.findUnique({
      where: { id: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
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
            characterSkins: true,
            gameUsername: true,
            gamePassword: true,
            loginMethod: true,
            additionalInfo: true,
            status: true,
            createdAt: true,
          }
        },
        payments: {
          select: {
            id: true,
            amount: true,
            method: true,
            status: true,
            gatewayTransactionId: true,
            paidAt: true,
            failureReason: true,
            refundedAt: true,
            refundAmount: true,
            createdAt: true,
            updatedAt: true,
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Không tìm thấy đơn hàng' }, 
        { status: 404 }
      );
    }

    // Decrypt sensitive account information
    const decryptedAccount = {
      ...order.account,
      ...decryptAccountCredentials({
        gameUsername: order.account.gameUsername || undefined,
        gamePassword: order.account.gamePassword || undefined,
        additionalInfo: order.account.additionalInfo || undefined,
      })
    };

    const orderWithDecryptedAccount = {
      ...order,
      account: decryptedAccount
    };

    return NextResponse.json(orderWithDecryptedAccount);
  } catch (error) {
    console.error('Error fetching order details:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi lấy chi tiết đơn hàng' }, 
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as { role?: string })?.role !== "ADMIN") {
      return NextResponse.json(
        { error: 'Không có quyền truy cập' }, 
        { status: 403 }
      );
    }

    const { id } = await context.params;

    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id: id },
      include: { account: true }
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Không tìm thấy đơn hàng' }, 
        { status: 404 }
      );
    }

    // Check if order can be deleted (only pending orders)
    if (existingOrder.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Chỉ có thể xóa đơn hàng đang chờ thanh toán' }, 
        { status: 400 }
      );
    }

    // Delete order and related payments
    await prisma.$transaction(async (tx) => {
      // Delete payments first
      await tx.payment.deleteMany({
        where: { orderId: id }
      });

      // Delete order
      await tx.order.delete({
        where: { id: id }
      });

      // Update account status back to available
      await tx.accountForSale.update({
        where: { id: existingOrder.accountId },
        data: { status: 'available' }
      });
    });

    return NextResponse.json({
      message: 'Xóa đơn hàng thành công'
    });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi xóa đơn hàng' }, 
      { status: 500 }
    );
  }
}
