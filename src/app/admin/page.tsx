"use client";

import { Card, Row, Col, Typography, Button, Space } from "antd";
import Link from "next/link";

/**
 * Admin Dashboard Page
 * Main admin interface with navigation to different management sections
 * @returns JSX element
 */
export default function AdminDashboardPage() {
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
