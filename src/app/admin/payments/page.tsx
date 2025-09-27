'use client';

import {
  Card,
  Form,
  Input,
  Button,
  Row,
  Col,
  Select,
  Table,
  Space,
  Typography,
  Badge,
  Tag,
  Tooltip,
  Dropdown,
  MenuProps,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  EditOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import { useState, useEffect } from 'react';
import PaymentDetailModal from './components/PaymentDetailModal';
import PaymentStatusModal from './components/PaymentStatusModal';

const { Title, Text } = Typography;

interface Payment {
  id: string;
  amount: number;
  method: string;
  status: string;
  gatewayTransactionId: string | null;
  paidAt: Date | null;
  failureReason: string | null;
  refundedAt: Date | null;
  refundAmount: number | null;
  createdAt: Date;
  updatedAt: Date;
  order: {
    id: string;
    orderNumber: string;
    amount: number;
    status: string;
    customerName: string;
    customerEmail: string;
    createdAt: Date;
    account: {
      id: string;
      rank: string | null;
      price: number;
    };
  };
}

export default function AdminPaymentsPage() {
  const [form] = Form.useForm();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<Record<string, { count: number; totalAmount: number }>>({});
  const [methodStats, setMethodStats] = useState<Record<string, { count: number; totalAmount: number }>>({});
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  });
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const formValues = form.getFieldsValue();
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        pageSize: pagination.pageSize.toString(),
        ...(formValues.search && { search: formValues.search }),
        ...(formValues.status && formValues.status !== 'ALL' && { status: formValues.status }),
        ...(formValues.method && formValues.method !== 'ALL' && { method: formValues.method }),
        ...(formValues.sortBy && { sortBy: formValues.sortBy }),
        ...(formValues.sortOrder && { sortOrder: formValues.sortOrder }),
      });

      const response = await fetch(`/api/admin/payments?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Có lỗi xảy ra khi tải thanh toán');
      }

      setPayments(data.payments);
      setStats(data.stats);
      setMethodStats(data.methodStats);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePaymentStatus = async (paymentId: string, status: string, failureReason?: string, refundAmount?: number) => {
    try {
      const response = await fetch('/api/admin/payments', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId,
          status,
          failureReason,
          refundAmount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Có lỗi xảy ra khi cập nhật thanh toán');
      }

      await fetchPayments(); // Reload data after successful update
      return { success: true };
    } catch (error) {
      console.error('Error updating payment:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Có lỗi xảy ra' };
    }
  };

  const openViewModal = (payment: Payment) => {
    setSelectedPayment(payment);
    setModalMode('view');
    setModalOpen(true);
  };

  const openEditModal = (payment: Payment) => {
    setSelectedPayment(payment);
    setModalMode('edit');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedPayment(null);
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'PENDING': 'Chờ thanh toán',
      'SUCCESS': 'Thành công',
      'FAILED': 'Thất bại',
      'CANCELLED': 'Đã hủy',
      'REFUNDED': 'Đã hoàn tiền',
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      'PENDING': 'orange',
      'SUCCESS': 'green',
      'FAILED': 'red',
      'CANCELLED': 'gray',
      'REFUNDED': 'blue',
    };
    return colorMap[status] || 'default';
  };

  const getPaymentMethodText = (method: string) => {
    const methodMap: Record<string, string> = {
      'VNPAY': 'VNPay',
      'ZALOPAY': 'ZaloPay',
      'BANK': 'Chuyển khoản',
      'MOMO': 'MoMo',
    };
    return methodMap[method] || method;
  };

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

  const onSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchPayments();
  };

  const onReset = () => {
    form.resetFields();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchPayments();
  };

  const onTableChange = (pagination: any) => {
    setPagination(prev => ({
      ...prev,
      page: pagination.current,
      pageSize: pagination.pageSize,
    }));
  };

  useEffect(() => {
    fetchPayments();
  }, [pagination.page, pagination.pageSize]);

  const columns: ColumnsType<Payment> = [
    {
      title: 'Mã giao dịch',
      dataIndex: 'gatewayTransactionId',
      key: 'gatewayTransactionId',
      width: 150,
      render: (text: string) => (
        <Text code className="text-xs">
          {text || 'N/A'}
        </Text>
      ),
    },
    {
      title: 'Đơn hàng',
      key: 'order',
      width: 200,
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.order.orderNumber}</div>
          <div className="text-xs text-gray-500">{record.order.customerName}</div>
        </div>
      ),
    },
    {
      title: 'Phương thức',
      dataIndex: 'method',
      key: 'method',
      width: 120,
      render: (method: string) => (
        <Tag color="blue">{getPaymentMethodText(method)}</Tag>
      ),
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      render: (amount: number) => (
        <Text strong className="text-green-600">
          {formatCurrency(amount)}
        </Text>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Badge
          color={getStatusColor(status)}
          text={getStatusText(status)}
        />
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date: Date) => (
        <Text className="text-xs">{formatDate(date)}</Text>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record) => {
        const items: MenuProps['items'] = [
          {
            key: 'view',
            label: 'Xem chi tiết',
            icon: <EyeOutlined />,
            onClick: () => openViewModal(record),
          },
        ];

        if (record.status === 'PENDING' || record.status === 'FAILED') {
          items.push({
            key: 'update',
            label: 'Cập nhật trạng thái',
            icon: <EditOutlined />,
            onClick: () => openEditModal(record),
          });
        }

        return (
          <Space>
            <Dropdown menu={{ items }} trigger={['click']}>
              <Button type="text" icon={<MoreOutlined />} />
            </Dropdown>
          </Space>
        );
      },
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <Title level={2} className="!mb-2">
          Quản lý thanh toán
        </Title>
        <Text type="secondary">
          Quản lý và theo dõi tất cả giao dịch thanh toán trong hệ thống
        </Text>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        {Object.entries(stats).map(([status, data]) => (
          <Col xs={24} sm={12} md={6} key={status}>
            <Card size="small">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {data.count}
                </div>
                <div className="text-sm text-gray-600">
                  {getStatusText(status)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {formatCurrency(data.totalAmount)}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Search and Filter */}
      <Card className="mb-6">
        <Form
          form={form}
          layout="inline"
          onFinish={onSearch}
          className="w-full"
        >
          <Row gutter={[16, 16]} className="w-full">
            <Col xs={24} sm={12} md={6}>
              <Form.Item name="search" className="!mb-0">
                <Input
                  placeholder="Tìm kiếm theo mã giao dịch, đơn hàng..."
                  prefix={<SearchOutlined />}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Form.Item name="status" className="!mb-0">
                <Select placeholder="Trạng thái" allowClear>
                  <Select.Option value="ALL">Tất cả</Select.Option>
                  <Select.Option value="PENDING">Chờ thanh toán</Select.Option>
                  <Select.Option value="SUCCESS">Thành công</Select.Option>
                  <Select.Option value="FAILED">Thất bại</Select.Option>
                  <Select.Option value="CANCELLED">Đã hủy</Select.Option>
                  <Select.Option value="REFUNDED">Đã hoàn tiền</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Form.Item name="method" className="!mb-0">
                <Select placeholder="Phương thức" allowClear>
                  <Select.Option value="ALL">Tất cả</Select.Option>
                  <Select.Option value="VNPAY">VNPay</Select.Option>
                  <Select.Option value="ZALOPAY">ZaloPay</Select.Option>
                  <Select.Option value="BANK">Chuyển khoản</Select.Option>
                  <Select.Option value="MOMO">MoMo</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Form.Item name="sortBy" className="!mb-0">
                <Select placeholder="Sắp xếp theo">
                  <Select.Option value="createdAt">Ngày tạo</Select.Option>
                  <Select.Option value="amount">Số tiền</Select.Option>
                  <Select.Option value="status">Trạng thái</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Space>
                <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                  Tìm kiếm
                </Button>
                <Button onClick={onReset} icon={<ReloadOutlined />}>
                  Làm mới
                </Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* Payments Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={payments}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.page,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} giao dịch`,
          }}
          onChange={onTableChange}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Modals */}
      <PaymentDetailModal
        open={modalOpen && modalMode === 'view'}
        payment={selectedPayment}
        onClose={closeModal}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
        getStatusText={getStatusText}
        getStatusColor={getStatusColor}
        getPaymentMethodText={getPaymentMethodText}
      />

      <PaymentStatusModal
        open={modalOpen && modalMode === 'edit'}
        payment={selectedPayment}
        onClose={closeModal}
        onSuccess={() => {
          closeModal();
          // Refresh data will be handled by the hook
        }}
      />
    </div>
  );
}
