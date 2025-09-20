"use client";

import { Button, Modal, Form, Input, Select, message } from "antd";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type Props = {
  accountId?: string;
  price?: number;
  onClick?: () => void;
};

export default function PurchaseButton({ accountId, price, onClick }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { data: session } = useSession();
  const router = useRouter();

  const handlePurchase = () => {
    if (!session) {
      message.warning('Vui lòng đăng nhập để mua tài khoản');
      router.push('/auth/login');
      return;
    }
    
    if (onClick) {
      onClick();
    } else {
      setIsModalOpen(true);
      // Pre-fill form with user data
      form.setFieldsValue({
        customerName: session.user?.name || '',
        customerEmail: session.user?.email || '',
        paymentMethod: 'VNPAY',
      });
    }
  };

  const handleSubmit = async (values: Record<string, any>) => {
    setLoading(true);
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountId,
          ...values,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        message.success('Đơn hàng đã được tạo thành công!');
        
        if (data.paymentUrl) {
          // Redirect to payment gateway
          window.location.href = data.paymentUrl;
        } else {
          setIsModalOpen(false);
          message.info('Vui lòng chờ xác nhận thanh toán');
        }
      } else {
        message.error(data.error || 'Có lỗi xảy ra khi tạo đơn hàng');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      message.error('Có lỗi xảy ra khi tạo đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        type="primary"
        size="large"
        className="w-full h-14 text-lg font-bold rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.02] relative overflow-hidden group"
        style={{
          background:
            "linear-gradient(135deg, #F59E0B 0%, #D97706 50%, #B45309 100%)",
          border: "none",
          boxShadow: "0 10px 25px rgba(245, 158, 11, 0.3)",
        }}
        icon={
          <span className="text-xl group-hover:scale-110 transition-transform duration-300">
            🛒
          </span>
        }
        onClick={handlePurchase}>
        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <span className="relative z-10 drop-shadow-sm">Mua ngay</span>
      </Button>

      <Modal
        title="Thông tin thanh toán"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-4"
        >
          <Form.Item
            name="customerName"
            label="Họ và tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
          >
            <Input placeholder="Nhập họ và tên của bạn" />
          </Form.Item>

          <Form.Item
            name="customerEmail"
            label="Email nhận thông tin tài khoản"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' },
            ]}
          >
            <Input placeholder="Nhập email để nhận thông tin tài khoản" />
          </Form.Item>

          <Form.Item
            name="paymentMethod"
            label="Phương thức thanh toán"
            rules={[{ required: true, message: 'Vui lòng chọn phương thức thanh toán' }]}
          >
            <Select placeholder="Chọn phương thức thanh toán">
              <Select.Option value="VNPAY">VNPay</Select.Option>
              <Select.Option value="ZALOPAY">ZaloPay</Select.Option>
              <Select.Option value="MOMO">MoMo</Select.Option>
              <Select.Option value="BANK">Chuyển khoản ngân hàng</Select.Option>
            </Select>
          </Form.Item>

          {price && (
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Tổng thanh toán:</span>
                <span className="text-xl font-bold text-blue-600">
                  {new Intl.NumberFormat('vi-VN').format(price)}₫
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button onClick={() => setIsModalOpen(false)} className="flex-1">
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="flex-1"
            >
              {loading ? 'Đang xử lý...' : 'Thanh toán'}
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
}
