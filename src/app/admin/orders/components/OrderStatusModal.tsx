'use client';

import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Select,
  Input,
  Button,
  Space,
  Typography,
  Alert,
} from 'antd';
import { AdminOrder } from '../hooks/useAdminOrders';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface OrderStatusModalProps {
  open: boolean;
  order: AdminOrder | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function OrderStatusModal({
  open,
  order,
  onClose,
  onSuccess,
}: OrderStatusModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const statusOptions = [
    { value: 'PENDING', label: 'Chờ thanh toán', color: 'orange' },
    { value: 'PROCESSING', label: 'Đang xử lý', color: 'blue' },
    { value: 'COMPLETED', label: 'Hoàn thành', color: 'green' },
    { value: 'CANCELLED', label: 'Đã hủy', color: 'red' },
    { value: 'REFUNDED', label: 'Đã hoàn tiền', color: 'gray' },
  ];

  const handleSubmit = async (values: any) => {
    if (!order) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: order.id,
          status: values.status,
          notes: values.notes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Có lỗi xảy ra khi cập nhật đơn hàng');
      }

      // Show success message
      setError(null);
      setSuccess(true);
      // Show success state
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    form.resetFields();
    setError(null);
    setSuccess(false);
    onClose();
  };

  // Initialize form when order changes
  useEffect(() => {
    if (order) {
      form.setFieldsValue({
        status: order.status,
        notes: order.notes || '',
      });
    }
  }, [order, form]);

  if (!order) return null;

  return (
    <Modal
      title={`Cập nhật trạng thái đơn hàng ${order.orderNumber}`}
      open={open}
      onCancel={handleClose}
      footer={null}
      width={600}
    >
      <div className="space-y-4">
        {/* Order Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <Title level={5} className="!mb-2">Thông tin đơn hàng</Title>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Text strong>Khách hàng:</Text>
              <div>{order.customerName}</div>
              <div className="text-gray-500">{order.customerEmail}</div>
            </div>
            <div>
              <Text strong>Giá trị:</Text>
              <div className="text-green-600 font-medium">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                }).format(order.amount)}
              </div>
            </div>
            <div>
              <Text strong>Trạng thái hiện tại:</Text>
              <div>
                <span className={`px-2 py-1 rounded text-xs ${
                  order.status === 'PENDING' ? 'bg-orange-100 text-orange-800' :
                  order.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
                  order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                  order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {statusOptions.find(s => s.value === order.status)?.label}
                </span>
              </div>
            </div>
            <div>
              <Text strong>Tài khoản:</Text>
              <div>{order.account.rank || 'N/A'}</div>
              <div className="text-gray-500">
                {order.account.heroesCount} tướng • {order.account.skinsCount} skin
              </div>
            </div>
          </div>
        </div>

        {/* Success Alert */}
        {success && (
          <Alert
            message="Thành công"
            description="Cập nhật trạng thái đơn hàng thành công!"
            type="success"
            showIcon
          />
        )}

        {/* Error Alert */}
        {error && (
          <Alert
            message="Lỗi"
            description={error}
            type="error"
            showIcon
            closable
            onClose={() => setError(null)}
          />
        )}

        {/* Form */}
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="space-y-4"
        >
          <Form.Item
            name="status"
            label="Trạng thái mới"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
          >
            <Select
              placeholder="Chọn trạng thái mới"
              size="large"
            >
              {statusOptions.map((option) => (
                <Select.Option key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full bg-${option.color}-500`} />
                    {option.label}
                  </div>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="notes"
            label="Ghi chú (tùy chọn)"
          >
            <TextArea
              rows={4}
              placeholder="Nhập ghi chú về việc thay đổi trạng thái..."
              maxLength={500}
              showCount
            />
          </Form.Item>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <Text className="text-yellow-800 text-sm">
              <strong>Lưu ý:</strong> Khi chuyển đơn hàng sang trạng thái &quot;Hoàn thành&quot;, 
              tài khoản sẽ được đánh dấu là &quot;Đã bán&quot; và thông tin đăng nhập sẽ được 
              gửi cho khách hàng.
            </Text>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button onClick={handleClose}>
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
            >
              Cập nhật trạng thái
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
}