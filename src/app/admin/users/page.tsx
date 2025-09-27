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
  Modal,
  message,
  App,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useState, useEffect } from 'react';

const { Title, Text } = Typography;

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  emailVerifiedAt: Date | null;
  twoFactorEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    orders: number;
  };
  orderStats: Record<string, { count: number; totalAmount: number }>;
}

export default function AdminUsersPage() {
  const [form] = Form.useForm();
  const { modal } = App.useApp();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  });
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');
  const [editForm] = Form.useForm();
  const [editLoading, setEditLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const formValues = form.getFieldsValue();
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        pageSize: pagination.pageSize.toString(),
        ...(formValues.search && { search: formValues.search }),
        ...(formValues.role && formValues.role !== 'ALL' && { role: formValues.role }),
        ...(formValues.sortBy && { sortBy: formValues.sortBy }),
        ...(formValues.sortOrder && { sortOrder: formValues.sortOrder }),
      });

      const response = await fetch(`/api/admin/users?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Có lỗi xảy ra khi tải người dùng');
      }

      setUsers(data.users);
      setStats(data.stats);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching users:', error);
      message.error(error instanceof Error ? error.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userId: string, data: { name: string; email: string; role: string }) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          ...data,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Có lỗi xảy ra khi cập nhật người dùng');
      }

      message.success('Cập nhật người dùng thành công');
      await fetchUsers();
      return { success: true };
    } catch (error) {
      console.error('Error updating user:', error);
      message.error(error instanceof Error ? error.message : 'Có lỗi xảy ra');
      return { success: false };
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users?userId=${userId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Có lỗi xảy ra khi xóa người dùng');
      }

      message.success('Xóa người dùng thành công');
      await fetchUsers();
      return { success: true };
    } catch (error) {
      console.error('Error deleting user:', error);
      message.error(error instanceof Error ? error.message : 'Có lỗi xảy ra');
      return { success: false };
    }
  };

  const openViewModal = (user: User) => {
    setSelectedUser(user);
    setModalMode('view');
    setModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setModalMode('edit');
    setModalOpen(true);
    editForm.setFieldsValue({
      name: user.name || '',
      email: user.email,
      role: user.role,
    });
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedUser(null);
    editForm.resetFields();
  };

  const handleEditSubmit = async (values: any) => {
    if (!selectedUser) return;

    setEditLoading(true);
    try {
      const result = await updateUser(selectedUser.id, values);
      if (result.success) {
        closeModal();
        await fetchUsers(); // Reload data after successful update
      }
    } catch (error) {
      console.error('Error updating user:', error);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = (user: User) => {
    modal.confirm({
      title: 'Xác nhận xóa người dùng',
      content: `Bạn có chắc chắn muốn xóa người dùng ${user.name || user.email}? Hành động này không thể hoàn tác.`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        const result = await deleteUser(user.id);
        if (result.success) {
          await fetchUsers(); // Reload data after successful deletion
        }
      },
    });
  };

  const getRoleText = (role: string) => {
    return role === 'ADMIN' ? 'Quản trị viên' : 'Người dùng';
  };

  const getRoleColor = (role: string) => {
    return role === 'ADMIN' ? 'red' : 'blue';
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
    fetchUsers();
  };

  const onReset = () => {
    form.resetFields();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchUsers();
  };

  const onTableChange = (pagination: any) => {
    setPagination(prev => ({
      ...prev,
      page: pagination.current,
      pageSize: pagination.pageSize,
    }));
  };

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, pagination.pageSize]);

  const columns: ColumnsType<User> = [
    {
      title: 'Thông tin',
      key: 'info',
      width: 250,
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.name || 'N/A'}</div>
          <div className="text-sm text-gray-500">{record.email}</div>
          <div className="text-xs text-gray-400">
            ID: {record.id}
          </div>
        </div>
      ),
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      width: 120,
      render: (role: string) => (
        <Tag color={getRoleColor(role)}>
          {getRoleText(role)}
        </Tag>
      ),
    },
    {
      title: 'Xác thực',
      key: 'verification',
      width: 120,
      render: (_, record) => (
        <div className="text-center">
          <Badge
            status={record.emailVerifiedAt ? 'success' : 'default'}
            text={record.emailVerifiedAt ? 'Đã xác thực' : 'Chưa xác thực'}
          />
        </div>
      ),
    },
    {
      title: 'Đơn hàng',
      key: 'orders',
      width: 100,
      render: (_, record) => (
        <div className="text-center">
          <div className="font-medium">{record._count.orders}</div>
          <div className="text-xs text-gray-500">đơn hàng</div>
        </div>
      ),
    },
    {
      title: 'Tổng chi tiêu',
      key: 'totalSpent',
      width: 150,
      render: (_, record) => {
        const totalSpent = Object.values(record.orderStats)
          .reduce((sum, stat) => sum + stat.totalAmount, 0);
        return (
          <div className="text-right">
            <div className="font-medium text-green-600">
              {formatCurrency(totalSpent)}
            </div>
          </div>
        );
      },
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
          {
            key: 'edit',
            label: 'Chỉnh sửa',
            icon: <EditOutlined />,
            onClick: () => openEditModal(record),
          },
        ];

        // Only allow delete if user has no orders
        if (record._count.orders === 0) {
          items.push({
            key: 'delete',
            label: 'Xóa người dùng',
            icon: <DeleteOutlined />,
            danger: true,
            onClick: () => handleDelete(record),
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
          Quản lý người dùng
        </Title>
        <Text type="secondary">
          Quản lý tài khoản người dùng và phân quyền trong hệ thống
        </Text>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        {Object.entries(stats).map(([role, count]) => (
          <Col xs={24} sm={12} md={6} key={role}>
            <Card size="small">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {count}
                </div>
                <div className="text-sm text-gray-600">
                  {getRoleText(role)}
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
                  placeholder="Tìm kiếm theo tên, email..."
                  prefix={<SearchOutlined />}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Form.Item name="role" className="!mb-0">
                <Select placeholder="Vai trò" allowClear>
                  <Select.Option value="ALL">Tất cả</Select.Option>
                  <Select.Option value="USER">Người dùng</Select.Option>
                  <Select.Option value="ADMIN">Quản trị viên</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Form.Item name="sortBy" className="!mb-0">
                <Select placeholder="Sắp xếp theo">
                  <Select.Option value="createdAt">Ngày tạo</Select.Option>
                  <Select.Option value="name">Tên</Select.Option>
                  <Select.Option value="email">Email</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Form.Item name="sortOrder" className="!mb-0">
                <Select placeholder="Thứ tự">
                  <Select.Option value="desc">Mới nhất</Select.Option>
                  <Select.Option value="asc">Cũ nhất</Select.Option>
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

      {/* Users Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.page,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} người dùng`,
          }}
          onChange={onTableChange}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* User Detail Modal */}
      <Modal
        title={`Chi tiết người dùng ${selectedUser?.name || selectedUser?.email}`}
        open={modalOpen && modalMode === 'view'}
        onCancel={closeModal}
        footer={null}
        width={600}
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Text strong>Tên:</Text>
                <div>{selectedUser.name || 'N/A'}</div>
              </div>
              <div>
                <Text strong>Email:</Text>
                <div>{selectedUser.email}</div>
              </div>
              <div>
                <Text strong>Vai trò:</Text>
                <div>
                  <Tag color={getRoleColor(selectedUser.role)}>
                    {getRoleText(selectedUser.role)}
                  </Tag>
                </div>
              </div>
              <div>
                <Text strong>Xác thực email:</Text>
                <div>
                  <Badge
                    status={selectedUser.emailVerifiedAt ? 'success' : 'default'}
                    text={selectedUser.emailVerifiedAt ? 'Đã xác thực' : 'Chưa xác thực'}
                  />
                </div>
              </div>
              <div>
                <Text strong>2FA:</Text>
                <div>
                  <Badge
                    status={selectedUser.twoFactorEnabled ? 'success' : 'default'}
                    text={selectedUser.twoFactorEnabled ? 'Bật' : 'Tắt'}
                  />
                </div>
              </div>
              <div>
                <Text strong>Ngày tạo:</Text>
                <div>{formatDate(selectedUser.createdAt)}</div>
              </div>
            </div>

            <div>
              <Text strong>Thống kê đơn hàng:</Text>
              <div className="mt-2 space-y-2">
                <div className="flex justify-between">
                  <span>Tổng đơn hàng:</span>
                  <span className="font-medium">{selectedUser._count.orders}</span>
                </div>
                {Object.entries(selectedUser.orderStats).map(([status, data]) => (
                  <div key={status} className="flex justify-between">
                    <span>{status}:</span>
                    <span>{data.count} đơn ({formatCurrency(data.totalAmount)})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit User Modal */}
      <Modal
        title={`Chỉnh sửa người dùng ${selectedUser?.name || selectedUser?.email}`}
        open={modalOpen && modalMode === 'edit'}
        onCancel={closeModal}
        footer={null}
        width={600}
      >
        {selectedUser && (
          <Form
            form={editForm}
            layout="vertical"
            onFinish={handleEditSubmit}
            className="space-y-4"
          >
            <Form.Item
              name="name"
              label="Tên"
              rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
            >
              <Input placeholder="Nhập tên người dùng" />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Vui lòng nhập email' },
                { type: 'email', message: 'Email không hợp lệ' }
              ]}
            >
              <Input placeholder="Nhập email" />
            </Form.Item>

            <Form.Item
              name="role"
              label="Vai trò"
              rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
            >
              <Select placeholder="Chọn vai trò">
                <Select.Option value="USER">Người dùng</Select.Option>
                <Select.Option value="ADMIN">Quản trị viên</Select.Option>
              </Select>
            </Form.Item>

            <div className="flex justify-end gap-2 pt-4">
              <Button onClick={closeModal}>
                Hủy
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={editLoading}
              >
                Cập nhật
              </Button>
            </div>
          </Form>
        )}
      </Modal>
    </div>
  );
}
