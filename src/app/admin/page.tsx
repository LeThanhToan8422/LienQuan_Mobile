"use client";

import { Card, Row, Col, Typography, Button, Space, Alert } from "antd";
import Link from "next/link";
import { useSession } from "next-auth/react";

/**
 * Admin Dashboard Page
 * Main admin interface with navigation to different management sections
 * @returns JSX element
 */
export default function AdminDashboardPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <Card>
          <div className="text-center">
            <Typography.Text>Đang tải...</Typography.Text>
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

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Row gutter={[16, 16]}>
        {/* Page Header */}
        <Col xs={24}>
          <Typography.Title level={3} className="!mb-2">
            Admin Dashboard
          </Typography.Title>
          <Typography.Paragraph className="!mb-4" type="secondary">
            Quản trị tài khoản bán, đơn hàng, thanh toán.
          </Typography.Paragraph>
          <Alert
            type="success"
            message="Chào mừng Admin!"
            description={`Xin chào ${session.user?.name || session.user?.email}! Bạn đã đăng nhập thành công với quyền admin.`}
            showIcon
            className="mb-4"
          />
        </Col>

        {/* Account Management Card */}
        <Col xs={24} md={12}>
          <Card title="Quản lý tài khoản bán">
            <Space>
              <Link href="/admin/accounts">
                <Button type="primary">Vào danh sách</Button>
              </Link>
              <Link href="/admin/accounts/new">
                <Button>Thêm mới</Button>
              </Link>
            </Space>
          </Card>
        </Col>

        {/* Orders Management Card (Coming Soon) */}
        <Col xs={24} md={12}>
          <Card title="Đơn hàng">
            <Space>
              <Button disabled>Sắp ra mắt</Button>
            </Space>
          </Card>
        </Col>

      </Row>
    </div>
  );
}
