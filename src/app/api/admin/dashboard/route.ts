import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

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
    const period = searchParams.get('period') || '30'; // days
    const days = parseInt(period);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get date range for chart data
    const chartStartDate = new Date();
    chartStartDate.setDate(chartStartDate.getDate() - 30); // Last 30 days for chart

    // Overall statistics
    const [
      totalUsers,
      totalAccounts,
      totalOrders,
      totalRevenue,
      recentOrders,
      recentUsers,
      orderStats,
      paymentStats,
      userStats,
      accountStats,
      dailyRevenue,
      dailyOrders,
    ] = await Promise.all([
      // Total counts
      prisma.user.count(),
      prisma.accountForSale.count(),
      prisma.order.count(),
      prisma.order.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true }
      }),

      // Recent data
      prisma.order.findMany({
        where: {
          createdAt: { gte: startDate }
        },
        include: {
          user: { select: { name: true, email: true } },
          account: { select: { rank: true, price: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),

      prisma.user.findMany({
        where: {
          createdAt: { gte: startDate }
        },
        select: { id: true, name: true, email: true, createdAt: true, role: true },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),

      // Order statistics
      prisma.order.groupBy({
        by: ['status'],
        _count: { status: true },
        _sum: { amount: true }
      }),

      // Payment statistics
      prisma.payment.groupBy({
        by: ['status'],
        _count: { status: true },
        _sum: { amount: true }
      }),

      // User statistics
      prisma.user.groupBy({
        by: ['role'],
        _count: { role: true }
      }),

      // Account statistics
      prisma.accountForSale.groupBy({
        by: ['status'],
        _count: { status: true }
      }),

      // Daily revenue (last 30 days)
      prisma.$queryRaw`
        SELECT 
          DATE("createdAt") as date,
          SUM(amount) as revenue
        FROM "Order" 
        WHERE status = 'COMPLETED' 
          AND "createdAt" >= ${chartStartDate}
        GROUP BY DATE("createdAt")
        ORDER BY date ASC
      `,

      // Daily orders (last 30 days)
      prisma.$queryRaw`
        SELECT 
          DATE("createdAt") as date,
          COUNT(*) as orders
        FROM "Order" 
        WHERE "createdAt" >= ${chartStartDate}
        GROUP BY DATE("createdAt")
        ORDER BY date ASC
      `,
    ]);

    // Process statistics
    const orderStatsMap = orderStats.reduce((acc, stat) => {
      acc[stat.status] = {
        count: stat._count.status,
        totalAmount: stat._sum.amount || 0
      };
      return acc;
    }, {} as Record<string, { count: number; totalAmount: number }>);

    const paymentStatsMap = paymentStats.reduce((acc, stat) => {
      acc[stat.status] = {
        count: stat._count.status,
        totalAmount: stat._sum.amount || 0
      };
      return acc;
    }, {} as Record<string, { count: number; totalAmount: number }>);

    const userStatsMap = userStats.reduce((acc, stat) => {
      acc[stat.role] = stat._count.role;
      return acc;
    }, {} as Record<string, number>);

    const accountStatsMap = accountStats.reduce((acc, stat) => {
      acc[stat.status] = stat._count.status;
      return acc;
    }, {} as Record<string, number>);

    // Calculate growth rates
    const previousPeriodStart = new Date();
    previousPeriodStart.setDate(previousPeriodStart.getDate() - (days * 2));
    const previousPeriodEnd = new Date();
    previousPeriodEnd.setDate(previousPeriodEnd.getDate() - days);

    const [
      previousOrders,
      previousRevenue,
      previousUsers,
    ] = await Promise.all([
      prisma.order.count({
        where: {
          createdAt: {
            gte: previousPeriodStart,
            lt: previousPeriodEnd
          }
        }
      }),
      prisma.order.aggregate({
        where: {
          status: 'COMPLETED',
          createdAt: {
            gte: previousPeriodStart,
            lt: previousPeriodEnd
          }
        },
        _sum: { amount: true }
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: previousPeriodStart,
            lt: previousPeriodEnd
          }
        }
      }),
    ]);

    const currentOrders = await prisma.order.count({
      where: { createdAt: { gte: startDate } }
    });

    const currentRevenue = await prisma.order.aggregate({
      where: {
        status: 'COMPLETED',
        createdAt: { gte: startDate }
      },
      _sum: { amount: true }
    });

    const currentUsers = await prisma.user.count({
      where: { createdAt: { gte: startDate } }
    });

    const calculateGrowthRate = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    const growthRates = {
      orders: calculateGrowthRate(currentOrders, previousOrders),
      revenue: calculateGrowthRate(
        currentRevenue._sum.amount || 0,
        previousRevenue._sum.amount || 0
      ),
      users: calculateGrowthRate(currentUsers, previousUsers),
    };

    return NextResponse.json({
      overview: {
        totalUsers: Number(totalUsers),
        totalAccounts: Number(totalAccounts),
        totalOrders: Number(totalOrders),
        totalRevenue: Number(totalRevenue._sum.amount || 0),
        growthRates,
      },
      recent: {
        orders: recentOrders,
        users: recentUsers,
      },
      statistics: {
        orders: orderStatsMap,
        payments: paymentStatsMap,
        users: userStatsMap,
        accounts: accountStatsMap,
      },
      charts: {
        dailyRevenue: Array.isArray(dailyRevenue) ? dailyRevenue.map((item: any) => ({
          date: item.date,
          revenue: Number(item.revenue || 0)
        })) : [],
        dailyOrders: Array.isArray(dailyOrders) ? dailyOrders.map((item: any) => ({
          date: item.date,
          orders: Number(item.orders || 0)
        })) : [],
      },
      period: days,
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi lấy dữ liệu dashboard' }, 
      { status: 500 }
    );
  }
}
