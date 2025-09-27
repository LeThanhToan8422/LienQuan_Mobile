"use client";

import { Card, Row, Col, Typography, Button, Space, Alert, Statistic, Spin } from "antd";
import { ArrowUpOutlined, ArrowDownOutlined, UserOutlined, ShoppingCartOutlined, DollarOutlined, TrophyOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

/**
 * Admin Dashboard Page
 * Main admin interface with navigation to different management sections
 * @returns JSX element
 */
interface DashboardData {
  overview: {
    totalUsers: number;
    totalAccounts: number;
    totalOrders: number;
    totalRevenue: number;
    growthRates: {
      orders: number;
      revenue: number;
      users: number;
    };
  };
  recent: {
    orders: any[];
    users: any[];
  };
  statistics: {
    orders: Record<string, { count: number; totalAmount: number }>;
    payments: Record<string, { count: number; totalAmount: number }>;
    users: Record<string, number>;
    accounts: Record<string, number>;
  };
}

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard');
      const data = await response.json();
      
      if (response.ok) {
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchDashboardData();
    }
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <Card>
          <div className="text-center">
            <Spin size="large" />
            <Typography.Text className="block mt-4">Đang tải...</Typography.Text>
          </div>
        </Card>
      </div>
    );
  }

  if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <Alert
          type="error"
          message="Truy cập bị từ chối"
          description="Bạn không có quyền truy cập vào trang quản trị. Chỉ có admin mới có thể truy cập."
          showIcon
        />
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <Row gutter={[16, 16]}>
        {/* Page Header */}
        <Col xs={24}>
          <Typography.Title level={2} className="!mb-2">
            Admin Dashboard
          </Typography.Title>
          <Typography.Paragraph className="!mb-4" type="secondary">
            Tổng quan hệ thống và quản lý tài khoản bán, đơn hàng, thanh toán.
          </Typography.Paragraph>
          <Alert
            type="success"
            message="Chào mừng Admin!"
            description={`Xin chào ${session.user?.name || session.user?.email}! Bạn đã đăng nhập thành công với quyền admin.`}
            showIcon
            className="mb-4"
          />
        </Col>

        {/* Statistics Overview */}
        {dashboardData && (
          <>
            <Col xs={24}>
              <Typography.Title level={4} className="!mb-4">
                Tổng quan hệ thống
              </Typography.Title>
            </Col>
            
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Tổng người dùng"
                  value={dashboardData.overview.totalUsers}
                  prefix={<UserOutlined />}
                  suffix={
                    <span className={`text-sm ${
                      dashboardData.overview.growthRates.users >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {dashboardData.overview.growthRates.users >= 0 ? (
                        <ArrowUpOutlined />
                      ) : (
                        <ArrowDownOutlined />
                      )}
                      {Math.abs(dashboardData.overview.growthRates.users).toFixed(1)}%
                    </span>
                  }
                />
              </Card>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Tổng đơn hàng"
                  value={dashboardData.overview.totalOrders}
                  prefix={<ShoppingCartOutlined />}
                  suffix={
                    <span className={`text-sm ${
                      dashboardData.overview.growthRates.orders >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {dashboardData.overview.growthRates.orders >= 0 ? (
                        <ArrowUpOutlined />
                      ) : (
                        <ArrowDownOutlined />
                      )}
                      {Math.abs(dashboardData.overview.growthRates.orders).toFixed(1)}%
                    </span>
                  }
                />
              </Card>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Tổng doanh thu"
                  value={dashboardData.overview.totalRevenue}
                  prefix={<DollarOutlined />}
                  formatter={(value) => formatCurrency(Number(value))}
                  suffix={
                    <span className={`text-sm ${
                      dashboardData.overview.growthRates.revenue >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {dashboardData.overview.growthRates.revenue >= 0 ? (
                        <ArrowUpOutlined />
                      ) : (
                        <ArrowDownOutlined />
                      )}
                      {Math.abs(dashboardData.overview.growthRates.revenue).toFixed(1)}%
                    </span>
                  }
                />
              </Card>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Tài khoản có sẵn"
                  value={dashboardData.overview.totalAccounts}
                  prefix={<TrophyOutlined />}
                />
              </Card>
            </Col>
          </>
        )}

        {/* Management Cards */}
        <Col xs={24}>
          <Typography.Title level={4} className="!mb-4">
            Quản lý hệ thống
          </Typography.Title>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Card title="Quản lý tài khoản bán" className="h-full">
            <Space direction="vertical" className="w-full">
              <div className="text-center">
                <Typography.Text type="secondary">
                  Quản lý tài khoản game có sẵn
                </Typography.Text>
              </div>
              <Space className="w-full justify-center">
                <Link href="/admin/accounts">
                  <Button type="primary">Vào danh sách</Button>
                </Link>
                <Link href="/admin/accounts/new">
                  <Button>Thêm mới</Button>
                </Link>
              </Space>
            </Space>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Card title="Quản lý đơn hàng" className="h-full">
            <Space direction="vertical" className="w-full">
              <div className="text-center">
                <Typography.Text type="secondary">
                  Theo dõi và xử lý đơn hàng
                </Typography.Text>
              </div>
              <Space className="w-full justify-center">
                <Link href="/admin/orders">
                  <Button type="primary">Vào danh sách</Button>
                </Link>
              </Space>
            </Space>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Card title="Quản lý thanh toán" className="h-full">
            <Space direction="vertical" className="w-full">
              <div className="text-center">
                <Typography.Text type="secondary">
                  Quản lý giao dịch thanh toán
                </Typography.Text>
              </div>
              <Space className="w-full justify-center">
                <Link href="/admin/payments">
                  <Button type="primary">Vào danh sách</Button>
                </Link>
              </Space>
            </Space>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Card title="Quản lý người dùng" className="h-full">
            <Space direction="vertical" className="w-full">
              <div className="text-center">
                <Typography.Text type="secondary">
                  Quản lý tài khoản người dùng
                </Typography.Text>
              </div>
              <Space className="w-full justify-center">
                <Link href="/admin/users">
                  <Button type="primary">Vào danh sách</Button>
                </Link>
              </Space>
            </Space>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Card title="Cài đặt hệ thống" className="h-full">
            <Space direction="vertical" className="w-full">
              <div className="text-center">
                <Typography.Text type="secondary">
                  Cấu hình và cài đặt hệ thống
                </Typography.Text>
              </div>
              <Space className="w-full justify-center">
                <Button disabled>Sắp ra mắt</Button>
              </Space>
            </Space>
          </Card>
        </Col>

        {/* Recent Activity */}
        {dashboardData && (
          <>
            <Col xs={24}>
              <Typography.Title level={4} className="!mb-4">
                Hoạt động gần đây
              </Typography.Title>
            </Col>

            <Col xs={24} md={12}>
              <Card title="Đơn hàng mới nhất" size="small">
                <div className="space-y-3">
                  {dashboardData.recent.orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium text-sm">{order.orderNumber}</div>
                        <div className="text-xs text-gray-500">{order.customerName}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-green-600">
                          {formatCurrency(order.amount)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDate(order.createdAt)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </Col>

            <Col xs={24} md={12}>
              <Card title="Người dùng mới" size="small">
                <div className="space-y-3">
                  {dashboardData.recent.users.slice(0, 5).map((user) => (
                    <div key={user.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium text-sm">{user.name || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">
                          {formatDate(user.createdAt)}
                        </div>
                        <div className="text-xs">
                          <span className={`px-1 py-0.5 rounded text-xs ${
                            user.role === 'ADMIN' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                          }`}>
                            {user.role === 'ADMIN' ? 'Admin' : 'User'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </Col>
          </>
        )}
      </Row>
    </div>
  );
}
