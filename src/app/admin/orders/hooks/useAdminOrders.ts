'use client';

import { useEffect, useState } from 'react';
import { Form, App } from 'antd';

export interface AdminOrder {
  id: string;
  orderNumber: string;
  userId: string;
  accountId: string;
  amount: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';
  customerEmail: string;
  customerName: string;
  deliveredAt: Date | null;
  deliveryMethod: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string;
    role: string;
  };
  account: {
    id: string;
    rank: string | null;
    price: number;
    heroesCount: number;
    skinsCount: number;
    description: string | null;
    images: string[];
    level: number | null;
    matches: number | null;
    winRate: number | null;
    reputation: number | null;
    gameUsername?: string | null;
    gamePassword?: string | null;
    loginMethod?: string | null;
    additionalInfo?: string | null;
  };
  payments: {
    id: string;
    amount: number;
    method: string;
    status: string;
    paidAt: Date | null;
    createdAt: Date;
  }[];
}

export interface OrderStats {
  [key: string]: {
    count: number;
    totalAmount: number;
  };
}

export interface OrderPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export default function useAdminOrders() {
  const [form] = Form.useForm();
  const { message, modal } = App.useApp();

  // Data state
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [stats, setStats] = useState<OrderStats>({});
  const [pagination, setPagination] = useState<OrderPagination>({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  });
  const [loading, setLoading] = useState(false);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const formValues = form.getFieldsValue();
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        pageSize: pagination.pageSize.toString(),
        ...(formValues.search && { search: formValues.search }),
        ...(formValues.status && formValues.status !== 'ALL' && { status: formValues.status }),
        ...(formValues.sortBy && { sortBy: formValues.sortBy }),
        ...(formValues.sortOrder && { sortOrder: formValues.sortOrder }),
      });

      const response = await fetch(`/api/admin/orders?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Có lỗi xảy ra khi tải đơn hàng');
      }

      setOrders(data.orders);
      setStats(data.stats);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching orders:', error);
      message.error(error instanceof Error ? error.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string, notes?: string) => {
    try {
      const response = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          status,
          notes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Có lỗi xảy ra khi cập nhật đơn hàng');
      }

      message.success('Cập nhật đơn hàng thành công');
      await fetchOrders();
      return { success: true };
    } catch (error) {
      console.error('Error updating order:', error);
      message.error(error instanceof Error ? error.message : 'Có lỗi xảy ra');
      return { success: false };
    }
  };

  const deleteOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Có lỗi xảy ra khi xóa đơn hàng');
      }

      message.success('Xóa đơn hàng thành công');
      await fetchOrders();
      return { success: true };
    } catch (error) {
      console.error('Error deleting order:', error);
      message.error(error instanceof Error ? error.message : 'Có lỗi xảy ra');
      return { success: false };
    }
  };

  const openViewModal = (order: AdminOrder) => {
    setSelectedOrder(order);
    setModalMode('view');
    setModalOpen(true);
  };

  const openEditModal = (order: AdminOrder) => {
    setSelectedOrder(order);
    setModalMode('edit');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedOrder(null);
  };

  const handleDelete = (order: AdminOrder) => {
    modal.confirm({
      title: 'Xác nhận xóa đơn hàng',
      content: `Bạn có chắc chắn muốn xóa đơn hàng ${order.orderNumber}? Hành động này không thể hoàn tác.`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: () => deleteOrder(order.id),
    });
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'PENDING': 'Chờ thanh toán',
      'PROCESSING': 'Đang xử lý',
      'COMPLETED': 'Hoàn thành',
      'CANCELLED': 'Đã hủy',
      'REFUNDED': 'Đã hoàn tiền',
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      'PENDING': 'orange',
      'PROCESSING': 'blue',
      'COMPLETED': 'green',
      'CANCELLED': 'red',
      'REFUNDED': 'gray',
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
    fetchOrders();
  };

  const onReset = () => {
    form.resetFields();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchOrders();
  };

  const onTableChange = (pagination: any) => {
    setPagination(prev => ({
      ...prev,
      page: pagination.current,
      pageSize: pagination.pageSize,
    }));
  };

  useEffect(() => {
    fetchOrders();
  }, [pagination.page, pagination.pageSize]);

  return {
    form,
    orders,
    stats,
    pagination,
    loading,
    modalOpen,
    selectedOrder,
    modalMode,
    fetchOrders,
    updateOrderStatus,
    deleteOrder,
    openViewModal,
    openEditModal,
    closeModal,
    handleDelete,
    getStatusText,
    getStatusColor,
    getPaymentMethodText,
    formatCurrency,
    formatDate,
    onSearch,
    onReset,
    onTableChange,
  };
}
